const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Get all doctors with pagination
const getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Default 50, cap at 100
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { isAvailable: true };

    const doctors = await Doctor.find(filter)
      .populate('userId', ['fullName', 'email', 'phone', 'profileImage'])
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1, experience: -1 })
      .lean();

    const total = await Doctor.countDocuments(filter);

    // Ensure all doctors have valid userId
    const validDoctors = doctors.filter(d => d.userId);

    res.status(200).json({
      success: true,
      count: validDoctors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      doctors: validDoctors,
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
    const { profileImage, ...doctorData } = req.body;
    
    const doctor = await Doctor.findByIdAndUpdate(doctorId, doctorData, {
      new: true,
      runValidators: true,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    // Also update user profile image if provided
    if (profileImage) {
      await User.findByIdAndUpdate(doctor.userId, { profileImage }, { new: true });
    }

    // Fetch updated doctor with user data
    const updatedDoctor = await Doctor.findById(doctorId).populate('userId', ['fullName', 'email', 'phone', 'profileImage']);

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully by admin',
      doctor: updatedDoctor,
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
    const { fullName, email, password, specialization, experience, consultationFee, profileImage } = req.body;

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
      profileImage: profileImage || '',
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
