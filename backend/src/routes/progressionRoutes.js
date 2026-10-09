const express = require('express');
const router = express.Router();
const { getProgressionEligibility } = require('../controllers/resultController');
const { protect } = require('../middleware/auth');

router.get('/eligibility', protect, getProgressionEligibility);

module.exports = router;
