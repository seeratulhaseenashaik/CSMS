const express = require('express');
const router = express.Router();
const {
  getSettings,
  getTimetable,
  getCorrectionRequests,
  createCorrectionRequest,
  reviewCorrectionRequest,
  getAcademicTasks,
  updateTaskStatus,
} = require('../controllers/academicController');
const { getProgressionEligibility } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

// Academic Progression & Eligibility
router.get('/eligibility', getProgressionEligibility);

// Institutional Settings
router.get('/settings', getSettings);

// Persisted Timetable
router.get('/timetable', getTimetable);

// Student Correction Requests
router.get('/corrections', getCorrectionRequests);
router.post('/corrections', authorize('student'), createCorrectionRequest);
router.patch('/corrections/:id/review', authorize('faculty', 'administrator'), reviewCorrectionRequest);

// Academic Task Center
router.get('/tasks', getAcademicTasks);
router.patch('/tasks/:id/status', updateTaskStatus);

module.exports = router;
