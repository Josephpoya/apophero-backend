'use strict';
// ═══════════════════════════════════════════
//  NEWSLETTER ROUTES  —  /api/v1/newsletter
// ═══════════════════════════════════════════
const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const ctrl       = require('../controllers/mainControllers');
const { newsletterRules, validate } = require('../middleware/validators');

const nlLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// POST /api/v1/newsletter/subscribe
router.post('/subscribe', nlLimiter, newsletterRules, validate, ctrl.subscribe);

// GET  /api/v1/newsletter/unsubscribe/:token
router.get('/unsubscribe/:token', ctrl.unsubscribe);

module.exports = router;
