// ============================================
// middleware/auth.js - JWT Auth Middleware
// ============================================

const jwt = require('jsonwebtoken');

// ---- Protect Route (must be logged in) ----
exports.protect = (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Also check cookie (optional)
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or has expired. Please log in again.',
    });
  }
};

// ---- Admin Only ----
exports.adminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access forbidden. Admin privileges required.',
  });
};
