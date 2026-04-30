const express = require('express');
const { register, login, verifyToken } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Routes
router.get('/verify', authMiddleware, verifyToken);

module.exports = router;
