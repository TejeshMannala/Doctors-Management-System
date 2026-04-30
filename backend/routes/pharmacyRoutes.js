const express = require('express');
const {
  getAllPharmacies,
  getPharmacyById,
  checkMedicineAvailability,
  getNearbyPharmacies,
  createPharmacy,
  updatePharmacy,
} = require('../controllers/pharmacyController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllPharmacies);
router.get('/:id', getPharmacyById);

// Patient routes
router.post('/check-availability', authMiddleware, checkMedicineAvailability);
router.post('/nearby', getNearbyPharmacies);

// Admin routes
router.post('/', authMiddleware, createPharmacy);
router.put('/:id', authMiddleware, updatePharmacy);

module.exports = router;
