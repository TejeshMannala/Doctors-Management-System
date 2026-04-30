const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalDoctors,
      totalAppointments,
      pendingFeedback,
      appointmentsToday
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments(),
      Feedback.countDocuments({ status: 'pending' }),
      Appointment.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: totalUsers,
        doctors: totalDoctors,
        appointments: totalAppointments,
        pendingFeedback: pendingFeedback,
        appointmentsToday: appointmentsToday
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats
};
