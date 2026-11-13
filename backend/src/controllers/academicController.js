const InstitutionalSetting = require('../models/InstitutionalSetting');
const Timetable = require('../models/Timetable');
const CorrectionRequest = require('../models/CorrectionRequest');
const AcademicTask = require('../models/AcademicTask');
const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const SubjectResult = require('../models/SubjectResult');
const StudentProfile = require('../models/StudentProfile');
const Subject = require('../models/Subject');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc Get active institutional academic settings
// @route GET /api/academic/settings
// @access Private
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await InstitutionalSetting.getActiveSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get persisted timetable for current user (student, faculty, or class)
// @route GET /api/academic/timetable
// @access Private
exports.getTimetable = async (req, res, next) => {
  try {
    const user = req.user;
    const { classAndSection, day } = req.query;

    const settings = await InstitutionalSetting.getActiveSettings();
    const filter = {
      academicYear: settings.currentAcademicYear,
      semester: settings.currentSemester,
      isActive: true,
    };

    if (day) filter.day = day;

    if (user.role === 'faculty') {
      filter.faculty = user.id;
    } else if (user.role === 'student') {
      // Find student profile to match class or enrolled subjects
      const profile = await StudentProfile.findOne({ user: user.id });
      if (profile && profile.enrolledSubjects && profile.enrolledSubjects.length > 0) {
        filter.subject = { $in: profile.enrolledSubjects };
      }
      if (classAndSection) {
        filter.classAndSection = classAndSection;
      }
    } else if (classAndSection) {
      filter.classAndSection = classAndSection;
    }

    const entries = await Timetable.find(filter)
      .populate('subject', 'code name department credits subjectType')
      .populate('faculty', 'name email')
      .sort({ day: 1, period: 1 });

    // Group by day for convenience
    const byDay = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
    };

    entries.forEach((e) => {
      if (byDay[e.day]) byDay[e.day].push(e);
    });

    // Today's classes
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[new Date().getDay()];
    const todayClasses = byDay[currentDay] || [];

    res.json({
      success: true,
      count: entries.length,
      currentAcademicYear: settings.currentAcademicYear,
      currentSemester: settings.currentSemester,
      today: currentDay,
      todayClasses,
      schedule: byDay,
      entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get student correction requests
// @route GET /api/academic/corrections
// @access Private
exports.getCorrectionRequests = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, type } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    if (user.role === 'student') {
      filter.student = user.id;
    } else if (user.role === 'faculty') {
      // Faculty sees requests for subjects they teach
      const subjects = await Subject.find({ faculty: user.id });
      const subjectIds = subjects.map((s) => s._id);
      filter.$or = [
        { subject: { $in: subjectIds } },
        { type: { $in: ['ATTENDANCE', 'MARKS'] } },
      ];
    }
    // Administrator sees all requests

    const requests = await CorrectionRequest.find(filter)
      .populate('student', 'name email')
      .populate('subject', 'code name department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new correction request
// @route POST /api/academic/corrections
// @access Private (Student)
exports.createCorrectionRequest = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { type, subjectId, sessionDate, attendanceSessionId, currentValue, requestedValue, reason } = req.body;

    if (!type || !requestedValue || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Request type, requested value, and reason are required.',
      });
    }

    const request = await CorrectionRequest.create({
      student: studentId,
      type,
      subject: subjectId || null,
      sessionDate: sessionDate ? new Date(sessionDate) : null,
      attendanceSession: attendanceSessionId || null,
      currentValue: currentValue || '',
      requestedValue,
      reason,
      status: 'PENDING',
      auditTrail: [{
        modifiedBy: studentId,
        modifiedAt: new Date(),
        action: 'SUBMITTED_REQUEST',
        remarks: 'Correction request filed by student.',
      }],
    });

    // Notify subject faculty or admin
    let recipientId = null;
    if (subjectId) {
      const subject = await Subject.findById(subjectId);
      if (subject?.faculty) recipientId = subject.faculty;
    }
    if (!recipientId) {
      const admin = await User.findOne({ role: 'administrator' });
      if (admin) recipientId = admin._id;
    }

    if (recipientId) {
      await Notification.createIfNotDuplicate({
        recipient: recipientId,
        title: `New Correction Request: ${type}`,
        message: `Student ${req.user.name} submitted a ${type.toLowerCase()} correction request: "${reason.substring(0, 60)}..."`,
        type: 'CORRECTION_UPDATE',
        category: 'CORRECTION_REQUEST',
        priority: 'NORMAL',
        linkUrl: '/faculty/students',
        metadata: { requestId: request._id },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Correction request submitted successfully. It will be reviewed by academic staff.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Review (Approve or Reject) correction request
// @route PATCH /api/academic/corrections/:id/review
// @access Private (Faculty / Administrator)
exports.reviewCorrectionRequest = async (req, res, next) => {
  try {
    const reviewerId = req.user.id;
    const { id } = req.params;
    const { status, resolutionNotes = '' } = req.body;

    if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be APPROVED, REJECTED, or UNDER_REVIEW.',
      });
    }

    const request = await CorrectionRequest.findById(id).populate('subject');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Correction request not found.' });
    }

    request.status = status;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    request.resolutionNotes = resolutionNotes;
    request.auditTrail.push({
      modifiedBy: reviewerId,
      modifiedAt: new Date(),
      action: `STATUS_${status}`,
      remarks: resolutionNotes,
    });

    // If APPROVED, atomically apply the official record fix!
    if (status === 'APPROVED') {
      if (request.type === 'ATTENDANCE' && request.subject) {
        // Find matching attendance record to update
        let query = { student: request.student, subject: request.subject._id };
        if (request.sessionDate) {
          const sDate = new Date(request.sessionDate);
          const start = new Date(sDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(sDate);
          end.setHours(23, 59, 59, 999);
          query.sessionDate = { $gte: start, $lte: end };
        }

        const record = await AttendanceRecord.findOne(query);
        if (record) {
          const reqLower = request.requestedValue.toLowerCase();
          if (reqLower === 'present') {
            record.attendedClasses = 1;
            record.status = 'Present';
            record.approvedExemption = false;
          } else if (reqLower === 'excused') {
            record.attendedClasses = 1;
            record.status = 'Excused';
            record.approvedExemption = true;
            record.exemptionReason = resolutionNotes || 'Approved discrepancy correction';
          } else if (reqLower === 'absent') {
            record.attendedClasses = 0;
            record.status = 'Absent';
          }
          await record.save();
        }
      } else if (request.type === 'MARKS' && request.subject) {
        // Adjust marks record if numerical
        const parsedMarks = parseFloat(request.requestedValue);
        if (!isNaN(parsedMarks)) {
          const result = await SubjectResult.findOne({
            student: request.student,
            subject: request.subject._id,
          });
          if (result) {
            result.internalMarks = parsedMarks;
            result.auditTrail.push({
              modifiedBy: reviewerId,
              modifiedAt: new Date(),
              action: 'CORRECTION_APPLIED',
              remarks: `Updated internal marks based on request ${request._id}: ${resolutionNotes}`,
            });
            await result.save();
          }
        }
      }

      await AuditLog.create({
        user: reviewerId,
        action: 'APPROVE_CORRECTION_REQUEST',
        targetEntity: 'CorrectionRequest',
        entityId: request._id,
        details: `Approved ${request.type} correction request for student ${request.student}: ${resolutionNotes}`,
      });
    }

    await request.save();

    // Notify student of resolution
    await Notification.createIfNotDuplicate({
      recipient: request.student,
      title: `Correction Request ${status}: ${request.type}`,
      message: `Your correction request has been ${status.toLowerCase()}.${resolutionNotes ? ` Resolution note: "${resolutionNotes}"` : ''}`,
      type: 'CORRECTION_UPDATE',
      category: 'CORRECTION_REQUEST',
      priority: status === 'APPROVED' ? 'HIGH' : 'NORMAL',
      linkUrl: '/attendance',
      metadata: { requestId: request._id },
    });

    res.json({
      success: true,
      message: `Correction request ${status.toLowerCase()} successfully.`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get academic tasks
// @route GET /api/academic/tasks
// @access Private
exports.getAcademicTasks = async (req, res, next) => {
  try {
    const user = req.user;
    const { status, category, priority } = req.query;

    const filter = {
      $or: [
        { assignedRole: 'all' },
        { assignedRole: user.role },
        { assignedUser: user.id },
      ],
    };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const tasks = await AcademicTask.find(filter)
      .populate('subject', 'code name')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update academic task status (complete or archive)
// @route PATCH /api/academic/tasks/:id/status
// @access Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['UPCOMING', 'PENDING', 'COMPLETED', 'OVERDUE', 'ARCHIVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status.' });
    }

    const task = await AcademicTask.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.status = status;
    if (status === 'COMPLETED') {
      task.completedAt = new Date();
    }
    await task.save();

    res.json({
      success: true,
      message: `Task marked as ${status.toLowerCase()}.`,
      task,
    });
  } catch (error) {
    next(error);
  }
};
