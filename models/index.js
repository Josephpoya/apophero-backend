'use strict';
// ═══════════════════════════════════════════
//  CONTACT MODEL
// ═══════════════════════════════════════════
const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 50 },
  lastName:  { type: String, required: true, trim: true, maxlength: 50 },
  email:     { type: String, required: true, lowercase: true, trim: true },
  subject:   { type: String, required: true, trim: true, maxlength: 120 },
  message:   { type: String, required: true, trim: true, maxlength: 2000 },
  status: {
    type: String,
    enum: ['new','read','replied','archived'],
    default: 'new'
  },
  adminNote: { type: String, default: '' },
  ip:        { type: String }
}, { timestamps: true });

ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ email: 1 });

ContactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Contact = mongoose.model('Contact', ContactSchema);

// ═══════════════════════════════════════════
//  NEWSLETTER MODEL
// ═══════════════════════════════════════════
const NewsletterSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  firstName: { type: String, trim: true, default: '' },
  isActive:  { type: Boolean, default: true },
  unsubscribeToken: { type: String },
  source:    { type: String, enum: ['website','booking','registration'], default: 'website' },
  tags:      [{ type: String }]
}, { timestamps: true });

NewsletterSchema.index({ email: 1 }, { unique: true });
NewsletterSchema.index({ isActive: 1 });

// Generate unsubscribe token before save
NewsletterSchema.pre('save', function(next) {
  if (this.isNew) {
    const crypto = require('crypto');
    this.unsubscribeToken = crypto.randomBytes(24).toString('hex');
  }
  next();
});

const Newsletter = mongoose.model('Newsletter', NewsletterSchema);

// ═══════════════════════════════════════════
//  BOOKING MODEL
// ═══════════════════════════════════════════
const BookingSchema = new mongoose.Schema({
  bookingRef:  { type: String, required: true, unique: true },
  firstName:   { type: String, required: true, trim: true },
  lastName:    { type: String, required: true, trim: true },
  email:       { type: String, required: true, lowercase: true, trim: true },
  phone:       { type: String, trim: true, default: '' },
  sessionType: {
    type: String,
    required: true,
    enum: ['quick-consult','deep-dive','3-month-journey']
  },
  concern: {
    type: String,
    required: true,
    enum: [
      'weight-loss','testosterone','premature-ejaculation','pcos',
      'pregnancy','mental-health','general-wellness','multiple'
    ]
  },
  notes:  { type: String, trim: true, maxlength: 1000, default: '' },
  status: {
    type: String,
    enum: ['pending','confirmed','scheduled','completed','cancelled'],
    default: 'pending'
  },
  scheduledAt:  { type: Date, default: null },
  completedAt:  { type: Date, default: null },
  adminNote:    { type: String, default: '' },
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ip:           { type: String }
}, { timestamps: true });

BookingSchema.index({ email: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingRef: 1 }, { unique: true });
BookingSchema.index({ createdAt: -1 });

BookingSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const Booking = mongoose.model('Booking', BookingSchema);

// ═══════════════════════════════════════════
//  BLOG POST MODEL
// ═══════════════════════════════════════════
const BlogSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true, maxlength: 200 },
  slug:     { type: String, unique: true, lowercase: true },
  excerpt:  { type: String, required: true, trim: true, maxlength: 300 },
  content:  { type: String, required: true },
  coverImage: { type: String, default: null },
  emoji:    { type: String, default: '📝' },
  gradient: { type: String, default: 'linear-gradient(135deg,#161919,#2a2e2e)' },
  category: {
    type: String, required: true,
    enum: ["Weight Loss","Men's Health","Women's Health","Wellness","Mental Health","Nutrition"]
  },
  topic: {
    type: String, required: true,
    enum: ['weight','hormones','sexual-health','pregnancy','mental-health','wellness','nutrition']
  },
  tags:     [{ type: String, trim: true }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  status: {
    type: String,
    enum: ['draft','published','archived'],
    default: 'draft'
  },
  publishedAt:  { type: Date, default: null },
  readTime:     { type: String, default: '5 min read' },
  views:        { type: Number, default: 0 },
  featured:     { type: Boolean, default: false },
  metaTitle:    { type: String, maxlength: 70 },
  metaDesc:     { type: String, maxlength: 160 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

BlogSchema.index({ slug: 1 }, { unique: true });
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ topic: 1 });
BlogSchema.index({ featured: 1 });

// Auto-generate slug
BlogSchema.pre('save', async function(next) {
  if (!this.isModified('title')) return next();
  const slugify = require('slugify');
  let slug = slugify(this.title, { lower: true, strict: true });
  // Ensure uniqueness
  const exists = await mongoose.model('Blog').findOne({ slug, _id: { $ne: this._id } });
  if (exists) slug += `-${Date.now()}`;
  this.slug = slug;
  // Auto-set publishedAt
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Increment views
BlogSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save({ validateBeforeSave: false });
};

const Blog = mongoose.model('Blog', BlogSchema);

module.exports = { Contact, Newsletter, Booking, Blog };
