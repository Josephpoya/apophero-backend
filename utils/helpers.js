'use strict';
// ═══════════════════════════════════════════
//  API HELPERS
// ═══════════════════════════════════════════

// Wrap async route handlers — eliminates try/catch boilerplate
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Standard success response
const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(statusCode).json(response);
};

// Pagination helper
const getPagination = (query, defaultLimit = 10) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(50, parseInt(query.limit) || defaultLimit);
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

// Build pagination meta
const buildMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  pages:    Math.ceil(total / limit),
  hasNext:  page * limit < total,
  hasPrev:  page > 1
});

// Generate a short booking reference
const generateRef = (prefix = 'APH') => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = prefix + '-';
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
};

module.exports = { asyncHandler, sendSuccess, getPagination, buildMeta, generateRef };
