const express = require('express');
const router = express.Router();
const {
  getUsers,
  createDepartment,
  createSubject,
  createPromotionRule,
  getPromotionRules,
  publishAnnouncement,
  getAdminDashboard,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.get('/dashboard', authorize('administrator'), getAdminDashboard);
router.get('/users', authorize('administrator'), getUsers);
router.post('/departments', authorize('administrator'), createDepartment);
router.post('/subjects', authorize('administrator'), createSubject);
router.post('/promotion-rules', authorize('administrator'), createPromotionRule);
router.get('/promotion-rules', getPromotionRules);
router.post('/announcements', authorize('administrator'), publishAnnouncement);

module.exports = router;
