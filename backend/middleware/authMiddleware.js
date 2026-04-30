const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      console.warn(`[Auth] No token provided for ${req.originalUrl}`);
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please authenticate.',
      });
    }

    const secret = (process.env.JWT_SECRET || 'your_secret_key').trim();
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.warn(`[Auth] User not found for ID: ${decoded.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth] Authentication failed for ${req.originalUrl}:`, error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      error: error.message,
    });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated.',
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    }

    next();
  };
};

module.exports = { authMiddleware, authorize };
