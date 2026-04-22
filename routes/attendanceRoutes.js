const express = require('express');
const router = express.Router();
const { 
    markAttendance, 
    getHistory 
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/mark', authorize('student'), markAttendance);
router.get('/history', getHistory);

module.exports = router;
