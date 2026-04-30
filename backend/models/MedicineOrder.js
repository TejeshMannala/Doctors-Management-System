const mongoose = require('mongoose');

const medicineOrderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prescriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: true
  },
  medicines: [{
    name: String,
    dosage: String,
    duration: String
  }],
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicineOrder', medicineOrderSchema);
