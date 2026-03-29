'use strict';
const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const ctrl      = require('../controllers/mainControllers');
const { protect, restrictTo } = require('../middleware/auth');
const AppError  = require('../utils/AppError');

const dlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many download requests.' }
});

const dlRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('guideId').trim().notEmpty().withMessage('Guide ID is required'),
  body('guideTitle').trim().notEmpty().withMessage('Guide title is required'),
  body('guideUrl').trim().notEmpty().withMessage('Guide URL is required')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array().map(e => e.msg).join('. '), 422));
  }
  next();
};

// POST /api/v1/downloads — track a download + get guide URL
router.post('/', dlLimiter, dlRules, validate, ctrl.trackDownload);

// GET /api/v1/downloads/stats — admin only
router.get('/stats', protect, restrictTo('admin'), ctrl.getDownloadStats);

module.exports = router;