const mongoose = require('mongoose');

const attendanceSessionSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  classAndSection: {
    type: String,
    required: true,
    trim: true,
    default: 'CSE-A',
  },
  academicYear: {
    type: String,
    required: true,
    default: '2025-2026',
  },
  semester: {
    type: Number,
    required: true,
    default: 5,
  },
  sessionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  period: {
    type: Number,
    required: true,
    default: 1,
  },
  sessionType: {
    type: String,
    enum: ['Lecture', 'Laboratory', 'Tutorial', 'Practical'],
    default: 'Lecture',
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Finalized', 'Corrected'],
    default: 'Draft',
  },
  submissionTimestamp: {
    type: Date,
  },
  finalizationTimestamp: {
    type: Date,
  },
  summary: {
    totalStudents: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
    excusedCount: { type: Number, default: 0 },
    attendancePercentage: { type: Number, default: 0 },
  },
  remarks: {
    type: String,
    default: '',
  },
  auditTrail: [{
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    action: { type: String, required: true },
    remarks: String,
  }],
}, { timestamps: true });

// Prevent duplicate sessions for same subject, class/section, normalized date, and period
attendanceSessionSchema.index({ subject: 1, classAndSection: 1, sessionDate: 1, period: 1 }, { unique: true });
attendanceSessionSchema.index({ faculty: 1, sessionDate: -1 });

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
