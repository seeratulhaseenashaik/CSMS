const mongoose = require('mongoose');

const achieverRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  achievementsSummary: {
    type: String,
    required: true,
  },
  cgpa: Number,
  codingBadges: [String], // e.g. "LeetCode Knight", "CodeChef 5-Star"
  hackathonsWon: [String],
  internships: [String],
  placements: [String],
  expertiseAreas: [String],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  verificationComments: String,
}, { timestamps: true });

module.exports = mongoose.model('AchieverRecord', achieverRecordSchema);
