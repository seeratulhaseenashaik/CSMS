const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
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
  totalClasses: {
    type: Number,
    required: true,
    min: 0,
  },
  attendedClasses: {
    type: Number,
    required: true,
    min: 0,
  },
  sessionDate: {
    type: Date,
    default: Date.now,
  },
  sessionType: {
    type: String,
    enum: ['Lecture', 'Laboratory', 'Tutorial', 'Practical'],
    default: 'Lecture',
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedExemption: {
    type: Boolean,
    default: false,
  },
  exemptionReason: {
    type: String,
    default: '',
  },
  remarks: String,
}, { timestamps: true });

// Ensure unique index per student, subject, and session date
attendanceRecordSchema.index({ student: 1, subject: 1, sessionDate: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
