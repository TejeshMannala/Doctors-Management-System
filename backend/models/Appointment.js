const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    // Patient Details
    patientDetails: {
      fullName: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
      },
      mobileNumber: {
        type: String,
        required: true,
      },
      email: {
        type: String,
      },
    },
    // Health Information
    healthInfo: {
      problemDescription: {
        type: String,
        required: true,
      },
      symptoms: [{
        type: String,
      }],
      duration: {
        type: String,
      },
      severity: {
        type: String,
        enum: ['Mild', 'Moderate', 'Severe'],
        required: true,
      },
      medicalHistory: {
        hasHistory: {
          type: Boolean,
          default: false,
        },
        details: {
          type: String,
        },
      },
      currentMedications: {
        type: String,
      },
    },
    symptoms: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    consultationType: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    videoCallLink: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
