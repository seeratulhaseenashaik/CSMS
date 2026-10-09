const express = require('express');
const router = express.Router();
const { getMyResults, enterResult, getProgressionEligibility } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/me', protect, authorize('student', 'administrator'), getMyResults);
router.post('/', protect, authorize('faculty', 'administrator'), enterResult);

module.exports = router;
