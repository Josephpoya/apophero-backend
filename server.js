'use strict';
// ═══════════════════════════════════════════
//  APOPHERO HEALTH — SERVER ENTRY POINT
// ═══════════════════════════════════════════

require('dotenv').config();

// === GLOBAL ERROR CATCHERS FOR STARTUP CRASHES ===
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION (startup crash):', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION (startup crash):', reason);
  console.error(reason.stack || reason);
  process.exit(1);
});

const express        = require('express');
const mongoose       = require('mongoose');
const helmet         = require('helmet');
const cors           = require('cors');
const morgan         = require('morgan');
const rateLimit      = require('express-rate-limit');
const mongoSanitize  = require('express-mongo-sanitize');
const xssClean       = require('xss-clean');
const hpp            = require('hpp');
const compression    = require('compression');
const cookieParser   = require('cookie-parser');
const path           = require('path');

const connectDB      = require('./config/db');
const logger         = require('./utils/logger');
const errorHandler   = require('./middleware/errorHandler');

// ── Route imports ──────────────────────────
const authRoutes         = require('./routes/authRoutes');
const userRoutes         = require('./routes/userRoutes');
const contactRoutes      = require('./routes/contactRoutes');
const newsletterRoutes   = require('./routes/newsletterRoutes');
const bookingRoutes      = require('./routes/bookingRoutes');
const blogRoutes         = require('./routes/blogRoutes');
const adminRoutes        = require('./routes/adminRoutes');
const downloadRoutes = require('./routes/downloadRoutes');

const app = express();
app.set('trust proxy', 1);

// ── Security Middleware ────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/api/v1/downloads', downloadRoutes);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());

// Compression & logging
app.use(compression());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: msg => logger.http(msg.trim()) }
  }));
}

// ── Global Rate Limiter ────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  message:  { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false
});
app.use('/api', globalLimiter);

// ── Static files ───────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health & Root check ───────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status:  'healthy',
    env:     process.env.NODE_ENV,
    uptime:  Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Apophero Backend API is running successfully!",
    version: "v1",
    docs: "/health",
    api_base: "/api/v1"
  });
});

// ── API Routes ─────────────────────────────
app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/users',       userRoutes);
app.use('/api/v1/contact',     contactRoutes);
app.use('/api/v1/newsletter',  newsletterRoutes);
app.use('/api/v1/bookings',    bookingRoutes);
app.use('/api/v1/blog',        blogRoutes);
app.use('/api/v1/admin',       adminRoutes);

// ── 404 handler ────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ── Global error handler ───────────────────
app.use(errorHandler);

// ── Connect Database & Start Server ───────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Apophero Health API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });

  // ── Graceful shutdown ─────────────────────
  const shutdown = async (signal) => {
    logger.info(`${signal} received — shutting down gracefully…`);

    try {
      await new Promise((resolve) => {
        server.close((err) => {
          if (err) logger.error('Error closing server:', err);
          resolve();
        });
      });

      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed.');
      }

      logger.info('Graceful shutdown completed.');
      process.exit(0);
    } catch (err) {
      logger.error(`Error during shutdown: ${err.message}`);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    shutdown('unhandledRejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    shutdown('uncaughtException');
  });

}).catch((err) => {
  logger.error(`Failed to start application: ${err.message}`);
  process.exit(1);
});

module.exports = app;