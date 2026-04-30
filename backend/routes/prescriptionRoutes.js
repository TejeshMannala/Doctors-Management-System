const express = require('express');
const {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  getPrescriptionById,
} = require('../controllers/prescriptionController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/', authMiddleware, authorize(['doctor']), createPrescription);
router.get('/patient', authMiddleware, authorize(['patient']), getPrescriptionsByPatient);
router.get('/doctor', authMiddleware, authorize(['doctor']), getPrescriptionsByDoctor);
router.get('/:id', authMiddleware, getPrescriptionById);

module.exports = router;