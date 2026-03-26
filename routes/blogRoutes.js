'use strict';
// ═══════════════════════════════════════════
//  BLOG ROUTES  —  /api/v1/blog
// ═══════════════════════════════════════════
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/mainControllers');
const { protect, restrictTo } = require('../middleware/auth');
const { blogRules, mongoIdRule, validate } = require('../middleware/validators');
const upload   = require('../middleware/upload');

// Inline optional auth
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
  } catch (_) {}
  next();
};

// ── PUBLIC ────────────────────────────────
router.get('/',      ctrl.getPosts);
router.get('/:slug', optionalAuth, ctrl.getPost);

// ── ADMIN ONLY ────────────────────────────
router.use(protect, restrictTo('admin'));
router.post('/',         blogRules, validate, ctrl.createPost);
router.patch('/:id',     mongoIdRule('id'), validate, ctrl.updatePost);
router.delete('/:id',    mongoIdRule('id'), validate, ctrl.deletePost);
router.post('/:id/cover', upload.single('image'), ctrl.uploadCover);

module.exports = router;