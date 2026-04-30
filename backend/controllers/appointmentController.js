const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');

const ACTIVE_APPOINTMENT_STATUSES = ['pending', 'confirmed'];

const findActiveAppointment = async (patientId) =>
  Appointment.findOne({
    patientId,
    status: { $in: ACTIVE_APPOINTMENT_STATUSES },
  }).sort({ createdAt: -1 });

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      date,
      timeSlot,
      consultationType,
      patientDetails,
      healthInfo,
    } = req.body;

    const activeAppointment = await findActiveAppointment(req.user.id);
    if (activeAppointment) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active appointment. Please complete or cancel it before booking another one.',
        activeAppointment,
      });
    }

    // Validate required fields
    if (!doctorId || !date || !timeSlot || !patientDetails || !healthInfo) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided',
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found',
      });
    }

    // Create appointment with enhanced data
    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      date: new Date(date),
      timeSlot,
      consultationType: consultationType || 'online',
      patientDetails,
      healthInfo,
      symptoms: healthInfo.symptoms ? healthInfo.symptoms.join(', ') : '',
    });

    await appointment.save();

    // Populate doctor details for response
    await appointment.populate('doctorId', 'specialization experience qualification consultationFee rating');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message,
    });
  }
};

// Get patient's appointments
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate({
        path: 'doctorId',
        select: 'specialization consultationFee userId',
        populate: {
          path: 'userId',
          select: 'fullName email profileImage',
        },
      })
      .populate('patientId', 'fullName email phone')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
};

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate('patientId', 'fullName email phone')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message,
    });
  }
};

// Get all appointments (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'doctorId',
        select: 'specialization',
        populate: {
          path: 'userId',
          select: 'fullName email'
        }
      })
      .populate('patientId', 'fullName email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all appointments',
      error: error.message,
    });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (status === 'completed') {
      const { autoGeneratePrescription } = require('../utils/prescriptionService');
      await autoGeneratePrescription(appointment);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment status updated',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message,
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled',
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message,
    });
  }
};

// Collect patient details (Step 1)
const collectPatientDetails = async (req, res) => {
  try {
    const {
      fullName,
      age,
      dateOfBirth,
      gender,
      mobileNumber,
      email,
      problemDescription,
      symptoms,
      duration,
      severity,
      hasMedicalHistory,
      medicalHistoryDetails,
      currentMedications,
    } = req.body;

    // Validate required fields
    if (!fullName || !age || !gender || !mobileNumber || !problemDescription || !severity) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing',
      });
    }

    const patientData = {
      patientDetails: {
        fullName,
        age: parseInt(age),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        mobileNumber,
        email,
      },
      healthInfo: {
        problemDescription,
        symptoms: Array.isArray(symptoms) ? symptoms : [],
        duration,
        severity,
        medicalHistory: {
          hasHistory: hasMedicalHistory || false,
          details: medicalHistoryDetails || '',
        },
        currentMedications: currentMedications || '',
      },
    };

    await PatientProfile.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        fullName,
        age: parseInt(age),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        mobileNumber,
        email: email || '',
        problemDescription,
        symptoms: Array.isArray(symptoms) ? symptoms : [],
        duration: duration || '',
        severity,
        medicalHistory: {
          hasHistory: hasMedicalHistory || false,
          details: medicalHistoryDetails || '',
        },
        currentMedications: currentMedications || '',
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Update User model (but check for email conflict first)
    if (email) {
      const emailLower = email.toLowerCase().trim();
      const userWithThisEmail = await User.findOne({ email: emailLower });
      
      if (userWithThisEmail && userWithThisEmail._id.toString() !== req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'The email address provided is already in use by another account.',
        });
      }
    }

    await User.findByIdAndUpdate(req.user.id, {
      fullName,
      phone: mobileNumber,
      ...(email ? { email: email.toLowerCase().trim() } : {}),
    });

    res.status(200).json({
      success: true,
      message: 'Patient details collected successfully',
      patientData,
    });
  } catch (error) {
    console.error('collectPatientDetails error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed while saving patient details',
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to collect patient details',
      error: error.message,
    });
  }
};

