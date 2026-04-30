const express = require('express');
const {
  submitFeedback,
  getUserFeedback,
  getAllFeedback,
  replyToFeedback,
  markReplySeen,
} = require('../controllers/supportController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/feedback', authMiddleware, submitFeedback);
router.get('/feedback', authMiddleware, getUserFeedback);
router.put('/feedback/:id/seen', authMiddleware, markReplySeen);
router.get('/admin/feedback', authMiddleware, authorize(['admin']), getAllFeedback);
router.put('/admin/feedback/:id/reply', authMiddleware, authorize(['admin']), replyToFeedback);

module.exports = router;
