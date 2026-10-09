const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetType: {
    type: String,
    enum: ['Question', 'Answer'],
    required: true,
  },
  voteType: {
    type: Number, // 1 for upvote, -1 for downvote
    required: true,
    enum: [1, -1],
  }
}, { timestamps: true });

voteSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