// Recommend doctors based on problem (Step 2)
const recommendDoctors = async (req, res) => {
  try {
    const { problemDescription, symptoms } = req.body;

    if (!problemDescription) {
      return res.status(400).json({
        success: false,
        message: 'Problem description is required',
      });
    }

    // Simple rule-based doctor recommendation logic
    const getRecommendedSpecialization = (problem, symptomList) => {
      const problemLower = problem.toLowerCase();
      const symptomsLower = symptomList.map(s => s.toLowerCase());

      // Fever, Cold, Cough -> General Physician
      if (problemLower.includes('fever') || problemLower.includes('cold') ||
          problemLower.includes('cough') || symptomsLower.includes('fever') ||
          symptomsLower.includes('cold') || symptomsLower.includes('cough')) {
        return 'General Physician';
      }

      // Skin issues -> Dermatologist
      if (problemLower.includes('skin') || problemLower.includes('rash') ||
          problemLower.includes('acne') || symptomsLower.includes('skin') ||
          symptomsLower.includes('rash')) {
        return 'Dermatologist';
      }

      // Heart pain, chest pain -> Cardiologist
      if (problemLower.includes('heart') || problemLower.includes('chest') ||
          problemLower.includes('cardiac') || symptomsLower.includes('chest pain')) {
        return 'Cardiologist';
      }

      // Child health, pediatric -> Pediatrician
      if (problemLower.includes('child') || problemLower.includes('baby') ||
          problemLower.includes('pediatric') || problemLower.includes('infant')) {
        return 'Pediatrician';
      }

      // Bones, joint pain -> Orthopedic
      if (problemLower.includes('bone') || problemLower.includes('joint') ||
          problemLower.includes('fracture') || problemLower.includes('arthritis') ||
          symptomsLower.includes('joint pain') || symptomsLower.includes('bone pain')) {
        return 'Orthopedic';
      }

      // Mental stress, anxiety, depression -> Psychiatrist
      if (problemLower.includes('mental') || problemLower.includes('stress') ||
          problemLower.includes('anxiety') || problemLower.includes('depression') ||
          problemLower.includes('psychiatric')) {
        return 'Psychiatrist';
      }

      // Eye problems -> Ophthalmologist
      if (problemLower.includes('eye') || problemLower.includes('vision') ||
          problemLower.includes('sight')) {
        return 'Ophthalmologist';
      }

      // Dental -> Dentist
      if (problemLower.includes('tooth') || problemLower.includes('dental') ||
          problemLower.includes('mouth')) {
        return 'Dentist';
      }

      // Default to General Physician
      return 'General Physician';
    };

    const recommendedSpecialization = getRecommendedSpecialization(problemDescription, symptoms || []);

    // Find doctors with the recommended specialization
    const doctors = await Doctor.find({
      specialization: recommendedSpecialization,
      isAvailable: true
    })
    .populate('userId', 'fullName email')
    .select('specialization experience qualification consultationFee rating availableSlots bio')
    .limit(10);

    res.status(200).json({
      success: true,
      recommendedSpecialization,
      doctors: doctors.map(doctor => ({
        _id: doctor._id,
        name: doctor.userId.fullName,
        specialization: doctor.specialization,
        experience: doctor.experience,
        qualification: doctor.qualification,
        consultationFee: doctor.consultationFee,
        rating: doctor.rating || 4.5,
        bio: doctor.bio,
        availableSlots: doctor.availableSlots,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to recommend doctors',
      error: error.message,
    });
  }
};

// Get appointment details
const getAppointmentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('doctorId', 'specialization experience qualification consultationFee rating')
      .populate('patientId', 'fullName email');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if user is authorized to view this appointment
    if (appointment.patientId._id.toString() !== req.user.id &&
        appointment.doctorId.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment',
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment details',
      error: error.message,
    });
  }
};

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  collectPatientDetails,
  recommendDoctors,
  getAppointmentDetails,
};
