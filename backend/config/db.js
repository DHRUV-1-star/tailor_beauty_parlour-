// ============================================
// config/db.js - MongoDB Connection
// ============================================

// Force IPv4 DNS resolution (fixes querySrv ECONNREFUSED on some networks)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shringar_db', {
      // Mongoose 7+ has no need for useNewUrlParser etc.
    });
    console.log(`✦ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠ MongoDB Disconnected. Attempting reconnect...');
});
mongoose.connection.on('reconnected', () => {
  console.log('✦ MongoDB Reconnected');
});

module.exports = connectDB;
