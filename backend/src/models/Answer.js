const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  upvotesCount: {
    type: Number,
    default: 0,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  isReported: {
    type: Boolean,
    default: false,
  },
  reportReason: String,
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
