const express = require('express');
const {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  collectPatientDetails,
  recommendDoctors,
  getAppointmentDetails,
  getAllAppointments,
} = require('../controllers/appointmentController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, bookAppointment);
router.get('/patient', authMiddleware, authorize(['patient']), getPatientAppointments);
router.get('/doctor', authMiddleware, authorize(['doctor']), getDoctorAppointments);
router.get('/admin', authMiddleware, authorize(['admin']), getAllAppointments);
router.put('/:id/status', authMiddleware, updateAppointmentStatus);
router.delete('/:id/cancel', authMiddleware, cancelAppointment);

// New routes for enhanced booking flow
router.post('/patient-details', authMiddleware, authorize(['patient']), collectPatientDetails);
router.post('/recommend-doctors', authMiddleware, authorize(['patient']), recommendDoctors);
router.get('/:id/details', authMiddleware, getAppointmentDetails);

module.exports = router;
