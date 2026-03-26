'use strict';
const express = require('express');
const router  = express.Router();

// GET /api/v1/blog — public list of published posts
router.get('/', async (req, res, next) => {
  try {
    const ctrl = require('../controllers/mainControllers');
    await ctrl.getPosts(req, res, next);
  } catch (err) { next(err); }
});

// GET /api/v1/blog/:slug — single post
router.get('/:slug', async (req, res, next) => {
  try {
    const ctrl = require('../controllers/mainControllers');
    await ctrl.getPost(req, res, next);
  } catch (err) { next(err); }
});

// POST /api/v1/blog — admin creates post
router.post('/', async (req, res, next) => {
  try {
    const { protect, restrictTo } = require('../middleware/auth');
    const { blogRules, validate } = require('../middleware/validators');
    const ctrl = require('../controllers/mainControllers');
    protect(req, res, () => restrictTo('admin')(req, res, () => ctrl.createPost(req, res, next)));
  } catch (err) { next(err); }
});

// PATCH /api/v1/blog/:id — admin updates post
router.patch('/:id', async (req, res, next) => {
  try {
    const { protect, restrictTo } = require('../middleware/auth');
    const ctrl = require('../controllers/mainControllers');
    protect(req, res, () => restrictTo('admin')(req, res, () => ctrl.updatePost(req, res, next)));
  } catch (err) { next(err); }
});

// DELETE /api/v1/blog/:id — admin deletes post
router.delete('/:id', async (req, res, next) => {
  try {
    const { protect, restrictTo } = require('../middleware/auth');
    const ctrl = require('../controllers/mainControllers');
    protect(req, res, () => restrictTo('admin')(req, res, () => ctrl.deletePost(req, res, next)));
  } catch (err) { next(err); }
});

module.exports = router;