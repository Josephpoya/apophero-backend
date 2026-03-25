'use strict';
// ═══════════════════════════════════════════
//  USER MODEL
// ═══════════════════════════════════════════
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String, required: [true,'Name is required'],
    trim: true, maxlength: [60,'Name cannot exceed 60 characters']
  },
  email: {
    type: String, required: [true,'Email is required'],
    unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String, required: [true,'Password is required'],
    minlength: [8,'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user','admin'],
    default: 'user'
  },
  avatar:     { type: String, default: null },
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },

  // Password reset
  passwordResetToken:   { type: String, select: false },
  passwordResetExpires: { type: Date,   select: false },
  passwordChangedAt:    { type: Date },

  // Newsletter
  newsletterSubscribed: { type: Boolean, default: false },

  lastLogin: { type: Date },
  loginCount:{ type: Number, default: 0 }

}, {
  timestamps: true,
  toJSON:   { virtuals: true, transform: (_, ret) => { delete ret.password; return ret; } },
  toObject: { virtuals: true }
});

// ── Indexes ───────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

// ── Hash password before save ──────────────
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

// ── Instance methods ───────────────────────
UserSchema.methods.correctPassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime() / 1000) > jwtTimestamp;
  }
  return false;
};

UserSchema.methods.getSignedJWT = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

UserSchema.methods.createPasswordResetToken = function() {
  const raw   = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken   = crypto.createHash('sha256').update(raw).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  return raw;
};

module.exports = mongoose.model('User', UserSchema);
