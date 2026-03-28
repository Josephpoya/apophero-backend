'use strict';
// ═══════════════════════════════════════════
//  UPLOAD MIDDLEWARE — Cloudinary + Multer
// ═══════════════════════════════════════════
const multer    = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const AppError  = require('../utils/AppError');
const path      = require('path');

// ── Allowed file types ─────────────────────
const ALLOWED_IMAGES = /jpeg|jpg|png|gif|webp/;
const ALLOWED_DOCS   = /pdf/;

// ── Image storage (for blog covers) ───────
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'apophero/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

// ── PDF storage (for guides) ───────────────
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'apophero/guides',
    allowed_formats: ['pdf'],
    resource_type:  'raw',
    use_filename:   true,
    unique_filename: false
  }
});

// ── File filters ───────────────────────────
const imageFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (ALLOWED_IMAGES.test(ext)) return cb(null, true);
  cb(new AppError('Only image files are allowed.', 400), false);
};

const pdfFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (ALLOWED_DOCS.test(ext)) return cb(null, true);
  cb(new AppError('Only PDF files are allowed.', 400), false);
};

// ── Exportable upload handlers ─────────────
const uploadImage = multer({
  storage:   imageStorage,
  fileFilter: imageFilter,
  limits:    { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadPDF = multer({
  storage:   pdfStorage,
  fileFilter: pdfFilter,
  limits:    { fileSize: 50 * 1024 * 1024 } // 50MB
});

module.exports = { uploadImage, uploadPDF };