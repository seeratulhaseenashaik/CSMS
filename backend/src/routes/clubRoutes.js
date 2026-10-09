const express = require('express');
const router = express.Router();
const {
  getClubs,
  getClubById,
  applyForMembership,
  getMyMemberships,
  reviewApplication,
  createEvent,
  registerForEvent,
} = require('../controllers/clubController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', getClubs);
router.get('/me/memberships', protect, getMyMemberships);
router.get('/:clubId', getClubById);
router.post('/:clubId/apply', protect, authorize('student'), applyForMembership);
router.patch('/applications/:membershipId', protect, authorize('club_coordinator', 'administrator'), reviewApplication);
router.post('/:clubId/events', protect, authorize('club_coordinator', 'administrator'), createEvent);
router.post('/events/:eventId/register', protect, registerForEvent);

module.exports = router;
