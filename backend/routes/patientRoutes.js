const express = require('express');
const User = require('../models/User');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, address },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

module.exports = router;
