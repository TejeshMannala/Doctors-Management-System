const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const createPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
    }

    const appointment = await Appointment.findById(appointmentId).populate('doctorId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.patientId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only pay for your own appointment.' });
    }

    const doctorProfile = await Doctor.findById(appointment.doctorId);
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found.' });
    }

    let payment = await Payment.findOne({ appointmentId: appointment._id });

    if (payment) {
      payment.paymentMethod = paymentMethod || payment.paymentMethod;
      payment.status = 'pending';
      payment.transactionId = `TXN-${Date.now()}-${appointment._id.toString().slice(-6)}`;
      await payment.save();
    } else {
      payment = await Payment.create({
        appointmentId: appointment._id,
        patientId: req.user.id,
        doctorId: doctorProfile._id,
        amount: doctorProfile.consultationFee || 500,
        paymentMethod: paymentMethod || 'upi',
        transactionId: `TXN-${Date.now()}-${appointment._id.toString().slice(-6)}`,
        status: 'pending',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment request created. Waiting for admin approval.',
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to create payment.', error: error.message });
  }
};

const getPaymentForAppointment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ appointmentId: req.params.appointmentId })
      .populate('appointmentId')
      .populate('patientId', 'fullName email')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'fullName email',
        },
      });

    if (!payment) {
      return res.status(200).json({ success: true, payment: null });
    }

    const isOwner = payment.patientId?._id?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch payment.', error: error.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ patientId: req.user.id })
      .populate('appointmentId')
      .populate({
        path: 'doctorId',
        populate: {
          path: 'userId',
          select: 'fullName email',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to fetch payments.', error: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status.' });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    payment.status = status;
    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointmentId, {
      isPaid: status === 'completed',
    });

    res.status(200).json({
      success: true,
      message: `Payment marked as ${status}.`,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to update payment.', error: error.message });
  }
};

module.exports = {
  createPayment,
  getPaymentForAppointment,
  getMyPayments,
  updatePaymentStatus,
};
