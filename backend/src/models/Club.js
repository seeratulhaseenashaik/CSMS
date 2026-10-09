const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Coding & Programming',
      'Robotics & Electronics',
      'Artificial Intelligence',
      'Entrepreneurship & Innovation',
      'Cultural & Arts',
      'Dance & Music',
      'Photography & Media',
      'Debate & Literature',
      'Sports & Fitness',
      'Social Service'
    ],
  },
  description: {
    type: String,
    required: true,
  },
  facultyCoordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  studentLeaders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  eligibilityRules: {
    type: String,
    default: 'Open to all students with minimum 60% attendance.',
  },
  meetingSchedule: {
    type: String,
    default: 'Every Wednesday 4:00 PM',
  },
  location: {
    type: String,
    default: 'Student Activity Center',
  },
  contactEmail: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
