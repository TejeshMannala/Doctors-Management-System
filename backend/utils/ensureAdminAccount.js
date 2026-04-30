const User = require('../models/User');

const ensureAdminAccount = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@doctor.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('--- Syncing Admin Account ---');
      console.log('Target Email:', adminEmail);
      existingAdmin.password = adminPassword;
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin account synced successfully.');
      return;
    }

    console.log('--- Creating New Admin Account ---');
    const adminUser = new User({
      fullName: 'System Administrator',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Default admin account created.');
    console.log('--- Default Admin Account Created ---');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
  } catch (error) {
    console.error('Error ensuring admin account:', error.message);
    // Don't exit process here so server doesn't crash on initial seed error
    // but log it clearly
  }
};

module.exports = ensureAdminAccount;
