const Prescription = require('../models/Prescription');
const Medicine = require('../models/Medicine');

/**
 * Maps symptoms to suggested medicines
 * This is a simplified rule engine for demonstration.
 */
const SYMPTOM_TO_MEDICINE_MAP = {
  'fever': {
    disease: 'Viral Fever',
    medicines: [
      { name: 'Paracetamol', dosage: '1-0-1', duration: '3 days', instructions: 'After food' }
    ],
    notes: 'Drink plenty of water and take rest.'
  },
  'cough': {
    disease: 'Upper Respiratory Infection',
    medicines: [
      { name: 'Cough Syrup', dosage: '10ml, thrice daily', duration: '5 days', instructions: 'After food' },
      { name: 'Azithromycin', dosage: '0-0-1', duration: '3 days', instructions: 'After food' }
    ],
    notes: 'Avoid cold drinks and use warm water.'
  },
  'cold': {
    disease: 'Common Cold',
    medicines: [
      { name: 'Cetirizine', dosage: '0-0-1', duration: '5 days', instructions: 'Before sleep' }
    ],
    notes: 'Steam inhalation twice a day.'
  },
  'body ache': {
    disease: 'Muscle Fatigue',
    medicines: [
      { name: 'Ibuprofen', dosage: '1-0-1', duration: '3 days', instructions: 'After food' }
    ],
    notes: 'Apply warm compress to painful areas.'
  },
  'skin': {
    disease: 'Dermatological Condition',
    medicines: [
      { name: 'Skin Cream', dosage: 'Apply twice daily', duration: '7 days', instructions: 'Clean area before applying' },
      { name: 'Cetirizine', dosage: '0-0-1', duration: '5 days', instructions: 'Before sleep' }
    ],
    notes: 'Avoid scratching the affected area.'
  },
  'pain': {
    disease: 'General Pain',
    medicines: [
      { name: 'Ibuprofen', dosage: '1-0-1', duration: '3 days', instructions: 'After food' }
    ],
    notes: 'Take rest and observe if pain persists.'
  },
  'headache': {
    disease: 'Tension Headache',
    medicines: [
      { name: 'Paracetamol', dosage: '1-0-1', duration: '2 days', instructions: 'After food' }
    ],
    notes: 'Keep hydrated and reduce screen time.'
  }
};

const autoGeneratePrescription = async (appointment) => {
  try {
    const symptoms = (appointment.healthInfo?.symptoms || []).map(s => s.toLowerCase());
    const problemDescription = (appointment.healthInfo?.problemDescription || '').toLowerCase();
    
    // Find the best match
    let match = null;
    
    // Check symptoms first
    for (const symptom of symptoms) {
      for (const [key, value] of Object.entries(SYMPTOM_TO_MEDICINE_MAP)) {
        if (symptom.includes(key) || key.includes(symptom)) {
          match = value;
          break;
        }
      }
      if (match) break;
    }
    
    // If no symptom match, check problem description
    if (!match) {
      for (const [key, value] of Object.entries(SYMPTOM_TO_MEDICINE_MAP)) {
        if (problemDescription.includes(key)) {
          match = value;
          break;
        }
      }
    }
    
    // Default if no match
    if (!match) {
      match = {
        disease: 'General Consultation',
        medicines: [
          { name: 'Multivitamin', dosage: '0-1-0', duration: '7 days', instructions: 'After meal' }
        ],
        notes: 'Follow regular checkup and maintain a healthy diet. If symptoms persist, visit the clinic.'
      };
    }

    const prescription = new Prescription({
      appointmentId: appointment._id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      diagnosis: {
        disease: match.disease,
        symptoms: symptoms,
        severity: appointment.healthInfo?.severity || 'Mild',
        description: problemDescription
      },
      medicines: match.medicines,
      notes: match.notes
    });

    await prescription.save();
    return prescription;
  } catch (error) {
    console.error('Auto-prescription error:', error);
    return null;
  }
};

module.exports = { autoGeneratePrescription };
