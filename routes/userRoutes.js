'use strict';
// ═══════════════════════════════════════════
//  USER ROUTES  —  /api/v1/users
// ═══════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const { asyncHandler, sendSuccess } = require('../utils/helpers');
const User = require('../models/User');

router.use(protect);

// GET /api/v1/users/me
router.get('/me', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  sendSuccess(res, { message: 'Profile fetched', data: { user } });
}));

// PATCH /api/v1/users/me  (avatar upload handled separately)
router.patch('/me', asyncHandler(async (req, res) => {
  const allowed = ['name', 'email'];
  const updates = {};
  allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true, runValidators: true
  });
  sendSuccess(res, { message: 'Profile updated', data: { user } });
}));

// DELETE /api/v1/users/me  (soft-delete)
router.delete('/me', asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  sendSuccess(res, { message: 'Account deactivated successfully' });
}));

module.exports = router;
