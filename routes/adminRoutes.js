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

module.exports = router;
