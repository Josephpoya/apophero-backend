'use strict';
// ═══════════════════════════════════════════
//  DOWNLOAD ROUTES  —  /api/v1/downloads
// ═══════════════════════════════════════════
const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const AppError  = require('../utils/AppError');
const { asyncHandler, sendSuccess } = require('../utils/helpers');

const dlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
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
  if (!errors.isEmpty()) return next(new AppError(errors.array().map(e => e.msg).join('. '), 422));
  next();
};

// POST /api/v1/downloads — track a download
router.post('/', dlLimiter, dlRules, validate, asyncHandler(async (req, res) => {
  const ctrl = require('../controllers/mainControllers');
  return ctrl.trackDownload(req, res);
}));

// GET /api/v1/downloads/my — user's own downloads (by email)
router.get('/my', protect, asyncHandler(async (req, res) => {
  const { Download } = require('../models/index');
  const downloads = await Download.find({ email: req.user.email })
    .sort('-createdAt').lean();
  sendSuccess(res, { message: 'Downloads fetched', data: { downloads } });
}));

// GET /api/v1/downloads/stats — admin stats
router.get('/stats', protect, asyncHandler(async (req, res) => {
  const { Download } = require('../models/index');
  const [stats, total, todayCount] = await Promise.all([
    Download.aggregate([
      { $group: { _id:'$guideId', title:{ $first:'$guideTitle' }, count:{ $sum:1 }, lastDownloaded:{ $max:'$createdAt' } } },
      { $sort: { count:-1 } }
    ]),
    Download.countDocuments(),
    Download.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } })
  ]);
  sendSuccess(res, { message: 'Stats fetched', data: { stats, total, todayCount } });
}));

module.exports = router;
