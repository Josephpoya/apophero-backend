'use strict';
// ═══════════════════════════════════════════
//  CONTACT CONTROLLER
// ═══════════════════════════════════════════
const { Contact, Newsletter, Booking, Blog } = require('../models/index');
const AppError   = require('../utils/AppError');
const { asyncHandler, sendSuccess, getPagination, buildMeta, generateRef } = require('../utils/helpers');
const { sendEmail } = require('../utils/email');

/* ────────────── CONTACT ────────────────── */

exports.submitContact = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;

  const contact = await Contact.create({
    firstName, lastName, email, subject, message,
    ip: req.ip
  });

  // Send confirmation to user (non-blocking)
  sendEmail({ to: email, templateName: 'contactConfirm',
    templateData: { name: firstName, subject } });

  // Notify admin
  sendEmail({ to: process.env.FROM_EMAIL, templateName: 'contactAdmin',
    templateData: { name: `${firstName} ${lastName}`, email, subject, message } });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Message received! We will respond within 24 hours.',
    data: { id: contact._id }
  });
});

/* ────────────── NEWSLETTER ─────────────── */

exports.subscribe = asyncHandler(async (req, res) => {
  const { email, firstName = '' } = req.body;

  // Upsert: re-activate if previously unsubscribed
  const sub = await Newsletter.findOneAndUpdate(
    { email },
    { email, firstName, isActive: true, source: 'website' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Send welcome email (only for new subs)
  if (sub.loginCount === 0 || sub.__v === 0) {
    sendEmail({ to: email, templateName: 'newsletterWelcome', templateData: { email } });
  }

  sendSuccess(res, { statusCode: 201, message: 'Successfully subscribed to the newsletter!' });
});

exports.unsubscribe = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const sub = await Newsletter.findOneAndUpdate(
    { unsubscribeToken: token },
    { isActive: false },
    { new: true }
  );

  if (!sub) throw new AppError('Invalid unsubscribe token', 400);

  sendSuccess(res, { message: 'You have been unsubscribed successfully.' });
});

/* ────────────── BOOKINGS ───────────────── */

exports.createBooking = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, sessionType, concern, notes } = req.body;

  const bookingRef = generateRef('APH');

  const booking = await Booking.create({
    bookingRef, firstName, lastName, email,
    phone, sessionType, concern, notes,
    user: req.user?._id || null,
    ip:   req.ip
  });

  // Confirm to user
  sendEmail({ to: email, templateName: 'bookingConfirm',
    templateData: { name: firstName, sessionType, concern, bookingRef } });

  // Notify admin
  sendEmail({ to: process.env.FROM_EMAIL, templateName: 'bookingAdmin',
    templateData: { name: `${firstName} ${lastName}`, email, phone, sessionType, concern, notes, bookingRef } });

  // Also auto-subscribe to newsletter
  Newsletter.findOneAndUpdate({ email },
    { email, firstName, isActive: true, source: 'booking' },
    { upsert: true, setDefaultsOnInsert: true }
  ).catch(() => {});

  sendSuccess(res, {
    statusCode: 201,
    message: 'Booking received! We will confirm within 24 hours.',
    data: { bookingRef, id: booking._id }
  });
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ email: req.user.email })
    .sort('-createdAt').lean();
  sendSuccess(res, { message: 'Bookings fetched', data: { bookings } });
});

exports.getBookingByRef = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ bookingRef: req.params.ref }).lean();
  if (!booking) throw new AppError('Booking not found', 404);
  sendSuccess(res, { message: 'Booking fetched', data: { booking } });
});

/* ────────────── BLOG ───────────────────── */

exports.createPost = asyncHandler(async (req, res) => {
  const post = await Blog.create({ ...req.body, author: req.user._id });
  sendSuccess(res, { statusCode: 201, message: 'Post created', data: { post } });
});

exports.getPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { topic, category, status = 'published', search, featured } = req.query;

  const filter = { status };
  if (topic)    filter.topic    = topic;
  if (category) filter.category = category;
  if (featured) filter.featured = featured === 'true';
  if (search)   filter.$text    = { $search: search };

  const [posts, total] = await Promise.all([
    Blog.find(filter)
      .sort(status === 'published' ? '-publishedAt' : '-createdAt')
      .skip(skip).limit(limit)
      .populate('author','name avatar')
      .lean(),
    Blog.countDocuments(filter)
  ]);

  sendSuccess(res, {
    message: 'Posts fetched',
    data: { posts },
    meta: buildMeta({ page, limit, total })
  });
});

exports.getPost = asyncHandler(async (req, res) => {
  const post = await Blog.findOne({
    $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }]
  }).populate('author','name avatar');

  if (!post) throw new AppError('Post not found', 404);
  if (post.status !== 'published' && req.user?.role !== 'admin') {
    throw new AppError('Post not found', 404);
  }

  await post.incrementViews();
  sendSuccess(res, { message: 'Post fetched', data: { post } });
});

exports.updatePost = asyncHandler(async (req, res) => {
  const post = await Blog.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true
  });
  if (!post) throw new AppError('Post not found', 404);
  sendSuccess(res, { message: 'Post updated', data: { post } });
});

exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Blog.findByIdAndDelete(req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  sendSuccess(res, { message: 'Post deleted' });
});

exports.uploadCover = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);
  const url = `/uploads/${req.file.filename}`;
  if (req.params.id) {
    await Blog.findByIdAndUpdate(req.params.id, { coverImage: url });
  }
  sendSuccess(res, { message: 'Cover uploaded', data: { url } });
});
