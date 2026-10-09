const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Data Structures & Algorithms',
      'Full Stack Web Dev',
      'Placements & Internships',
      'Academics & Exam Prep',
      'Projects & Research',
      'Campus Life & Balance',
      'Higher Studies & GATE'
    ],
    default: 'Academics & Exam Prep',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  upvotesCount: {
    type: Number,
    default: 0,
  },
  answersCount: {
    type: Number,
    default: 0,
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
  },
  views: {
    type: Number,
    default: 0,
  },
  isReported: {
    type: Boolean,
    default: false,
  },
  reportReason: String,
}, { timestamps: true });

questionSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Question', questionSchema);
