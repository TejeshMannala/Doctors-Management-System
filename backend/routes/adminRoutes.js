const express = require('express');
const { getDashboardStats } = require('../controllers/adminController');
const { authMiddleware, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here are protected and restricted to admin
router.use(authMiddleware);
router.use(authorize(['admin']));

router.get('/stats', getDashboardStats);

module.exports = router;
