const express = require('express');
const {
  createPayment,
  getPaymentForAppointment,
  getMyPayments,
  updatePaymentStatus,
} = require('../controllers/paymentController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, authorize(['patient']), createPayment);
router.get('/my', authMiddleware, authorize(['patient']), getMyPayments);
router.get('/appointment/:appointmentId', authMiddleware, getPaymentForAppointment);
router.put('/:id/status', authMiddleware, authorize(['admin']), updatePaymentStatus);

module.exports = router;
