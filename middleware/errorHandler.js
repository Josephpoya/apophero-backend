'use strict';
// ═══════════════════════════════════════════
//  GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════
const logger = require('../utils/logger');

const handleCastError = (err) => ({
  statusCode: 400,
  message: `Invalid ${err.path}: ${err.value}`
});

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return { statusCode: 409, message: `${field} '${value}' already exists.` };
};

const handleValidationError = (err) => ({
  statusCode: 422,
  message: Object.values(err.errors).map(e => e.message).join('. ')
});

const handleJWTError      = () => ({ statusCode: 401, message: 'Invalid token. Please log in again.' });
const handleJWTExpired    = () => ({ statusCode: 401, message: 'Session expired. Please log in again.' });

module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal server error';

  // Known Mongoose / JWT errors
  if (err.name === 'CastError')            ({ statusCode, message } = handleCastError(err));
  if (err.code === 11000)                  ({ statusCode, message } = handleDuplicateKey(err));
  if (err.name === 'ValidationError')      ({ statusCode, message } = handleValidationError(err));
  if (err.name === 'JsonWebTokenError')    ({ statusCode, message } = handleJWTError());
  if (err.name === 'TokenExpiredError')    ({ statusCode, message } = handleJWTExpired());

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`${statusCode} ${req.method} ${req.originalUrl} — ${err.stack}`);
  }

  res.status(statusCode).json({
    success:    false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
