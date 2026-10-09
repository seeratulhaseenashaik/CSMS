const mongoose = require('mongoose');

const subjectResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  academicYear: {
    type: String,
    required: true, // e.g. "2025-2026"
  },
  internalMarks: {
    type: Number,
    default: 0,
  },
  midtermMarks: {
    type: Number,
    default: 0,
  },
  practicalMarks: {
    type: Number,
    default: 0,
  },
  endSemMarks: {
    type: Number,
    default: 0,
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
  maxMarks: {
    type: Number,
    default: 100,
  },
  grade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'PENDING'],
    default: 'PENDING',
  },
  gradePoints: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['PASS', 'FAIL', 'BACKLOG', 'PROVISIONAL', 'PENDING'],
    default: 'PENDING',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

subjectResultSchema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('SubjectResult', subjectResultSchema);
