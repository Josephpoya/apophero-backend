'use strict';
// ═══════════════════════════════════════════
//  MAIN CONTROLLERS
// ═══════════════════════════════════════════
const { Contact, Newsletter, Booking, Blog } = require('../models/index');
const AppError   = require('../utils/AppError');
const { asyncHandler, sendSuccess, getPagination, buildMeta, generateRef } = require('../utils/helpers');
const { sendEmail } = require('../utils/email');
const { Contact, Newsletter, Booking, Blog, Download } = require('../models/index');

/* ────────────── CONTACT ────────────────── */

exports.submitContact = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;

  const contact = await Contact.create({
    firstName, lastName, email, subject, message,
    ip: req.ip
  });

  sendEmail({ to: email, templateName: 'contactConfirm',
    templateData: { name: firstName, subject } });

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

  const sub = await Newsletter.findOneAndUpdate(
    { email },
    { email, firstName, isActive: true, source: 'website' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (sub.__v === 0) {
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

  // Auto-subscribe to newsletter
  Newsletter.findOneAndUpdate(
    { email },
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
      .populate('author', 'name avatar')
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
    $or: [
      { slug: req.params.slug },
      { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }
    ]
  }).populate('author', 'name avatar');

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

/* ────────────── DOWNLOADS ──────────────── */

exports.trackDownload = asyncHandler(async (req, res) => {
  const { guideId, guideTitle, firstName, lastName, email, phone } = req.body;

  // Save download record
  const download = await Download.create({
    guideId, guideTitle,
    firstName, lastName, email,
    phone: phone || '',
    ip:        req.ip,
    userAgent: req.headers['user-agent']
  });

  // Auto-subscribe to newsletter
  Newsletter.findOneAndUpdate(
    { email },
    { email, firstName, isActive: true, source: 'download' },
    { upsert: true, setDefaultsOnInsert: true }
  ).catch(() => {});

  // Email notification to admin
  sendEmail({
    to: process.env.FROM_EMAIL,
    subject: `📥 New Guide Download: ${guideTitle}`,
    html: `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#DEE3DF;padding:20px">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
        <div style="background:#161919;padding:24px;text-align:center">
          <span style="font-size:20px;font-weight:700;color:#fff">Apophero <span style="color:#09C8B8">Health</span></span>
        </div>
        <div style="padding:32px">
          <h2 style="color:#161919;margin-bottom:16px">📥 New Guide Download</h2>
          <div style="background:#e3f8f7;border-left:3px solid #09C8B8;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px">
            <p style="margin:0;font-size:14px;color:#161919">
              <strong>Guide:</strong> ${guideTitle}<br>
              <strong>Name:</strong> ${firstName} ${lastName}<br>
              <strong>Email:</strong> ${email}<br>
              <strong>Phone:</strong> ${phone || 'Not provided'}<br>
              <strong>Time:</strong> ${new Date().toLocaleString()}
            </p>
          </div>
          <p style="font-size:13px;color:#848B8C">This person has been automatically added to your newsletter list.</p>
        </div>
      </div>
      </body></html>
    `
  });

  // Send guide link to user by email
  sendEmail({
    to: email,
    subject: `Your free guide is ready — ${guideTitle}`,
    html: `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#DEE3DF;padding:20px">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
        <div style="background:#161919;padding:24px;text-align:center">
          <span style="font-size:20px;font-weight:700;color:#fff">Apophero <span style="color:#09C8B8">Health</span></span>
        </div>
        <div style="padding:32px">
          <h2 style="color:#161919">Your guide is ready, ${firstName}! 🎉</h2>
          <p style="color:#705C52;line-height:1.7">Thank you for downloading <strong>${guideTitle}</strong>. Click the button below to access your guide.</p>
          <div style="background:#e3f8f7;border-left:3px solid #09C8B8;padding:14px 18px;border-radius:0 8px 8px 0;margin:20px 0">
            <p style="margin:0;font-size:13px;color:#161919">💡 <strong>Tip:</strong> Save this email so you can access your guide anytime.</p>
          </div>
          <a href="${req.body.guideUrl}" style="display:inline-block;background:#09C8B8;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin:8px 0">
            Download ${guideTitle} →
          </a>
          <hr style="border:none;border-top:1px solid #DEE3DF;margin:24px 0">
          <p style="font-size:13px;color:#848B8C">You've also been added to our newsletter. We'll send you health tips and new guide releases. <a href="${process.env.CLIENT_URL}/api/v1/newsletter/unsubscribe" style="color:#09C8B8">Unsubscribe anytime</a>.</p>
        </div>
      </div>
      </body></html>
    `
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Download tracked successfully',
    data: {
      id:       download._id,
      guideUrl: req.body.guideUrl
    }
  });
});

exports.getDownloadStats = asyncHandler(async (req, res) => {
  const stats = await Download.aggregate([
    {
      $group: {
        _id:   '$guideId',
        title: { $first: '$guideTitle' },
        count: { $sum: 1 },
        lastDownloaded: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  const total = await Download.countDocuments();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCount = await Download.countDocuments({ createdAt: { $gte: today } });

  sendSuccess(res, {
    message: 'Download stats fetched',
    data: { stats, total, todayCount }
  });
});