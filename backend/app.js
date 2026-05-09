const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const supportRoutes = require('./routes/supportRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const medicineOrderRoutes = require('./routes/medicineOrderRoutes');

let adminRoutes = null;
try {
  adminRoutes = require('./routes/adminRoutes');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error.message);
  console.error(error.stack);
}

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    message: 'Too many requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: true, // Allow all origins in dev, or specify origins
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/doctors', generalLimiter, doctorRoutes);
app.use('/api/appointments', generalLimiter, appointmentRoutes);
app.use('/api/patients', generalLimiter, patientRoutes);
app.use('/api/prescriptions', generalLimiter, prescriptionRoutes);
app.use('/api/pharmacies', generalLimiter, pharmacyRoutes);
app.use('/api/support', generalLimiter, supportRoutes);
app.use('/api/payments', generalLimiter, paymentRoutes);
app.use('/api/orders', generalLimiter, medicineOrderRoutes);

if (adminRoutes) {
  app.use('/api/admin', adminRoutes);
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Error Handler (moved from bottom to ensure it catches errors from routes above)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
