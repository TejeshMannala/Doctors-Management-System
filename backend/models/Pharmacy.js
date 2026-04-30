const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    medicines: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
        },
        name: String,
        dosage: String,
        quantity: {
          type: Number,
          default: 0,
        },
        cost: {
          type: Number,
          required: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    openingTime: String, // e.g., "09:00"
    closingTime: String, // e.g., "21:00"
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pharmacy', pharmacySchema);
