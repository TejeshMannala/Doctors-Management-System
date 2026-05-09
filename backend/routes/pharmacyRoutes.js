const express = require('express');
const {
  getAllPharmacies,
  getPharmacyById,
  checkMedicineAvailability,
  getNearbyPharmacies,
  createPharmacy,
  updatePharmacy,
} = require('../controllers/pharmacyController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllPharmacies);
router.get('/:id', getPharmacyById);

// Protected routes - authenticated users
router.post('/check-availability', authMiddleware, checkMedicineAvailability);
router.post('/nearby', authMiddleware, getNearbyPharmacies);

// Admin only routes
router.post('/', authMiddleware, authorize(['admin']), createPharmacy);
router.put('/:id', authMiddleware, authorize(['admin']), updatePharmacy);

module.exports = router;
