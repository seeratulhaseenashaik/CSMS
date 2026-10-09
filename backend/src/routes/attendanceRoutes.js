const express = require('express');
const router = express.Router();
const {
  getMyAttendance,
  calculateAttendance,
  recordAttendance,
  getSubjectAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/me', protect, authorize('student', 'administrator'), getMyAttendance);
router.get('/calculator', protect, calculateAttendance);
router.post('/records', protect, authorize('faculty', 'administrator'), recordAttendance);
router.get('/subject/:subjectId', protect, authorize('faculty', 'administrator'), getSubjectAttendance);

module.exports = router;
