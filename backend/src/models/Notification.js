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
    enum: ['ATTENDANCE_WARNING', 'RESULT_PUBLISHED', 'PROMOTION_ALERT', 'CLUB_UPDATE', 'QA_RESPONSE', 'ANNOUNCEMENT'],
    default: 'ANNOUNCEMENT',
  },
  linkUrl: {
    type: String,
    default: '',
  },
  isRead: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
