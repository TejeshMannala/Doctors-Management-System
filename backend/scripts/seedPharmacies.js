const mongoose = require('mongoose');
const Pharmacy = require('../models/Pharmacy');
require('dotenv').config();

const seedPharmacies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing pharmacies
    await Pharmacy.deleteMany({});

    const pharmaciesData = [
      {
        name: 'MedPlus Pharmacy',
        email: 'medplus@pharmacy.com',
        phone: '+91-9876543210',
        address: {
          street: '123 Main Street',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500001',
          latitude: 17.3850,
          longitude: 78.4867,
        },
        openingTime: '08:00',
        closingTime: '22:00',
        deliveryAvailable: true,
        rating: 4.5,
        medicines: [
          {
            name: 'Aspirin',
            dosage: '500mg',
            quantity: 100,
            cost: 50,
            isAvailable: true,
          },
          {
            name: 'Paracetamol',
            dosage: '500mg',
            quantity: 150,
            cost: 40,
            isAvailable: true,
          },
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            quantity: 50,
            cost: 80,
            isAvailable: true,
          },
          {
            name: 'Metformin',
            dosage: '500mg',
            quantity: 80,
            cost: 120,
            isAvailable: true,
          },
          {
            name: 'Lisinopril',
            dosage: '10mg',
            quantity: 60,
            cost: 150,
            isAvailable: true,
          },
        ],
      },
      {
        name: 'Apollo Pharmacy',
        email: 'apollo@pharmacy.com',
        phone: '+91-9876543211',
        address: {
          street: '456 Park Avenue',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500002',
          latitude: 17.3900,
          longitude: 78.4900,
        },
        openingTime: '07:00',
        closingTime: '23:00',
        deliveryAvailable: true,
        rating: 4.7,
        medicines: [
          {
            name: 'Ibuprofen',
            dosage: '200mg',
            quantity: 200,
            cost: 60,
            isAvailable: true,
          },
          {
            name: 'Paracetamol',
            dosage: '500mg',
            quantity: 200,
            cost: 40,
            isAvailable: true,
          },
          {
            name: 'Cough Syrup',
            dosage: '5ml',
            quantity: 50,
            cost: 100,
            isAvailable: true,
          },
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            quantity: 100,
            cost: 85,
            isAvailable: true,
          },
          {
            name: 'Azithromycin',
            dosage: '500mg',
            quantity: 30,
            cost: 200,
            isAvailable: true,
          },
        ],
      },
      {
        name: 'Wellness Forever',
        email: 'wellness@pharmacy.com',
        phone: '+91-9876543212',
        address: {
          street: '789 Health Street',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500003',
          latitude: 17.3750,
          longitude: 78.4750,
        },
        openingTime: '09:00',
        closingTime: '21:00',
        deliveryAvailable: false,
        rating: 4.3,
        medicines: [
          {
            name: 'Aspirin',
            dosage: '500mg',
            quantity: 75,
            cost: 52,
            isAvailable: true,
          },
          {
            name: 'Metformin',
            dosage: '500mg',
            quantity: 120,
            cost: 115,
            isAvailable: true,
          },
          {
            name: 'Lisinopril',
            dosage: '10mg',
            quantity: 90,
            cost: 145,
            isAvailable: true,
          },
          {
            name: 'Atorvastatin',
            dosage: '10mg',
            quantity: 70,
            cost: 180,
            isAvailable: true,
          },
        ],
      },
      {
        name: 'PharmEasy Store',
        email: 'pharmeasy@pharmacy.com',
        phone: '+91-9876543213',
        address: {
          street: '321 Commerce Road',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500004',
          latitude: 17.3900,
          longitude: 78.4800,
        },
        openingTime: '08:00',
        closingTime: '22:30',
        deliveryAvailable: true,
        rating: 4.6,
        medicines: [
          {
            name: 'Ibuprofen',
            dosage: '200mg',
            quantity: 250,
            cost: 65,
            isAvailable: true,
          },
          {
            name: 'Paracetamol',
            dosage: '500mg',
            quantity: 300,
            cost: 38,
            isAvailable: true,
          },
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            quantity: 150,
            cost: 82,
            isAvailable: true,
          },
          {
            name: 'Cetirizine',
            dosage: '10mg',
            quantity: 100,
            cost: 90,
            isAvailable: true,
          },
          {
            name: 'Omeprazole',
            dosage: '20mg',
            quantity: 80,
            cost: 110,
            isAvailable: true,
          },
        ],
      },
      {
        name: 'HealthFirst Pharmacy',
        email: 'healthfirst@pharmacy.com',
        phone: '+91-9876543214',
        address: {
          street: '654 Medical Lane',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500005',
          latitude: 17.3800,
          longitude: 78.4900,
        },
        openingTime: '07:30',
        closingTime: '22:00',
        deliveryAvailable: true,
        rating: 4.4,
        medicines: [
          {
            name: 'Aspirin',
            dosage: '500mg',
            quantity: 80,
            cost: 48,
            isAvailable: true,
          },
          {
            name: 'Cough Syrup',
            dosage: '5ml',
            quantity: 80,
            cost: 95,
            isAvailable: true,
          },
          {
            name: 'Azithromycin',
            dosage: '500mg',
            quantity: 50,
            cost: 195,
            isAvailable: true,
          },
          {
            name: 'Atorvastatin',
            dosage: '10mg',
            quantity: 100,
            cost: 175,
            isAvailable: true,
          },
        ],
      },
    ];

    const result = await Pharmacy.insertMany(pharmaciesData);
    console.log(`✅ Successfully seeded ${result.length} pharmacies`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pharmacies:', error);
    process.exit(1);
  }
};

seedPharmacies();
