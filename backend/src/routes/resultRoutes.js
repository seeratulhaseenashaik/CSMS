const express = require('express');
const router = express.Router();
const {
  getMyResults,
  enterResult,
  getProgressionEligibility,
  getPendingMarksApprovals,
  approveMarks,
  publishMarks,
} = require('../controllers/resultController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/me', protect, authorize('student', 'administrator'), getMyResults);
router.post('/', protect, authorize('faculty', 'administrator'), enterResult);

// Marks Workflow Governance (Approval & Publication)
router.get('/pending-approvals', protect, authorize('administrator', 'faculty'), getPendingMarksApprovals);
router.post('/approve', protect, authorize('administrator'), approveMarks);
router.post('/publish', protect, authorize('administrator'), publishMarks);

module.exports = router;
