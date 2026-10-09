const mongoose = require('mongoose');

const promotionRuleSchema = new mongoose.Schema({
  batch: {
    type: String,
    required: true, // e.g. "2023-2027"
  },
  degree: {
    type: String,
    default: 'B.Tech',
  },
  department: {
    type: String,
    required: true,
  },
  fromYear: {
    type: Number,
    required: true, // e.g. Year 2 to Year 3
  },
  toYear: {
    type: Number,
    required: true,
  },
  minPassedSubjectsRatio: {
    type: Number,
    required: true,
    default: 0.75, // 75% of subjects must be cleared
  },
  minEarnedCredits: {
    type: Number,
    required: true,
    default: 30,
  },
  maxPermittedBacklogs: {
    type: Number,
    required: true,
    default: 2,
  },
  compulsorySubjectCodes: [{
    type: String,
    uppercase: true,
  }],
  minAttendancePercentage: {
    type: Number,
    default: 75,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

promotionRuleSchema.index({ batch: 1, department: 1, fromYear: 1 }, { unique: true });

module.exports = mongoose.model('PromotionRule', promotionRuleSchema);
