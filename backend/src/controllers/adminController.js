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

// @desc Get System Dashboard Metrics
// @route GET /api/admin/dashboard
// @access Private (Admin)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalFaculty = await FacultyProfile.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalDepartments = await Department.countDocuments();

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
      },
      recentAudits,
    });
  } catch (error) {
    next(error);
  }
};
