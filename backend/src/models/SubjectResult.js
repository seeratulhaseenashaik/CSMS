const mongoose = require('mongoose');

const subjectResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  semester: {
    type: Number,
    required: true,
  },
  academicYear: {
    type: String,
    required: true, // e.g. "2025-2026"
  },
  internalMarks: {
    type: Number,
    default: 0,
  },
  midtermMarks: {
    type: Number,
    default: 0,
  },
  practicalMarks: {
    type: Number,
    default: 0,
  },
  endSemMarks: {
    type: Number,
    default: 0,
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
  maxMarks: {
    type: Number,
    default: 100,
  },
  grade: {
    type: String,
    enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F', 'PENDING'],
    default: 'PENDING',
  },
  gradePoints: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['PASS', 'FAIL', 'BACKLOG', 'PROVISIONAL', 'PENDING'],
    default: 'PENDING',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  workflowStatus: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Published'],
    default: 'Draft',
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  submittedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedAt: Date,
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  publishedAt: Date,
  approvalNotes: {
    type: String,
    default: '',
  },
  correctionNotes: {
    type: String,
    default: '',
  },
  auditTrail: [{
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    modifiedAt: { type: Date, default: Date.now },
    action: { type: String, required: true },
    remarks: String,
  }],
}, { timestamps: true });

// Sync workflowStatus and isPublished for backwards compatibility
subjectResultSchema.pre('save', function (next) {
  if (this.workflowStatus === 'Published') {
    this.isPublished = true;
  } else if (this.isModified('workflowStatus')) {
    this.isPublished = false;
  } else if (this.isPublished && this.workflowStatus === 'Draft') {
    this.workflowStatus = 'Published';
  }
  next();
});

subjectResultSchema.index({ student: 1, subject: 1, semester: 1 }, { unique: true });
subjectResultSchema.index({ workflowStatus: 1, subject: 1, semester: 1 });

module.exports = mongoose.model('SubjectResult', subjectResultSchema);
