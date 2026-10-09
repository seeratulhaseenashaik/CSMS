const AttendanceRecord = require('../models/AttendanceRecord');
const Subject = require('../models/Subject');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const {
  calculateAttendancePercentage,
  calculateClassesToReachTarget,
  calculateBunkAllowance,
  predictFutureAttendance,
  getAttendanceStatus,
} = require('../utils/attendanceCalculator');

// @desc Get student overall and subject-wise attendance with smart calculations
// @route GET /api/attendance/me
// @access Private (Student)
exports.getMyAttendance = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const targetThreshold = Number(req.query.targetThreshold) || 0.75; // Default 75%

    const records = await AttendanceRecord.find({ student: studentId })
      .populate('subject', 'code name credits semester subjectType')
      .populate('faculty', 'name email');

    // Aggregate by subject
    const subjectMap = {};
    let totalClassesAll = 0;
    let attendedClassesAll = 0;

    for (const rec of records) {
      if (!rec.subject) continue;
      const subId = rec.subject._id.toString();

      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          subject: rec.subject,
          totalClasses: 0,
          attendedClasses: 0,
          approvedExemptionsCount: 0,
          recordsList: [],
        };
      }

      subjectMap[subId].totalClasses += rec.totalClasses;
      subjectMap[subId].attendedClasses += rec.attendedClasses;
      if (rec.approvedExemption) {
        subjectMap[subId].approvedExemptionsCount += 1;
      }
      subjectMap[subId].recordsList.push(rec);

      totalClassesAll += rec.totalClasses;
      attendedClassesAll += rec.attendedClasses;
    }

    const subjectBreakdown = Object.values(subjectMap).map((item) => {
      const percentage = calculateAttendancePercentage(item.attendedClasses, item.totalClasses);
      const classesNeeded = calculateClassesToReachTarget(item.attendedClasses, item.totalClasses, targetThreshold);
      const bunkAllowance = calculateBunkAllowance(item.attendedClasses, item.totalClasses, targetThreshold);
      const status = getAttendanceStatus(percentage, targetThreshold * 100);

      return {
        subject: item.subject,
        totalClasses: item.totalClasses,
        attendedClasses: item.attendedClasses,
        missedClasses: Math.max(0, item.totalClasses - item.attendedClasses),
        percentage,
        targetThresholdPct: targetThreshold * 100,
        classesNeededToReachTarget: classesNeeded,
        bunkAllowance,
        approvedExemptionsCount: item.approvedExemptionsCount,
        status,
        recentSessions: item.recordsList.slice(0, 5),
      };
    });

    const overallPercentage = calculateAttendancePercentage(attendedClassesAll, totalClassesAll);
    const overallClassesNeeded = calculateClassesToReachTarget(attendedClassesAll, totalClassesAll, targetThreshold);
    const overallBunkAllowance = calculateBunkAllowance(attendedClassesAll, totalClassesAll, targetThreshold);
    const overallStatus = getAttendanceStatus(overallPercentage, targetThreshold * 100);

    const shortages = subjectBreakdown.filter((s) => s.percentage < targetThreshold * 100);

    res.json({
      success: true,
      overall: {
        totalClasses: totalClassesAll,
        attendedClasses: attendedClassesAll,
        missedClasses: Math.max(0, totalClassesAll - attendedClassesAll),
        percentage: overallPercentage,
        targetThresholdPct: targetThreshold * 100,
        classesNeededToReachTarget: overallClassesNeeded,
        bunkAllowance: overallBunkAllowance,
        status: overallStatus,
        shortageCount: shortages.length,
      },
      subjectBreakdown,
      shortageAlerts: shortages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Smart Attendance Calculator query endpoint
// @route GET /api/attendance/calculator
// @access Private
exports.calculateAttendance = async (req, res, next) => {
  try {
    const attended = Number(req.query.attended) || 0;
    const total = Number(req.query.total) || 0;
    const futureAttended = Number(req.query.futureAttended) || 0;
    const targetThreshold = Number(req.query.targetThreshold) || 0.75;

    const percentage = calculateAttendancePercentage(attended, total);
    const classesNeeded = calculateClassesToReachTarget(attended, total, targetThreshold);
    const bunkAllowance = calculateBunkAllowance(attended, total, targetThreshold);
    const projection = predictFutureAttendance(attended, total, futureAttended, targetThreshold);
    const status = getAttendanceStatus(percentage, targetThreshold * 100);

    res.json({
      success: true,
      calculation: {
        attended,
        total,
        percentage,
        targetThresholdPct: targetThreshold * 100,
        classesNeededToReachTarget: classesNeeded,
        bunkAllowance,
        status,
        futurePrediction: {
          futureAttended,
          projectedPercentage: projection.projectedPercentage,
          meetsTarget: projection.meetsTarget,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Record or update attendance for a class session (Faculty/Admin)
// @route POST /api/attendance/records
// @access Private (Faculty / Admin)
exports.recordAttendance = async (req, res, next) => {
  try {
    const { studentId, subjectId, totalClasses, attendedClasses, sessionDate, sessionType, remarks, approvedExemption, exemptionReason } = req.body;

    let record = await AttendanceRecord.findOne({
      student: studentId,
      subject: subjectId,
      sessionDate: new Date(sessionDate || Date.now()),
    });

    if (record) {
      // Update existing record
      record.totalClasses = totalClasses;
      record.attendedClasses = attendedClasses;
      record.sessionType = sessionType || record.sessionType;
      record.remarks = remarks || record.remarks;
      record.approvedExemption = approvedExemption ?? record.approvedExemption;
      record.exemptionReason = exemptionReason || record.exemptionReason;
      await record.save();
    } else {
      // Create new record
      record = await AttendanceRecord.create({
        student: studentId,
        subject: subjectId,
        totalClasses,
        attendedClasses,
        sessionDate: sessionDate || new Date(),
        sessionType: sessionType || 'Lecture',
        faculty: req.user.id,
        remarks,
        approvedExemption: approvedExemption || false,
        exemptionReason,
      });
    }

    // Check if student attendance is now in shortage and issue notification if needed
    const allRecords = await AttendanceRecord.find({ student: studentId, subject: subjectId });
    const totalConduct = allRecords.reduce((acc, r) => acc + r.totalClasses, 0);
    const totalAttend = allRecords.reduce((acc, r) => acc + r.attendedClasses, 0);
    const pct = calculateAttendancePercentage(totalAttend, totalConduct);

    if (pct < 75) {
      const subject = await Subject.findById(subjectId);
      await Notification.create({
        recipient: studentId,
        title: 'Attendance Shortage Alert',
        message: `Your attendance in ${subject?.name || 'a subject'} has fallen to ${pct}%, which is below the 75% threshold.`,
        type: 'ATTENDANCE_WARNING',
        linkUrl: '/attendance',
      });
    }

    // Log Audit Trail
    await AuditLog.create({
      user: req.user.id,
      action: 'RECORD_ATTENDANCE',
      targetEntity: 'AttendanceRecord',
      entityId: record._id,
      details: `Recorded attendance for student ${studentId} in subject ${subjectId}: Attended ${attendedClasses}/${totalClasses}`,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully.',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get attendance records for a specific subject (Faculty/Admin)
// @route GET /api/attendance/subject/:subjectId
// @access Private (Faculty / Admin)
exports.getSubjectAttendance = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const records = await AttendanceRecord.find({ subject: subjectId })
      .populate('student', 'name email')
      .sort({ sessionDate: -1 });

    res.json({
      success: true,
      records,
    });
  } catch (error) {
    next(error);
  }
};
