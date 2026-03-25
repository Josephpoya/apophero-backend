'use strict';
// ═══════════════════════════════════════════
//  BOOKING ROUTES  —  /api/v1/bookings
// ═══════════════════════════════════════════
const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const ctrl       = require('../controllers/mainControllers');
const { protect, optionalAuth } = require('../middleware/auth');
const { bookingRules, validate } = require('../middleware/validators');

const bookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many booking requests. Please try again later.' }
});

// POST /api/v1/bookings          — anyone (logged-in or guest)
router.post('/', bookLimiter, optionalAuth, bookingRules, validate, ctrl.createBooking);

// GET  /api/v1/bookings/my       — authenticated user's own bookings
router.get('/my', protect, ctrl.getMyBookings);

// GET  /api/v1/bookings/ref/:ref — lookup by booking reference
router.get('/ref/:ref', ctrl.getBookingByRef);

module.exports = router;
