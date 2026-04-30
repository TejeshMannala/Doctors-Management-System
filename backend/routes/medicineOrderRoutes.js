const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const medicineOrderController = require('../controllers/medicineOrderController');

// Helper middleware since the main auth might not export restrictTo simply
const restrictToAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
};

const restrictToPatient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Patient only.' });
  }
};

router.post('/', authMiddleware, restrictToPatient, medicineOrderController.createOrder);
router.get('/patient', authMiddleware, restrictToPatient, medicineOrderController.getPatientOrders);

router.get('/admin', authMiddleware, restrictToAdmin, medicineOrderController.getAllOrders);
router.put('/admin/:orderId', authMiddleware, restrictToAdmin, medicineOrderController.updateOrderStatus);

module.exports = router;
