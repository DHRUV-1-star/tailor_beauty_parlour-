// ============================================
// routes/authRoutes.js - Admin Auth Routes
// ============================================

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Simple hardcoded admin for single-owner businesses
// For production: store admin in database with hashed password
const ADMIN = {
  id: 'admin_001',
  name: 'Shringar Admin',
  email: process.env.ADMIN_EMAIL || 'admin@shringar.com',
  password: process.env.ADMIN_PASSWORD_HASH || '$2a$12$defaultHashChangeThis', // bcrypt hash
  role: 'admin',
};

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check email
    if (email !== ADMIN.email) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // For demo purposes - if password is 'admin123' or matches hash
    let isMatch = password === (process.env.ADMIN_PLAIN_PASS || 'admin123');
    if (!isMatch && ADMIN.password && !ADMIN.password.includes('defaultHash')) {
      isMatch = await bcrypt.compare(password, ADMIN.password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: ADMIN.id, role: ADMIN.role, name: ADMIN.name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: { id: ADMIN.id, name: ADMIN.name, email: ADMIN.email, role: ADMIN.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/verify - Verify token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    res.json({ success: true, admin: decoded });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

module.exports = router;
