const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classAndSection: {
    type: String,
    required: true,
    trim: true,
    default: 'CSE-A',
  },
  department: {
    type: String,
    required: true,
    default: 'CSE',
  },
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true,
  },
  startTime: {
    type: String,
    required: true, // e.g. "09:30 AM"
  },
  endTime: {
    type: String,
    required: true, // e.g. "10:30 AM"
  },
  classroom: {
    type: String,
    required: true, // e.g. "Room CS-301", "Lab 2"
  },
  academicYear: {
    type: String,
    required: true,
    default: '2025-2026',
  },
  semester: {
    type: Number,
    required: true,
    default: 5,
  },
  period: {
    type: Number,
    required: true,
    default: 1,
  },
  type: {
    type: String,
    enum: ['Lecture', 'Laboratory', 'Tutorial', 'Practical'],
    default: 'Lecture',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Convert standard time string "09:30 AM" to minutes from midnight for interval overlap check
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(' ');
  const [hoursStr, minsStr] = parts[0].split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minsStr, 10) || 0;
  const isPM = parts[1] && parts[1].toUpperCase() === 'PM';
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Check for timetable conflicts (faculty, class/section, or classroom)
timetableSchema.statics.detectConflicts = async function ({
  faculty,
  classAndSection,
  classroom,
  day,
  startTime,
  endTime,
  academicYear = '2025-2026',
  semester = 5,
  excludeId = null,
}) {
  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  const filter = {
    day,
    academicYear,
    semester,
    isActive: true,
  };
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const existingEntries = await this.find(filter)
    .populate('subject', 'code name')
    .populate('faculty', 'name');

  const conflicts = [];

  for (const entry of existingEntries) {
    const existStart = timeToMinutes(entry.startTime);
    const existEnd = timeToMinutes(entry.endTime);

    // Overlap condition: start < existEnd && end > existStart
    const isOverlapping = (newStart < existEnd && newEnd > existStart);

    if (isOverlapping) {
      if (faculty && entry.faculty && entry.faculty._id.toString() === faculty.toString()) {
        conflicts.push({
          type: 'FACULTY_CONFLICT',
          message: `Faculty ${entry.faculty.name} is already scheduled for ${entry.subject?.code || 'another subject'} (${entry.startTime} - ${entry.endTime}) in ${entry.classroom}.`,
          conflictingEntry: entry,
        });
      }
      if (classAndSection && entry.classAndSection.toLowerCase() === classAndSection.toLowerCase()) {
        conflicts.push({
          type: 'CLASS_CONFLICT',
          message: `Class ${classAndSection} already has ${entry.subject?.code || 'a lecture'} scheduled at ${entry.startTime} - ${entry.endTime}.`,
          conflictingEntry: entry,
        });
      }
      if (classroom && entry.classroom.toLowerCase() === classroom.toLowerCase()) {
        conflicts.push({
          type: 'CLASSROOM_CONFLICT',
          message: `Classroom ${classroom} is already occupied by ${entry.classAndSection} for ${entry.subject?.code || 'class'} (${entry.startTime} - ${entry.endTime}).`,
          conflictingEntry: entry,
        });
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
};

timetableSchema.index({ faculty: 1, day: 1 });
timetableSchema.index({ classAndSection: 1, day: 1 });
timetableSchema.index({ classroom: 1, day: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
