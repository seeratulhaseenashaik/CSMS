const express = require('express');
const router = express.Router();
const {
  getUsers,
  createDepartment,
  getDepartments,
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
  createPromotionRule,
  getPromotionRules,
  publishAnnouncement,
  getAdminDashboard,
  getAdminSettings,
  updateAdminSettings,
  getAdminTimetable,
  createTimetableEntry,
  deleteTimetableEntry,
  getAdminAuditLogs,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/dashboard', authorize('administrator'), getAdminDashboard);
router.get('/users', authorize('administrator'), getUsers);

// Department Routes
router.get('/departments', getDepartments);
router.post('/departments', authorize('administrator'), createDepartment);

// Subject Management Routes
router.get('/subjects', getSubjects);
router.post('/subjects', authorize('administrator'), createSubject);
router.put('/subjects/:id', authorize('administrator'), updateSubject);
router.delete('/subjects/:id', authorize('administrator'), deleteSubject);

// Institutional Settings Routes
router.get('/settings', authorize('administrator'), getAdminSettings);
router.put('/settings', authorize('administrator'), updateAdminSettings);

// Timetable Admin Routes
router.get('/timetable', authorize('administrator'), getAdminTimetable);
router.post('/timetable', authorize('administrator'), createTimetableEntry);
router.delete('/timetable/:id', authorize('administrator'), deleteTimetableEntry);

// Audit Logs Route
router.get('/audit-logs', authorize('administrator'), getAdminAuditLogs);

// Promotion Rules & Announcements
router.post('/promotion-rules', authorize('administrator'), createPromotionRule);
router.get('/promotion-rules', getPromotionRules);
router.post('/announcements', authorize('administrator'), publishAnnouncement);

module.exports = router;
