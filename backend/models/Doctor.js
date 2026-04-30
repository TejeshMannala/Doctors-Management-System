const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    qualification: {
      type: String,
      required: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    consultationFee: {
      type: Number,
      default: 500,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
        maxPatients: Number,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
