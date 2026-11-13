const mongoose = require('mongoose');

const academicTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: ['ASSIGNMENT', 'ASSESSMENT', 'ATTENDANCE_CORRECTION', 'DEADLINE', 'TIMETABLE_CHANGE', 'TASK'],
    default: 'TASK',
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'PENDING', 'COMPLETED', 'OVERDUE', 'ARCHIVED'],
    default: 'PENDING',
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  assignedRole: {
    type: String,
    enum: ['student', 'faculty', 'administrator', 'all'],
    default: 'student',
  },
  assignedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },
  linkUrl: {
    type: String,
    default: '',
  },
  completedAt: {
    type: Date,
  },
}, { timestamps: true });

academicTaskSchema.index({ assignedRole: 1, dueDate: 1 });
academicTaskSchema.index({ assignedUser: 1, status: 1 });

module.exports = mongoose.model('AcademicTask', academicTaskSchema);
