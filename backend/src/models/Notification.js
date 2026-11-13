const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['ATTENDANCE_WARNING', 'RESULT_PUBLISHED', 'PROMOTION_ALERT', 'CLUB_UPDATE', 'QA_RESPONSE', 'ANNOUNCEMENT', 'CORRECTION_UPDATE', 'TIMETABLE_CHANGE'],
    default: 'ANNOUNCEMENT',
  },
  category: {
    type: String,
    enum: ['ATTENDANCE', 'MARKS', 'TIMETABLE', 'CORRECTION_REQUEST', 'PROMOTION', 'SYSTEM', 'CLUB', 'QA', 'ANNOUNCEMENT'],
    default: 'ANNOUNCEMENT',
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
  },
  linkUrl: {
    type: String,
    default: '',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

// Static helper to prevent duplicate spam notifications within a short time window (e.g. 10 mins)
notificationSchema.statics.createIfNotDuplicate = async function ({
  recipient,
  title,
  message,
  type = 'ANNOUNCEMENT',
  category = 'ANNOUNCEMENT',
  priority = 'NORMAL',
  linkUrl = '',
  metadata = {},
  suppressWindowMinutes = 10,
}) {
  const cutoff = new Date(Date.now() - suppressWindowMinutes * 60 * 1000);
  const existing = await this.findOne({
    recipient,
    title,
    type,
    createdAt: { $gte: cutoff },
  });

  if (existing) {
    return existing;
  }

  return this.create({
    recipient,
    title,
    message,
    type,
    category,
    priority,
    linkUrl,
    metadata,
  });
};

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
