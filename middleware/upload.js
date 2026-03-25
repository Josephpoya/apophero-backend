'use strict';
// ═══════════════════════════════════════════
//  FILE UPLOAD MIDDLEWARE — Multer
// ═══════════════════════════════════════════
const multer   = require('multer');
const path     = require('path');
const AppError = require('../utils/AppError');

const ALLOWED_TYPES = /jpeg|jpg|png|gif|webp/;
const MAX_SIZE      = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const extOk  = ALLOWED_TYPES.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = ALLOWED_TYPES.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new AppError('Only image files (jpeg, jpg, png, gif, webp) are allowed.', 400), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

module.exports = upload;
