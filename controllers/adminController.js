'use strict';
// ═══════════════════════════════════════════
//  ADMIN CONTROLLER
// ═══════════════════════════════════════════
const User     = require('../models/User');
const { Contact, Newsletter, Booking, Blog } = require('../models/index');
const AppError = require('../utils/AppError');
const { asyncHandler, sendSuccess, getPagination, buildMeta } = require('../utils/helpers');

/* ────────────── DASHBOARD ──────────────── */

exports.getDashboard = asyncHandler(async (req, res) => {
  const now      = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers, newUsersThisMonth, newUsersLastMonth,
    totalBookings, pendingBookings, bookingsThisMonth,
    totalContacts, unreadContacts,
    totalSubscribers, activeSubscribers,
    totalPosts, publishedPosts,
    recentBookings, recentContacts,
    bookingsByStatus, bookingsByConcern
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role:'user', createdAt: { $gte: thisMonth } }),
    User.countDocuments({ role:'user', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } }),

    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ createdAt: { $gte: thisMonth } }),

    Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' }),

    Newsletter.countDocuments(),
    Newsletter.countDocuments({ isActive: true }),

    Blog.countDocuments(),
    Blog.countDocuments({ status: 'published' }),

    Booking.find().sort('-createdAt').limit(5).lean(),
    Contact.find().sort('-createdAt').limit(5).lean(),

    Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Booking.aggregate([
      { $group: { _id: '$concern', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 6 }
    ])
  ]);

  const userGrowth = newUsersLastMonth > 0
    ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1)
    : 100;

  sendSuccess(res, {
    message: 'Dashboard data fetched',
    data: {
      stats: {
        users:       { total: totalUsers, thisMonth: newUsersThisMonth, growth: parseFloat(userGrowth) },
        bookings:    { total: totalBookings, pending: pendingBookings, thisMonth: bookingsThisMonth },
        contacts:    { total: totalContacts, unread: unreadContacts },
        newsletter:  { total: totalSubscribers, active: activeSubscribers },
        blog:        { total: totalPosts, published: publishedPosts }
      },
      charts: { bookingsByStatus, bookingsByConcern },
      recent: { bookings: recentBookings, contacts: recentContacts }
    }
  });
});

/* ────────────── USERS ──────────────────── */

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role, search, isActive } = req.query;

  const filter = {};
  if (role)     filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search)   filter.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    User.countDocuments(filter)
  ]);

  sendSuccess(res, { message: 'Users fetched', data: { users }, meta: buildMeta({ page, limit, total }) });
});

exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { message: 'User fetched', data: { user } });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const allowed = ['name','email','role','isActive'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { message: 'User updated', data: { user } });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, { message: 'User deleted' });
});

/* ────────────── CONTACTS ───────────────── */

exports.getAllContacts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { email:     { $regex: search, $options: 'i' } },
    { subject:   { $regex: search, $options: 'i' } }
  ];

  const [contacts, total] = await Promise.all([
    Contact.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Contact.countDocuments(filter)
  ]);

  sendSuccess(res, { message: 'Contacts fetched', data: { contacts }, meta: buildMeta({ page, limit, total }) });
});

exports.updateContact = asyncHandler(async (req, res) => {
  const allowed = ['status','adminNote'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const contact = await Contact.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!contact) throw new AppError('Contact not found', 404);
  sendSuccess(res, { message: 'Contact updated', data: { contact } });
});

exports.deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) throw new AppError('Contact not found', 404);
  sendSuccess(res, { message: 'Contact deleted' });
});

/* ────────────── BOOKINGS ───────────────── */

exports.getAllBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, sessionType, concern, search } = req.query;

  const filter = {};
  if (status)      filter.status      = status;
  if (sessionType) filter.sessionType = sessionType;
  if (concern)     filter.concern     = concern;
  if (search)      filter.$or = [
    { firstName:  { $regex: search, $options: 'i' } },
    { lastName:   { $regex: search, $options: 'i' } },
    { email:      { $regex: search, $options: 'i' } },
    { bookingRef: { $regex: search, $options: 'i' } }
  ];

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort('-createdAt').skip(skip).limit(limit)
      .populate('assignedTo','name email').lean(),
    Booking.countDocuments(filter)
  ]);

  sendSuccess(res, { message: 'Bookings fetched', data: { bookings }, meta: buildMeta({ page, limit, total }) });
});

exports.updateBooking = asyncHandler(async (req, res) => {
  const allowed = ['status','scheduledAt','adminNote','assignedTo'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  if (req.body.status === 'completed') updates.completedAt = new Date();

  const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!booking) throw new AppError('Booking not found', 404);
  sendSuccess(res, { message: 'Booking updated', data: { booking } });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) throw new AppError('Booking not found', 404);
  sendSuccess(res, { message: 'Booking deleted' });
});

/* ────────────── NEWSLETTER ─────────────── */

exports.getAllSubscribers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const { isActive, search } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.email = { $regex: search, $options: 'i' };

  const [subscribers, total] = await Promise.all([
    Newsletter.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Newsletter.countDocuments(filter)
  ]);

  sendSuccess(res, { message: 'Subscribers fetched', data: { subscribers }, meta: buildMeta({ page, limit, total }) });
});

exports.deleteSubscriber = asyncHandler(async (req, res) => {
  const sub = await Newsletter.findByIdAndDelete(req.params.id);
  if (!sub) throw new AppError('Subscriber not found', 404);
  sendSuccess(res, { message: 'Subscriber deleted' });
});

/* ────────────── BLOG (admin) ───────────── */

exports.getAllPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status, topic, search } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (topic)  filter.topic  = topic;
  if (search) filter.$or = [
    { title:   { $regex: search, $options: 'i' } },
    { excerpt: { $regex: search, $options: 'i' } }
  ];

  const [posts, total] = await Promise.all([
    Blog.find(filter).sort('-createdAt').skip(skip).limit(limit)
      .populate('author','name').lean(),
    Blog.countDocuments(filter)
  ]);

  sendSuccess(res, { message: 'Posts fetched', data: { posts }, meta: buildMeta({ page, limit, total }) });
});
