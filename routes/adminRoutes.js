'use strict';
// ═══════════════════════════════════════════
//  ADMIN ROUTES  —  /api/v1/admin
//  All routes require: authenticated + admin role
// ═══════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/auth');
const { mongoIdRule, validate } = require('../middleware/validators');

// ── ONE-TIME ADMIN SETUP — DELETE AFTER USE ──
const setupLimiter = require('express-rate-limit')({ windowMs: 60*60*1000, max: 3 });
router.post('/setup-admin', setupLimiter, async (req, res) => {
  try {
    if (req.body.secret !== 'apophero-setup-2026') {
      return res.status(403).json({ success:false, message:'Invalid secret' });
    }
    const User = require('../models/User');
    const { Blog } = require('../models/index');
    let admin = await User.findOne({ email: 'admin@apopherohealth.com' });
    if (admin) {
      admin.password = 'Apophero2026'; admin.role = 'admin'; admin.isActive = true;
      await admin.save();
      return res.json({ success:true, message:'Admin password reset' });
    }
    admin = await User.create({
      name:'Admin', email:'admin@apopherohealth.com',
      password:'Apophero2026', role:'admin', isActive:true, isVerified:true
    });
    return res.json({ success:true, message:'Admin created', id: admin._id });
  } catch(err) {
    return res.status(500).json({ success:false, message:err.message });
  }
});

// Lock every admin route
router.use(protect, restrictTo('admin'));

// ── DASHBOARD ──────────────────────────────
// GET /api/v1/admin/dashboard
router.get('/dashboard', ctrl.getDashboard);

// ── USERS ──────────────────────────────────
// GET    /api/v1/admin/users
// GET    /api/v1/admin/users/:id
// PATCH  /api/v1/admin/users/:id
// DELETE /api/v1/admin/users/:id
router.get('/users',           ctrl.getAllUsers);
router.get('/users/:id',       mongoIdRule('id'), validate, ctrl.getUser);
router.patch('/users/:id',     mongoIdRule('id'), validate, ctrl.updateUser);
router.delete('/users/:id',    mongoIdRule('id'), validate, ctrl.deleteUser);

// ── CONTACTS ───────────────────────────────
// GET    /api/v1/admin/contacts
// PATCH  /api/v1/admin/contacts/:id
// DELETE /api/v1/admin/contacts/:id
router.get('/contacts',        ctrl.getAllContacts);
router.patch('/contacts/:id',  mongoIdRule('id'), validate, ctrl.updateContact);
router.delete('/contacts/:id', mongoIdRule('id'), validate, ctrl.deleteContact);

// ── BOOKINGS ───────────────────────────────
// GET    /api/v1/admin/bookings
// PATCH  /api/v1/admin/bookings/:id
// DELETE /api/v1/admin/bookings/:id
router.get('/bookings',        ctrl.getAllBookings);
router.patch('/bookings/:id',  mongoIdRule('id'), validate, ctrl.updateBooking);
router.delete('/bookings/:id', mongoIdRule('id'), validate, ctrl.deleteBooking);

// ── NEWSLETTER ─────────────────────────────
// GET    /api/v1/admin/newsletter
// DELETE /api/v1/admin/newsletter/:id
router.get('/newsletter',          ctrl.getAllSubscribers);
router.delete('/newsletter/:id',   mongoIdRule('id'), validate, ctrl.deleteSubscriber);

// ── BLOG (all statuses) ────────────────────
// GET /api/v1/admin/blog
router.get('/blog', ctrl.getAllPosts);
const { uploadPDF } = require('../middleware/upload');
const { asyncHandler, sendSuccess } = require('../utils/helpers');
const cloudinary = require('../config/cloudinary');

// POST /api/v1/admin/guides/upload — upload a PDF guide
router.post('/guides/upload', uploadPDF.single('pdf'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No PDF file uploaded', 400);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Guide uploaded successfully',
    data: {
      url:      req.file.path,
      publicId: req.file.filename,
      name:     req.file.originalname
    }
  });
}));

// GET /api/v1/admin/guides — list all uploaded guides
router.get('/guides', asyncHandler(async (req, res) => {
  const result = await cloudinary.api.resources({
    type:          'upload',
    prefix:        'apophero/guides',
    resource_type: 'raw',
    max_results:   50
  });

  const guides = result.resources.map(r => ({
    name:      r.public_id.replace('apophero/guides/', ''),
    url:       r.secure_url,
    size:      Math.round(r.bytes / 1024) + ' KB',
    createdAt: r.created_at
  }));

  sendSuccess(res, { message: 'Guides fetched', data: { guides } });
}));

// DELETE /api/v1/admin/guides/:publicId — delete a guide
router.delete('/guides/:publicId', asyncHandler(async (req, res) => {
  await cloudinary.uploader.destroy(
    `apophero/guides/${req.params.publicId}`,
    { resource_type: 'raw' }
  );
  sendSuccess(res, { message: 'Guide deleted' });
}));

// GET /api/v1/admin/downloads — all download records
router.get('/downloads', asyncHandler(async (req, res) => {
  const { Download } = require('../models/index');
  const { getPagination, buildMeta, sendSuccess } = require('../utils/helpers');
  const { page, limit, skip } = getPagination(req.query, 20);

  const [downloads, total] = await Promise.all([
    Download.find().sort('-createdAt').skip(skip).limit(limit).lean(),
    Download.countDocuments()
  ]);

  sendSuccess(res, {
    message: 'Downloads fetched',
    data: { downloads },
    meta: buildMeta({ page, limit, total })
  });
}));

// GET /api/v1/admin/downloads/stats — aggregated stats
router.get('/downloads/stats', asyncHandler(async (req, res) => {
  const { Download } = require('../models/index');
  const { sendSuccess } = require('../utils/helpers');

  const [stats, total] = await Promise.all([
    Download.aggregate([
      { $group: {
        _id:   '$guideId',
        title: { $first: '$guideTitle' },
        count: { $sum: 1 },
        lastDownloaded: { $max: '$createdAt' }
      }},
      { $sort: { count: -1 } }
    ]),
    Download.countDocuments()
  ]);

  sendSuccess(res, {
    message: 'Stats fetched',
    data: { stats, total }
  });
}));
module.exports = router;
