const mongoose = require('mongoose');

const facultyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  department: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    enum: ['Assistant Professor', 'Associate Professor', 'Professor', 'HOD', 'Dean'],
    default: 'Assistant Professor',
  },
  assignedSubjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  officeHours: {
    type: String,
    default: 'Mon-Fri 2PM - 4PM',
  }
}, { timestamps: true });

module.exports = mongoose.model('FacultyProfile', facultyProfileSchema);
