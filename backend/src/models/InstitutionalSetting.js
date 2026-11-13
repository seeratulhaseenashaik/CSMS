const mongoose = require('mongoose');

const institutionalSettingSchema = new mongoose.Schema({
  institutionName: {
    type: String,
    default: 'Centralized Student Management System',
  },
  currentAcademicYear: {
    type: String,
    required: true,
    default: '2025-2026',
  },
  currentSemester: {
    type: Number,
    required: true,
    default: 5,
  },
  attendanceThreshold: {
    type: Number,
    required: true,
    default: 75, // in percent
  },
  availableSemesters: {
    type: [Number],
    default: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  availableAcademicYears: {
    type: [String],
    default: ['2023-2024', '2024-2025', '2025-2026', '2026-2027'],
  },
  allowStudentCorrectionRequests: {
    type: Boolean,
    default: true,
  },
  marksApprovalRequired: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Singleton helper to fetch or initialize default institutional settings
institutionalSettingSchema.statics.getActiveSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      institutionName: 'Centralized Student Management System',
      currentAcademicYear: '2025-2026',
      currentSemester: 5,
      attendanceThreshold: 75,
      availableSemesters: [1, 2, 3, 4, 5, 6, 7, 8],
      availableAcademicYears: ['2023-2024', '2024-2025', '2025-2026', '2026-2027'],
      allowStudentCorrectionRequests: true,
      marksApprovalRequired: true,
    });
  }
  return settings;
};

module.exports = mongoose.model('InstitutionalSetting', institutionalSettingSchema);
