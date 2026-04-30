const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Get all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isAvailable: true }).populate('userId', [
      'fullName',
      'email',
      'phone',
      'profileImage',
    ]);

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message,
    });
  }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', [
      'fullName',
      'email',
      'phone',
      'profileImage',
    ]);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: error.message,
    });
  }
};

// Create doctor profile (for registered doctors)
const createDoctorProfile = async (req, res) => {
  try {
    const { specialization, experience, qualification, licenseNumber, consultationFee } =
      req.body;

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ userId: req.user.id });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile already exists',
      });
    }

    const newDoctor = new Doctor({
      userId: req.user.id,
      specialization,
      experience,
      qualification,
      licenseNumber,
      consultationFee: consultationFee || 500,
    });

    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      doctor: newDoctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create doctor profile',
      error: error.message,
    });
  }
};

// Update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate({ userId: req.user.id }, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile',
      error: error.message,
    });
  }
};

// Admin update doctor profile
const adminUpdateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findByIdAndUpdate(doctorId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully by admin',
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile',
      error: error.message,
    });
  }
};

// Search doctors by specialization
const searchDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization } = req.query;

    if (!specialization) {
      return res.status(400).json({
        success: false,
        message: 'Specialization parameter is required',
      });
    }

    const doctors = await Doctor.find({
      specialization: new RegExp(specialization, 'i'),
      isAvailable: true,
    }).populate('userId', ['fullName', 'email', 'profileImage']);

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search doctors',
      error: error.message,
    });
  }
};

// Admin add a new doctor (creates User and Doctor profile)
const adminAddDoctor = async (req, res) => {
  try {
    const { fullName, email, password, specialization, experience, consultationFee } = req.body;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // 2. Create User
    const user = new User({
      fullName,
      email,
      password,
      role: 'doctor',
    });
    await user.save();

    // 3. Create Doctor Profile
    const doctor = new Doctor({
      userId: user._id,
      specialization,
      experience,
      consultationFee: consultationFee || 500,
      isAvailable: true,
    });
    await doctor.save();

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      data: { user, doctor }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add doctor', error: error.message });
  }
};

// Admin delete a doctor
const adminDeleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Delete associated User account first
    await User.findByIdAndDelete(doctor.userId);
    // Then delete Doctor profile
    await Doctor.findByIdAndDelete(doctorId);

    res.status(200).json({ success: true, message: 'Doctor and associated account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete doctor', error: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile,
  searchDoctorsBySpecialization,
  adminUpdateDoctor,
  adminAddDoctor,
  adminDeleteDoctor,
};
