'use strict';
// ═══════════════════════════════════════════
//  CONTACT ROUTES  —  /api/v1/contact
// ═══════════════════════════════════════════
const express    = require('express');
const router     = express.Router();
const rateLimit  = require('express-rate-limit');
const ctrl       = require('../controllers/mainControllers');
const { contactRules, validate } = require('../middleware/validators');

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 5,
  message: { success: false, message: 'Too many contact submissions. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders:   false
});

// POST /api/v1/contact
router.post('/', contactLimiter, contactRules, validate, ctrl.submitContact);

module.exports = router;
