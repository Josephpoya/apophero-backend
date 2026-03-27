'use strict';
// ═══════════════════════════════════════════
//  DATABASE CONNECTION
// ═══════════════════════════════════════════
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer needed in newer Mongoose, but harmless
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);        // Stop the app if DB fails to connect
  }
};

module.exports = connectDB;