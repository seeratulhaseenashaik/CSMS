const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
    default: 4,
  },
  subjectType: {
    type: String,
    enum: ['Lecture', 'Laboratory', 'Tutorial', 'Practical', 'Project'],
    default: 'Lecture',
  },
  maxMarks: {
    type: Number,
    default: 100,
  },
  minPassingMarks: {
    type: Number,
    default: 40,
  },
  internalMaxMarks: {
    type: Number,
    default: 30,
  },
  internalMinPassingMarks: {
    type: Number,
    default: 12,
  },
  endSemMaxMarks: {
    type: Number,
    default: 70,
  },
  endSemMinPassingMarks: {
    type: Number,
    default: 28,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

subjectSchema.index({ code: 1, department: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
