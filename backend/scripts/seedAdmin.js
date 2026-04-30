const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-appointment';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection SUCCESS');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@doctor.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';
    
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit();
    }

    const adminUser = new User({
      fullName: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('--- Admin Account Seeded ---');
    console.log('ID: ' + adminEmail);
    console.log('Password: ' + adminPassword);
    
    process.exit();
  } catch (error) {
    console.error('Error seeding admin', error);
    process.exit(1);
  }
};

seedAdmin();
