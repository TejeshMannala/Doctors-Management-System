const Feedback = require('../models/Feedback');

// Submit user feedback / help request
const submitFeedback = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required.',
      });
    }

    const feedback = await Feedback.create({
      user: req.user.id,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to submit feedback.',
      error: error.message,
    });
  }
};

// Get current user feedback history
const getUserFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user.id })
      .populate('repliedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch feedback history.',
      error: error.message,
    });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'fullName email')
      .populate('repliedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch support messages.',
      error: error.message,
    });
  }
};

const replyToFeedback = async (req, res) => {
  try {
    const { adminReply, status = 'resolved' } = req.body;

    if (!adminReply?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required.',
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Support message not found.',
      });
    }

    feedback.adminReply = adminReply.trim();
    feedback.status = status;
    feedback.repliedBy = req.user.id;
    feedback.repliedAt = new Date();
    feedback.userReplySeen = false;
    feedback.userReplySeenAt = null;

    if (status === 'resolved') {
      feedback.resolvedAt = new Date();
    }

    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Support reply sent successfully.',
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to reply to support message.',
      error: error.message,
    });
  }
};

const markReplySeen = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Support message not found.',
      });
    }

    if (!feedback.adminReply?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No admin reply available for this message.',
      });
    }

    feedback.userReplySeen = true;
    feedback.userReplySeenAt = new Date();
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Reply marked as seen.',
      feedback,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to update support reply status.',
      error: error.message,
    });
  }
};

module.exports = { submitFeedback, getUserFeedback, getAllFeedback, replyToFeedback, markReplySeen };
