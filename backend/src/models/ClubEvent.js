const mongoose = require('mongoose');

const clubEventSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  registrationDeadline: Date,
  maxParticipants: {
    type: Number,
    default: 100,
  },
  participants: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    attended: {
      type: Boolean,
      default: false,
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

module.exports = mongoose.model('ClubEvent', clubEventSchema);
