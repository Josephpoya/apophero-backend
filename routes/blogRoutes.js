'use strict';
// ═══════════════════════════════════════════
//  BLOG ROUTES  —  /api/v1/blog
// ═══════════════════════════════════════════
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/mainControllers');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { blogRules, mongoIdRule, validate }  = require('../middleware/validators');
const upload   = require('../middleware/upload');

// ── PUBLIC ────────────────────────────────
// GET  /api/v1/blog               — paginated published posts
router.get('/', ctrl.getPosts);

// GET  /api/v1/blog/:slug         — single post by slug (increments views)
router.get('/:slug', optionalAuth, ctrl.getPost);

// ── ADMIN ONLY ────────────────────────────
router.use(protect, restrictTo('admin'));

// POST /api/v1/blog
router.post('/', blogRules, validate, ctrl.createPost);

// PATCH /api/v1/blog/:id
router.patch('/:id', mongoIdRule('id'), validate, ctrl.updatePost);

// DELETE /api/v1/blog/:id
router.delete('/:id', mongoIdRule('id'), validate, ctrl.deletePost);

// POST /api/v1/blog/:id/cover   — upload cover image
router.post('/:id/cover', upload.single('image'), ctrl.uploadCover);

module.exports = router;
