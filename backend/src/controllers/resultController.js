const SubjectResult = require('../models/SubjectResult');
const Subject = require('../models/Subject');
const StudentProfile = require('../models/StudentProfile');
const PromotionRule = require('../models/PromotionRule');
const AttendanceRecord = require('../models/AttendanceRecord');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { evaluateSubjectStatus, calculateSGPA, calculateCGPA } = require('../utils/gpaCalculator');
const { evaluatePromotionEligibility } = require('../utils/progressionEvaluator');
const { calculateAttendancePercentage } = require('../utils/attendanceCalculator');

// @desc Get current student's scorecard, SGPA, CGPA, and backlogs
// @route GET /api/results/me
// @access Private (Student/Admin)
exports.getMyResults = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const isStaff = req.user.role === 'administrator';

    const profile = await StudentProfile.findOne({ user: studentId });
    const queryFilter = { student: studentId };
    if (!isStaff) {
      queryFilter.$or = [
        { workflowStatus: 'Published' },
        { isPublished: true, workflowStatus: { $ne: 'Draft' } },
      ];
    }

    const results = await SubjectResult.find(queryFilter)
      .populate('subject', 'code name department credits semester subjectType maxMarks minPassingMarks internalMinPassingMarks endSemMinPassingMarks')
      .sort({ semester: 1 });

    const subjectsMap = {};
    const semesterMap = {};

    let totalEarnedCredits = 0;
    let passedCount = 0;
    let backlogCount = 0;
    let pendingCount = 0;

    for (const resItem of results) {
      if (!resItem.subject) continue;
      const subId = resItem.subject._id.toString();
      subjectsMap[subId] = resItem.subject;

      // Evaluate detailed subject status
      const evaluation = evaluateSubjectStatus(resItem, resItem.subject);
      resItem._doc.evaluation = evaluation;

      if (resItem.status === 'PASS') {
        passedCount += 1;
        totalEarnedCredits += resItem.subject.credits || 0;
      } else if (resItem.status === 'FAIL' || resItem.status === 'BACKLOG') {
        backlogCount += 1;
      } else {
        pendingCount += 1;
      }

      // Group by semester for SGPA calculation
      const sem = resItem.semester;
      if (!semesterMap[sem]) {
        semesterMap[sem] = [];
      }
      semesterMap[sem].push(resItem);
    }

    // Calculate SGPA for each semester
    const semestersSgpaList = Object.keys(semesterMap).map((sem) => {
      const semResults = semesterMap[sem];
      const sgpa = calculateSGPA(semResults, subjectsMap);
      const credits = semResults.reduce((acc, r) => acc + (r.subject?.credits || 0), 0);
      return {
        semester: Number(sem),
        sgpa,
        credits,
        resultsCount: semResults.length,
      };
    });

    // Calculate overall CGPA
    const cgpa = calculateCGPA(semestersSgpaList);

    // Update StudentProfile with latest CGPA & credits
    if (profile) {
      profile.cgpa = cgpa;
      profile.earnedCredits = totalEarnedCredits;
      if (semestersSgpaList.length > 0) {
        const currentSemSgpa = semestersSgpaList.find(s => s.semester === profile.currentSemester);
        if (currentSemSgpa) profile.sgpa = currentSemSgpa.sgpa;
      }
      await profile.save();
    }

    res.json({
      success: true,
      summary: {
        totalEnrolledSubjects: results.length,
        passedSubjects: passedCount,
        failedSubjects: backlogCount,
        pendingResults: pendingCount,
        earnedCredits: totalEarnedCredits,
        sgpa: profile?.sgpa || 0,
        cgpa,
      },
      semestersSgpaList,
      scorecard: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Enter or update assessment marks for a student (Faculty/Admin)
// @route POST /api/results
// @access Private (Faculty / Admin)
exports.enterResult = async (req, res, next) => {
  try {
    const { studentId, subjectId, semester, academicYear, internalMarks, midtermMarks, practicalMarks, endSemMarks, isPublished } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    let result = await SubjectResult.findOne({
      student: studentId,
      subject: subjectId,
      semester: semester || subject.semester,
    });

    const dummyRes = {
      internalMarks: internalMarks ?? (result?.internalMarks || 0),
      midtermMarks: midtermMarks ?? (result?.midtermMarks || 0),
      practicalMarks: practicalMarks ?? (result?.practicalMarks || 0),
      endSemMarks: endSemMarks ?? (result?.endSemMarks || 0),
    };

    const evalRes = evaluateSubjectStatus(dummyRes, subject);

    if (result) {
      result.internalMarks = dummyRes.internalMarks;
      result.midtermMarks = dummyRes.midtermMarks;
      result.practicalMarks = dummyRes.practicalMarks;
      result.endSemMarks = dummyRes.endSemMarks;
      result.totalMarks = evalRes.totalMarks;
      result.grade = evalRes.grade;
      result.gradePoints = evalRes.gradePoints;
      result.status = evalRes.status;
      result.isPublished = isPublished ?? result.isPublished;
      if (isPublished) result.publishedBy = req.user.id;
      await result.save();
    } else {
      result = await SubjectResult.create({
        student: studentId,
        subject: subjectId,
        semester: semester || subject.semester,
        academicYear: academicYear || '2025-2026',
        internalMarks: dummyRes.internalMarks,
        midtermMarks: dummyRes.midtermMarks,
        practicalMarks: dummyRes.practicalMarks,
        endSemMarks: dummyRes.endSemMarks,
        totalMarks: evalRes.totalMarks,
        maxMarks: subject.maxMarks || 100,
        grade: evalRes.grade,
        gradePoints: evalRes.gradePoints,
        status: evalRes.status,
        isPublished: isPublished || false,
        publishedBy: isPublished ? req.user.id : undefined,
      });
    }

    // Notify student if published
    if (result.isPublished) {
      await Notification.create({
        recipient: studentId,
        title: 'New Examination Result Published',
        message: `Your result for ${subject.name} (${subject.code}) has been published: Grade ${result.grade}.`,
        type: 'RESULT_PUBLISHED',
        linkUrl: '/results',
      });
    }

    // Log Audit
    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_RESULT',
      targetEntity: 'SubjectResult',
      entityId: result._id,
      details: `Updated marks for student ${studentId} in ${subject.code}: Total ${result.totalMarks}/${subject.maxMarks}, Grade: ${result.grade}`,
    });

    res.status(201).json({
      success: true,
      message: 'Result saved successfully.',
      result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Evaluate Student Academic Progression & Promotion Eligibility
// @route GET /api/academic/progression
// @access Private (Student/Admin)
exports.getProgressionEligibility = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const studentProfile = await StudentProfile.findOne({ user: studentId });
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // Find active promotion rule matching student's batch and department
    const rule = await PromotionRule.findOne({
      batch: studentProfile.batch,
      department: studentProfile.department,
      fromYear: studentProfile.academicYear,
      isActive: true,
    });

    // Fetch all subject results
    const subjectResults = await SubjectResult.find({ student: studentId })
      .populate('subject', 'code name credits semester');

    // Calculate student overall attendance
    const attendanceRecords = await AttendanceRecord.find({ student: studentId });
    const totalConduct = attendanceRecords.reduce((acc, r) => acc + r.totalClasses, 0);
    const totalAttend = attendanceRecords.reduce((acc, r) => acc + r.attendedClasses, 0);
    const overallAttendancePct = calculateAttendancePercentage(totalAttend, totalConduct);

    const evaluation = evaluatePromotionEligibility(studentProfile, subjectResults, rule, overallAttendancePct);

    res.json({
      success: true,
      student: {
        registrationNumber: studentProfile.registrationNumber,
        department: studentProfile.department,
        academicYear: studentProfile.academicYear,
        currentSemester: studentProfile.currentSemester,
        batch: studentProfile.batch,
        cgpa: studentProfile.cgpa,
        earnedCredits: studentProfile.earnedCredits,
      },
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get pending marks submissions awaiting approval or publication
// @route GET /api/results/pending-approvals
// @access Private (Admin / Academic Staff)
exports.getPendingMarksApprovals = async (req, res, next) => {
  try {
    const { status = 'Submitted' } = req.query;

    const results = await SubjectResult.find({ workflowStatus: status })
      .populate('subject', 'code name department semester credits')
      .populate('student', 'name email')
      .populate('submittedBy', 'name email')
      .sort({ updatedAt: -1 });

    // Group by subject and semester
    const grouped = {};
    for (const r of results) {
      if (!r.subject) continue;
      const key = `${r.subject._id.toString()}_${r.semester}_${r.academicYear}`;
      if (!grouped[key]) {
        grouped[key] = {
          subject: r.subject,
          semester: r.semester,
          academicYear: r.academicYear,
          workflowStatus: r.workflowStatus,
          submittedBy: r.submittedBy,
          submittedAt: r.submittedAt,
          records: [],
        };
      }
      grouped[key].records.push(r);
    }

    res.json({
      success: true,
      count: Object.keys(grouped).length,
      submissions: Object.values(grouped),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Approve marks submitted by faculty
// @route POST /api/results/approve
// @access Private (Admin / Designated Academic Staff)
exports.approveMarks = async (req, res, next) => {
  try {
    const { subjectId, semester, academicYear, approvalNotes = '' } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'subjectId is required.' });
    }

    const filter = {
      subject: subjectId,
      workflowStatus: 'Submitted',
    };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const results = await SubjectResult.find(filter);
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No submitted marks pending approval for this subject.' });
    }

    const updated = await SubjectResult.updateMany(filter, {
      $set: {
        workflowStatus: 'Approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        approvalNotes,
      },
      $push: {
        auditTrail: {
          modifiedBy: req.user.id,
          modifiedAt: new Date(),
          action: 'APPROVED_MARKS',
          remarks: approvalNotes || 'Approved by academic staff',
        },
      },
    });

    const subject = await Subject.findById(subjectId);
    await AuditLog.create({
      user: req.user.id,
      action: 'APPROVE_MARKS',
      targetEntity: 'SubjectResult',
      entityId: subjectId,
      details: `Approved marks for ${results.length} students in ${subject?.code || subjectId}.`,
    });

    res.json({
      success: true,
      message: `Successfully approved marks for ${results.length} students.`,
      approvedCount: results.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Publish approved marks (making them visible to students)
// @route POST /api/results/publish
// @access Private (Admin)
exports.publishMarks = async (req, res, next) => {
  try {
    const { subjectId, semester, academicYear } = req.body;

    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'subjectId is required.' });
    }

    const filter = {
      subject: subjectId,
      workflowStatus: { $in: ['Approved', 'Submitted'] },
    };
    if (semester) filter.semester = semester;
    if (academicYear) filter.academicYear = academicYear;

    const results = await SubjectResult.find(filter).populate('subject', 'code name');
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'No approved marks available for publication.' });
    }

    for (const r of results) {
      r.workflowStatus = 'Published';
      r.isPublished = true;
      r.publishedBy = req.user.id;
      r.publishedAt = new Date();
      r.auditTrail.push({
        modifiedBy: req.user.id,
        modifiedAt: new Date(),
        action: 'PUBLISHED_MARKS',
        remarks: 'Official publication by administrator',
      });
      await r.save();

      // Notify student
      await Notification.createIfNotDuplicate({
        recipient: r.student,
        title: `Official Result Published: ${r.subject?.code}`,
        message: `Your final marks and grade for ${r.subject?.name} (${r.subject?.code}) are now published. Grade: ${r.grade}`,
        type: 'RESULT_PUBLISHED',
        category: 'MARKS',
        priority: 'HIGH',
        linkUrl: '/results',
      });
    }

    const subject = results[0]?.subject;
    await AuditLog.create({
      user: req.user.id,
      action: 'PUBLISH_MARKS',
      targetEntity: 'SubjectResult',
      entityId: subjectId,
      details: `Published official marks for ${results.length} students in ${subject?.code || subjectId}.`,
    });

    res.json({
      success: true,
      message: `Published results for ${results.length} students.`,
      publishedCount: results.length,
    });
  } catch (error) {
    next(error);
  }
};
