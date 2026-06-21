// ============================================
// server.js - Main Entry Point
// Shringar Tailoring & Beauty Parlour API
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const bookingRoutes = require('./routes/bookingRoutes');
const customerRoutes = require('./routes/customerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Security Middleware ----
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ---- Rate Limiting ----
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ---- CORS ----
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://127.0.0.1:5500',   // Live Server
    'http://localhost:5500',
    'null', // local file:// access
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ---- Body Parser ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- Logger (development only) ----
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ---- Database Connection ----
const connectDB = require('./config/db');
connectDB();

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/contact', contactRoutes);

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '✦ Shringar API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ---- Root Route ----
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'Shringar - Ladies Tailoring & Beauty Parlour API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/login | POST /api/auth/register',
      bookings: 'GET|POST /api/bookings',
      customers: 'GET|POST /api/customers',
      services: 'GET|POST /api/services',
      contact: 'POST /api/contact',
    },
  });
});

// ---- 404 Handler ----
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`\n✦ ============================================`);
  console.log(`✦  Shringar Backend Server Started`);
  console.log(`✦  Port: ${PORT}`);
  console.log(`✦  Environment: ${process.env.NODE_ENV}`);
  console.log(`✦  URL: http://localhost:${PORT}`);
  console.log(`✦ ============================================\n`);
});

module.exports = app;
