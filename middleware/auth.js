'use strict';
// ═══════════════════════════════════════════
//  AUTH MIDDLEWARE
// ═══════════════════════════════════════════
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const AppError = require('../utils/AppError');
const { asyncHandler } = require('../utils/helpers');

// ── Protect: requires valid JWT ────────────
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback to httpOnly cookie
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) throw new AppError('Not authenticated. Please log in.', 401);

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check user still exists
  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw new AppError('User no longer exists.', 401);

  // Check if user changed password after token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    throw new AppError('Password was recently changed. Please log in again.', 401);
  }

  req.user = user;
  next();
});

// ── Restrict to specific roles ─────────────
exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

// ── Optional auth (doesn't fail if no token) ──
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    } catch (_) { /* ignore */ }
  }
  next();
});
