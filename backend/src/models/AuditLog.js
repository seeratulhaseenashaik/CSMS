const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true, // e.g. "RECORD_ATTENDANCE", "UPDATE_RESULT", "VERIFY_ACHIEVER", "CONFIGURE_RULE"
  },
  targetEntity: {
    type: String,
    required: true, // e.g. "AttendanceRecord", "SubjectResult", "PromotionRule"
  },
  entityId: mongoose.Schema.Types.ObjectId,
  details: {
    type: String,
    required: true,
  },
  ipAddress: String,
}, { timestamps: true });

auditLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
