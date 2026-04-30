const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Rate limiting removed based on user request

// Generate JWT Token
const generateToken = (id) => {
  const secret = (process.env.JWT_SECRET || 'your_secret_key').trim();
  return jwt.sign({ id }, secret, {
    expiresIn: '7d',
  });
};

// Register User
const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, role } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      role: role === 'doctor' ? 'doctor' : 'patient',
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error.message,
    });
  }
};



// Login User
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user and select password field
    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    user.loginCount = (user.loginCount || 0) + 1;
    user.lastLoginAt = new Date();
    user.lastLoginIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    user.lastLoginUserAgent = req.headers['user-agent'] || '';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message,
    });
  }
};

// Verify Token
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        loginCount: user.loginCount,
        lastLoginAt: user.lastLoginAt,
        lastLoginIp: user.lastLoginIp,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Token verification failed.',
      error: error.message,
    });
  }
};

module.exports = { register, login, verifyToken };
