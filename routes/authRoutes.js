'use strict';
// ═══════════════════════════════════════════
//  AUTH ROUTES  /api/v1/auth
// ═══════════════════════════════════════════
const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const ctrl       = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerRules, loginRules, forgotPasswordRules,
  resetPasswordRules, changePasswordRules, validate
} = require('../middleware/validators');

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' }
});

router.post('/register',           authLimiter, registerRules,       validate, ctrl.register);
router.post('/login',              authLimiter, loginRules,          validate, ctrl.login);
router.post('/logout',             ctrl.logout);
router.post('/forgot-password',    authLimiter, forgotPasswordRules, validate, ctrl.forgotPassword);
router.patch('/reset-password/:token', authLimiter, resetPasswordRules, validate, ctrl.resetPassword);

// Protected
router.use(protect);
router.get('/me',             ctrl.getMe);
router.patch('/update-me',    ctrl.updateProfile);
router.patch('/change-password', changePasswordRules, validate, ctrl.changePassword);

module.exports = router;
