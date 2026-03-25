'use strict';
// ═══════════════════════════════════════════
//  AUTH CONTROLLER
// ═══════════════════════════════════════════
const crypto     = require('crypto');
const User       = require('../models/User');
const AppError   = require('../utils/AppError');
const { asyncHandler, sendSuccess } = require('../utils/helpers');
const { sendEmail } = require('../utils/email');

// ── Cookie options ─────────────────────────
const cookieOptions = () => ({
  expires:  new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict'
});

// ── Send token response ────────────────────
const sendTokenResponse = (res, user, statusCode, message) => {
  const token = user.getSignedJWT();
  res.cookie('token', token, cookieOptions());
  user.password = undefined;
  sendSuccess(res, {
    statusCode,
    message,
    data: { token, user }
  });
};

// ── REGISTER ──────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({ name, email, password });

  // Send welcome email (non-blocking)
  sendEmail({ to: email, templateName: 'welcome', templateData: { name } });

  sendTokenResponse(res, user, 201, 'Account created successfully');
});

// ── LOGIN ─────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Fetch user with password
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) throw new AppError('Your account has been deactivated. Contact support.', 403);

  // Update login stats
  user.lastLogin  = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(res, user, 200, 'Logged in successfully');
});

// ── LOGOUT ────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  sendSuccess(res, { message: 'Logged out successfully' });
});

// ── GET ME ────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  sendSuccess(res, { message: 'User profile fetched', data: { user } });
});

// ── UPDATE PROFILE ────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'email'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true, runValidators: true
  });
  sendSuccess(res, { message: 'Profile updated', data: { user } });
});

// ── CHANGE PASSWORD ───────────────────────
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }
  user.password = newPassword;
  await user.save();

  sendTokenResponse(res, user, 200, 'Password changed successfully');
});

// ── FORGOT PASSWORD ───────────────────────
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Always return 200 to prevent email enumeration
  if (!user) {
    return sendSuccess(res, { message: 'If that email exists, a reset link has been sent.' });
  }

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    templateName: 'resetPassword',
    templateData: { name: user.name, resetUrl }
  });

  sendSuccess(res, { message: 'If that email exists, a reset link has been sent.' });
});

// ── RESET PASSWORD ────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken:   hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) throw new AppError('Token is invalid or has expired', 400);

  user.password             = req.body.password;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendTokenResponse(res, user, 200, 'Password reset successful');
});
