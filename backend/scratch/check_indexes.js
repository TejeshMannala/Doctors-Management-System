const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const PatientProfile = mongoose.model('PatientProfile', new mongoose.Schema({ email: String }));
    const User = mongoose.model('User', new mongoose.Schema({ email: String }));

    console.log('Indexes for PatientProfile:');
    const pIndexes = await mongoose.connection.db.collection('patientprofiles').indexes();
    console.log(JSON.stringify(pIndexes, null, 2));

    console.log('Indexes for User:');
    const uIndexes = await mongoose.connection.db.collection('users').indexes();
    console.log(JSON.stringify(uIndexes, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkIndexes();
