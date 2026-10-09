const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');
const AchieverRecord = require('../models/AchieverRecord');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc Get questions list with filtering, search, and sorting
// @route GET /api/questions
// @access Public / Private
exports.getQuestions = async (req, res, next) => {
  try {
    const { category, search, tag, sort } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (tag) filter.tags = tag.toLowerCase();
    if (search) {
      filter.$text = { $search: search };
    }

    let query = Question.find(filter).populate('author', 'name role avatar');

    if (sort === 'trending') {
      query = query.sort({ views: -1, upvotesCount: -1 });
    } else if (sort === 'unanswered') {
      filter.answersCount = 0;
      query = Question.find(filter).populate('author', 'name role avatar').sort({ createdAt: -1 });
    } else if (sort === 'popular') {
      query = query.sort({ upvotesCount: -1 });
    } else {
      query = query.sort({ createdAt: -1 }); // default recent
    }

    const questions = await query.exec();

    res.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Ask a new question
// @route POST /api/questions
// @access Private
exports.createQuestion = async (req, res, next) => {
  try {
    const { title, description, category, tags } = req.body;

    const question = await Question.create({
      author: req.user.id,
      title,
      description,
      category: category || 'Academics & Exam Prep',
      tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    });

    res.status(201).json({
      success: true,
      message: 'Question posted successfully.',
      question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get single question details with answers
// @route GET /api/questions/:questionId
// @access Public / Private
exports.getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.questionId)
      .populate('author', 'name role avatar')
      .populate('acceptedAnswer');

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    const answers = await Answer.find({ question: question._id })
      .populate('author', 'name role avatar')
      .sort({ isAccepted: -1, upvotesCount: -1, createdAt: 1 });

    // Check current user votes
    let userVotes = [];
    if (req.user) {
      const answerIds = answers.map(a => a._id);
      userVotes = await Vote.find({
        user: req.user.id,
        targetId: { $in: [question._id, ...answerIds] },
      });
    }

    res.json({
      success: true,
      question,
      answers,
      userVotes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Post an answer to a question
// @route POST /api/questions/:questionId/answers
// @access Private
exports.answerQuestion = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const answer = await Answer.create({
      question: questionId,
      author: req.user.id,
      content,
    });

    question.answersCount += 1;
    await question.save();

    // Notify Question Author
    if (question.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: question.author,
        title: 'New Answer Received',
        message: `${req.user.name} answered your question: "${question.title.substring(0, 40)}..."`,
        type: 'QA_RESPONSE',
        linkUrl: `/qa/${question._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully.',
      answer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Vote (Upvote/Downvote) on Question or Answer (prevents duplicate votes)
// @route POST /api/qa/vote
// @access Private
exports.voteContent = async (req, res, next) => {
  try {
    const { targetId, targetType, voteType } = req.body; // voteType: 1 or -1

    if (!['Question', 'Answer'].includes(targetType) || ![1, -1].includes(Number(voteType))) {
      return res.status(400).json({ success: false, message: 'Invalid targetType or voteType.' });
    }

    let existingVote = await Vote.findOne({
      user: req.user.id,
      targetId,
      targetType,
    });

    let targetModel = targetType === 'Question' ? Question : Answer;
    let item = await targetModel.findById(targetId);

    if (!item) {
      return res.status(404).json({ success: false, message: `${targetType} not found.` });
    }

    if (existingVote) {
      if (existingVote.voteType === Number(voteType)) {
        // Toggle remove vote
        await Vote.findByIdAndDelete(existingVote._id);
        item.upvotesCount = Math.max(0, item.upvotesCount - Number(voteType));
        await item.save();
        return res.json({ success: true, message: 'Vote removed.', upvotesCount: item.upvotesCount });
      } else {
        // Change vote direction
        existingVote.voteType = Number(voteType);
        await existingVote.save();
        item.upvotesCount += Number(voteType) * 2;
        await item.save();
        return res.json({ success: true, message: 'Vote updated.', upvotesCount: item.upvotesCount });
      }
    } else {
      // Create new vote
      await Vote.create({
        user: req.user.id,
        targetId,
        targetType,
        voteType: Number(voteType),
      });

      item.upvotesCount += Number(voteType);
      await item.save();
      return res.json({ success: true, message: 'Vote recorded.', upvotesCount: item.upvotesCount });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Mark answer as accepted (Question Author)
// @route PATCH /api/qa/answers/:answerId/accept
// @access Private
exports.acceptAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findById(req.params.answerId).populate('question');
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found.' });
    }

    const question = answer.question;
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only question author can accept answers.' });
    }

    // Reset previous accepted answer
    await Answer.updateMany({ question: question._id }, { isAccepted: false });

    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    await question.save();

    res.json({
      success: true,
      message: 'Answer marked as accepted.',
      answer,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get list of Verified Achievers
// @route GET /api/qa/achievers
// @access Public / Private
exports.getAchievers = async (req, res, next) => {
  try {
    const achievers = await AchieverRecord.find({ verificationStatus: 'VERIFIED' })
      .populate('student', 'name email avatar bio')
      .populate('verifiedBy', 'name role');

    res.json({
      success: true,
      achievers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Verify Achiever Profile (Faculty/Admin)
// @route POST /api/qa/achievers/verify
// @access Private (Faculty / Admin)
exports.verifyAchiever = async (req, res, next) => {
  try {
    const { studentId, achievementsSummary, codingBadges, hackathonsWon, internships, placements, expertiseAreas, verificationStatus, verificationComments } = req.body;

    let record = await AchieverRecord.findOne({ student: studentId });

    if (record) {
      record.achievementsSummary = achievementsSummary || record.achievementsSummary;
      record.codingBadges = codingBadges || record.codingBadges;
      record.hackathonsWon = hackathonsWon || record.hackathonsWon;
      record.internships = internships || record.internships;
      record.placements = placements || record.placements;
      record.expertiseAreas = expertiseAreas || record.expertiseAreas;
      record.verificationStatus = verificationStatus || 'VERIFIED';
      record.verificationComments = verificationComments || '';
      record.verifiedBy = req.user.id;
      await record.save();
    } else {
      record = await AchieverRecord.create({
        student: studentId,
        achievementsSummary: achievementsSummary || 'Verified High Academic & Technical Performer',
        codingBadges,
        hackathonsWon,
        internships,
        placements,
        expertiseAreas,
        verificationStatus: verificationStatus || 'VERIFIED',
        verificationComments,
        verifiedBy: req.user.id,
      });
    }

    if (verificationStatus === 'VERIFIED') {
      await StudentProfile.findOneAndUpdate({ user: studentId }, { isAchieverVerified: true });
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'VERIFY_ACHIEVER',
      targetEntity: 'AchieverRecord',
      entityId: record._id,
      details: `Verified achiever status for student ${studentId}`,
    });

    res.json({
      success: true,
      message: 'Achiever profile verified successfully.',
      record,
    });
  } catch (error) {
    next(error);
  }
};
