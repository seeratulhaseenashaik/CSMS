const mongoose = require('mongoose');

const clubMembershipSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected', 'former'],
    default: 'pending',
  },
  applicationText: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['Member', 'Core Team', 'Lead', 'Secretary', 'Vice President', 'President'],
    default: 'Member',
  },
  joinedDate: {
    type: Date,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewComments: String,
}, { timestamps: true });

clubMembershipSchema.index({ club: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ClubMembership', clubMembershipSchema);
