const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const PromotionRule = require('../models/PromotionRule');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc Get all system users
// @route GET /api/admin/users
// @access Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new Department
// @route POST /api/admin/departments
// @access Private (Admin)
exports.createDepartment = async (req, res, next) => {
  try {
    const { code, name, description } = req.body;
    const dept = await Department.create({ code, name, description });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department: dept,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a new Subject
// @route POST /api/admin/subjects
// @access Private (Admin)
exports.createSubject = async (req, res, next) => {
  try {
    const { code, name, department, semester, credits, subjectType, maxMarks, minPassingMarks, internalMaxMarks, internalMinPassingMarks, endSemMaxMarks, endSemMinPassingMarks, faculty } = req.body;

    const subject = await Subject.create({
      code,
      name,
      department,
      semester,
      credits: credits || 4,
      subjectType: subjectType || 'Lecture',
      maxMarks: maxMarks || 100,
      minPassingMarks: minPassingMarks || 40,
      internalMaxMarks: internalMaxMarks || 30,
      internalMinPassingMarks: internalMinPassingMarks || 12,
      endSemMaxMarks: endSemMaxMarks || 70,
      endSemMinPassingMarks: endSemMinPassingMarks || 28,
      faculty,
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Configure Academic Promotion Rule
// @route POST /api/admin/promotion-rules
// @access Private (Admin)
exports.createPromotionRule = async (req, res, next) => {
  try {
    const { batch, degree, department, fromYear, toYear, minPassedSubjectsRatio, minEarnedCredits, maxPermittedBacklogs, compulsorySubjectCodes, minAttendancePercentage } = req.body;

    let rule = await PromotionRule.findOne({ batch, department, fromYear });

    if (rule) {
      rule.minPassedSubjectsRatio = minPassedSubjectsRatio ?? rule.minPassedSubjectsRatio;
      rule.minEarnedCredits = minEarnedCredits ?? rule.minEarnedCredits;
      rule.maxPermittedBacklogs = maxPermittedBacklogs ?? rule.maxPermittedBacklogs;
      rule.compulsorySubjectCodes = compulsorySubjectCodes || rule.compulsorySubjectCodes;
      rule.minAttendancePercentage = minAttendancePercentage ?? rule.minAttendancePercentage;
      await rule.save();
    } else {
      rule = await PromotionRule.create({
        batch,
        degree: degree || 'B.Tech',
        department,
        fromYear,
        toYear: toYear || (fromYear + 1),
        minPassedSubjectsRatio: minPassedSubjectsRatio || 0.75,
        minEarnedCredits: minEarnedCredits || 30,
        maxPermittedBacklogs: maxPermittedBacklogs ?? 2,
        compulsorySubjectCodes: compulsorySubjectCodes || [],
        minAttendancePercentage: minAttendancePercentage || 75,
      });
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'CONFIGURE_PROMOTION_RULE',
      targetEntity: 'PromotionRule',
      entityId: rule._id,
      details: `Configured promotion rule for batch ${batch}, department ${department}, year ${fromYear} -> ${toYear}`,
    });

    res.status(201).json({
      success: true,
      message: 'Promotion rule configured successfully.',
      rule,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all promotion rules
// @route GET /api/admin/promotion-rules
// @access Private (Admin / Student)
exports.getPromotionRules = async (req, res, next) => {
  try {
    const rules = await PromotionRule.find({ isActive: true }).sort({ batch: -1, fromYear: 1 });
    res.json({
      success: true,
      rules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Publish Official Announcement to all students/users
// @route POST /api/admin/announcements
// @access Private (Admin)
exports.publishAnnouncement = async (req, res, next) => {
  try {
    const { title, message, linkUrl, targetRole } = req.body;

    const filter = targetRole ? { role: targetRole } : {};
    const users = await User.find(filter);

    const notifications = users.map(user => ({
      recipient: user._id,
      title: title || 'Official Announcement',
      message,
      type: 'ANNOUNCEMENT',
      linkUrl: linkUrl || '',
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Announcement published to ${users.length} user(s).`,
    });
  } catch (error) {
    next(error);
  }
};

const InstitutionalSetting = require('../models/InstitutionalSetting');
const Timetable = require('../models/Timetable');
const CorrectionRequest = require('../models/CorrectionRequest');

// @desc Get System Dashboard Metrics
// @route GET /api/admin/dashboard
// @access Private (Admin)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalFaculty = await FacultyProfile.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const pendingCorrections = await CorrectionRequest.countDocuments({ status: 'PENDING' });

    const recentAudits = await AuditLog.find()
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      metrics: {
        totalStudents,
        totalFaculty,
        totalSubjects,
        totalDepartments,
        pendingCorrections,
      },
      recentAudits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all subjects with department and assigned faculty
// @route GET /api/admin/subjects
// @access Private (Admin)
exports.getSubjects = async (req, res, next) => {
  try {
    const { department, semester, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const subjects = await Subject.find(filter)
      .populate('faculty', 'name email')
      .sort({ department: 1, semester: 1, code: 1 });

    res.json({
      success: true,
      count: subjects.length,
      subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update an existing Subject
// @route PUT /api/admin/subjects/:id
// @access Private (Admin)
exports.updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const subject = await Subject.findByIdAndUpdate(id, updates, { new: true })
      .populate('faculty', 'name email');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_SUBJECT',
      targetEntity: 'Subject',
      entityId: subject._id,
      details: `Updated subject ${subject.code} (${subject.name})`,
    });

    res.json({
      success: true,
      message: 'Subject updated successfully.',
      subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete / Deactivate a Subject
// @route DELETE /api/admin/subjects/:id
// @access Private (Admin)
exports.deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_SUBJECT',
      targetEntity: 'Subject',
      entityId: id,
      details: `Deleted subject ${subject.code} (${subject.name})`,
    });

    res.json({
      success: true,
      message: 'Subject deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all departments
// @route GET /api/admin/departments
// @access Private (Admin)
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ code: 1 });
    res.json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get institutional settings
// @route GET /api/admin/settings
// @access Private (Admin)
exports.getAdminSettings = async (req, res, next) => {
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

// @desc Update institutional settings
// @route PUT /api/admin/settings
// @access Private (Admin)
exports.updateAdminSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    let settings = await InstitutionalSetting.findOne();
    if (!settings) {
      settings = new InstitutionalSetting(updates);
    } else {
      Object.assign(settings, updates);
    }
    settings.updatedBy = req.user.id;
    await settings.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_SETTINGS',
      targetEntity: 'InstitutionalSetting',
      entityId: settings._id,
      details: `Updated institutional settings: academicYear=${settings.currentAcademicYear}, semester=${settings.currentSemester}, threshold=${settings.attendanceThreshold}%`,
    });

    res.json({
      success: true,
      message: 'Institutional settings updated successfully.',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get full timetable for administration
// @route GET /api/admin/timetable
// @access Private (Admin)
exports.getAdminTimetable = async (req, res, next) => {
  try {
    const { day, department, classAndSection } = req.query;
    const filter = { isActive: true };
    if (day) filter.day = day;
    if (department) filter.department = department;
    if (classAndSection) filter.classAndSection = classAndSection;

    const entries = await Timetable.find(filter)
      .populate('subject', 'code name department credits')
      .populate('faculty', 'name email')
      .sort({ day: 1, period: 1 });

    res.json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Create a timetable slot with conflict detection
// @route POST /api/admin/timetable
// @access Private (Admin)
exports.createTimetableEntry = async (req, res, next) => {
  try {
    const {
      subject,
      faculty,
      classAndSection,
      department,
      day,
      startTime,
      endTime,
      classroom,
      academicYear,
      semester,
      period,
      type,
    } = req.body;

    // Run conflict detection
    const conflictCheck = await Timetable.detectConflicts({
      faculty,
      classAndSection,
      classroom,
      day,
      startTime,
      endTime,
      academicYear,
      semester,
    });

    if (conflictCheck.hasConflict) {
      return res.status(409).json({
        success: false,
        message: 'Timetable conflict detected.',
        conflicts: conflictCheck.conflicts,
      });
    }

    const entry = await Timetable.create({
      subject,
      faculty,
      classAndSection,
      department,
      day,
      startTime,
      endTime,
      classroom,
      academicYear: academicYear || '2025-2026',
      semester: semester || 5,
      period: period || 1,
      type: type || 'Lecture',
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_TIMETABLE_SLOT',
      targetEntity: 'Timetable',
      entityId: entry._id,
      details: `Scheduled ${day} ${startTime}-${endTime} in ${classroom} for ${classAndSection}`,
    });

    res.status(201).json({
      success: true,
      message: 'Timetable slot created successfully.',
      entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete a timetable slot
// @route DELETE /api/admin/timetable/:id
// @access Private (Admin)
exports.deleteTimetableEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entry = await Timetable.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable slot not found.' });
    }

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_TIMETABLE_SLOT',
      targetEntity: 'Timetable',
      entityId: id,
      details: `Removed timetable slot ${entry.day} ${entry.startTime}-${entry.endTime}`,
    });

    res.json({
      success: true,
      message: 'Timetable slot removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get audit logs with filtering and pagination
// @route GET /api/admin/audit-logs
// @access Private (Admin)
exports.getAdminAuditLogs = async (req, res, next) => {
  try {
    const { action, targetEntity, limit = 50 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (targetEntity) filter.targetEntity = targetEntity;

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
