const express = require('express');
const router = express.Router();
const {
  getFacultyDashboard,
  getFacultyProfile,
  updateFacultyProfile,
  getFacultySubjects,
  getFacultyStudents,
  getFacultyAttendanceSession,
  recordBulkAttendance,
  getFacultyMarks,
  saveBulkMarks,
  getFacultyTimetable,
  getFacultyReports,
  getFacultyAnnouncements,
  createFacultyAnnouncement,
} = require('../controllers/facultyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All faculty routes require authentication and faculty/admin authorization
router.use(protect);
router.use(authorize('faculty', 'administrator'));

router.get('/dashboard', getFacultyDashboard);
router.get('/profile', getFacultyProfile);
router.put('/profile', updateFacultyProfile);
router.get('/subjects', getFacultySubjects);
router.get('/students', getFacultyStudents);
router.get('/attendance', getFacultyAttendanceSession);
router.post('/attendance', recordBulkAttendance);
router.get('/marks', getFacultyMarks);
router.post('/marks', saveBulkMarks);
router.get('/timetable', getFacultyTimetable);
router.get('/schedule', getFacultyTimetable);
router.get('/reports', getFacultyReports);
router.get('/announcements', getFacultyAnnouncements);
router.post('/announcements', createFacultyAnnouncement);

module.exports = router;
