const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    genericName: String,
    dosage: String,
    category: String, // e.g., "Antibiotic", "Pain Relief", "Fever"
    manufacturer: String,
    sideEffects: [String],
    contraindications: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', medicineSchema);
