'use strict';
// ═══════════════════════════════════════════
//  VALIDATION RULES
// ═══════════════════════════════════════════
const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Run validation and return errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(e => e.msg).join('. ');
    return next(new AppError(messages, 422));
  }
  next();
};

// ── Auth rules ─────────────────────────────
exports.registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min:2, max:60 }).withMessage('Name must be 2–60 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min:8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number')
];

exports.loginRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

exports.forgotPasswordRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail()
];

exports.resetPasswordRules = [
  body('password').isLength({ min:8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number')
];

exports.changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min:8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Must contain uppercase, lowercase, and a number')
];

// ── Contact rules ──────────────────────────
exports.contactRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max:50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max:50 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max:120 }),
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ min:10, max:2000 }).withMessage('Message must be 10–2000 characters')
];

// ── Newsletter rules ───────────────────────
exports.newsletterRules = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('firstName').optional().trim().isLength({ max:50 })
];

// ── Booking rules ──────────────────────────
exports.bookingRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('sessionType').trim().notEmpty().withMessage('Session type is required')
    .isIn(['quick-consult','deep-dive','3-month-journey']).withMessage('Invalid session type'),
  body('concern').trim().notEmpty().withMessage('Primary concern is required'),
  body('phone').optional().trim(),
  body('notes').optional().trim().isLength({ max:1000 })
];

// ── Blog rules ─────────────────────────────
exports.blogRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min:5, max:200 }),
  body('content').trim().notEmpty().withMessage('Content is required').isLength({ min:50 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required').isLength({ max:300 }),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('topic').trim().notEmpty().withMessage('Topic is required')
];

// ── Param rules ────────────────────────────
exports.mongoIdRule = (field = 'id') => [
  param(field).isMongoId().withMessage(`Invalid ${field}`)
];
