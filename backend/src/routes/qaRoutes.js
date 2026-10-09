const express = require('express');
const router = express.Router();
const {
  getQuestions,
  createQuestion,
  getQuestionById,
  answerQuestion,
  voteContent,
  acceptAnswer,
  getAchievers,
  verifyAchiever,
} = require('../controllers/qaController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/questions', getQuestions);
router.post('/questions', protect, createQuestion);
router.get('/questions/:questionId', getQuestionById);
router.post('/questions/:questionId/answers', protect, answerQuestion);
router.post('/vote', protect, voteContent);
router.patch('/answers/:answerId/accept', protect, acceptAnswer);

router.get('/achievers', getAchievers);
router.post('/achievers/verify', protect, authorize('faculty', 'administrator'), verifyAchiever);

module.exports = router;
