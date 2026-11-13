const mongoose = require('mongoose');

const correctionRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['ATTENDANCE', 'MARKS', 'SECTION', 'TIMETABLE', 'ACADEMIC_RECORD'],
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },
  attendanceSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AttendanceSession',
  },
  sessionDate: {
    type: Date,
  },
  currentValue: {
    type: String,
    default: '',
  },
  requestedValue: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  resolutionNotes: {
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

correctionRequestSchema.index({ student: 1, createdAt: -1 });
correctionRequestSchema.index({ status: 1, type: 1 });
correctionRequestSchema.index({ subject: 1, status: 1 });

module.exports = mongoose.model('CorrectionRequest', correctionRequestSchema);
