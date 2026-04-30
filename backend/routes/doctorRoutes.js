const express = require('express');
const {
  getAllDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile,
  searchDoctorsBySpecialization,
  adminUpdateDoctor,
  adminAddDoctor,
  adminDeleteDoctor,
} = require('../controllers/doctorController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/search', searchDoctorsBySpecialization);
router.get('/:id', getDoctorById);

// Protected routes
router.post('/profile', authMiddleware, authorize(['doctor']), createDoctorProfile);
router.put('/profile', authMiddleware, authorize(['doctor']), updateDoctorProfile);

// Admin routes
router.post('/admin/add', authMiddleware, authorize(['admin']), adminAddDoctor);
router.put('/admin/:id', authMiddleware, authorize(['admin']), adminUpdateDoctor);
router.delete('/admin/:id', authMiddleware, authorize(['admin']), adminDeleteDoctor);

module.exports = router;
