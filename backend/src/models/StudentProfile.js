const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  department: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    default: 'B.Tech',
  },
  academicYear: {
    type: Number,
    required: true, // 1, 2, 3, 4
  },
  currentSemester: {
    type: Number,
    required: true, // 1 to 8
  },
  batch: {
    type: String,
    required: true, // e.g. "2023-2027"
  },
  cgpa: {
    type: Number,
    default: 0.0,
  },
  sgpa: {
    type: Number,
    default: 0.0,
  },
  earnedCredits: {
    type: Number,
    default: 0,
  },
  enrolledSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  guardianContact: {
    type: String,
    default: '',
  },
  isAchieverVerified: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
