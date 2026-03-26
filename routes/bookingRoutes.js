'use strict';
// ═══════════════════════════════════════════
//  BOOKING ROUTES  —  /api/v1/bookings
// ═══════════════════════════════════════════
const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const ctrl       = require('../controllers/mainControllers');
const { protect } = require('../middleware/auth');
const { bookingRules, validate } = require('../middleware/validators');

const bookLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many booking requests. Please try again later.' }
});

// Inline optional auth — avoids import issue
const optionalAuth = async (req, res, next) => {
  try {
    const jwt  = require('jsonwebtoken');
    const User = require('../models/User');
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch (_) { /* ignore — optional */ }
  next();
};

// POST /api/v1/bookings
router.post('/', bookLimiter, optionalAuth, bookingRules, validate, ctrl.createBooking);

// GET  /api/v1/bookings/my
router.get('/my', protect, ctrl.getMyBookings);

// GET  /api/v1/bookings/ref/:ref
router.get('/ref/:ref', ctrl.getBookingByRef);

module.exports = router;