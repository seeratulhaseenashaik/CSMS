const Subject = require('../models/Subject');
const StudentProfile = require('../models/StudentProfile');
const FacultyProfile = require('../models/FacultyProfile');
const AttendanceRecord = require('../models/AttendanceRecord');
const SubjectResult = require('../models/SubjectResult');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const {
  calculateAttendancePercentage,
  calculateClassesToReachTarget,
  calculateBunkAllowance,
  getAttendanceStatus,
} = require('../utils/attendanceCalculator');
const { evaluateSubjectStatus } = require('../utils/gpaCalculator');

// Helper to get all subject IDs assigned to a faculty member
const getAssignedSubjectIds = async (facultyUserId) => {
  const subjects = await Subject.find({ faculty: facultyUserId });
  const subjectIds = subjects.map((s) => s._id);

  // Also check FacultyProfile.assignedSubjects for any extra linked subjects
  const profile = await FacultyProfile.findOne({ user: facultyUserId });
  if (profile && Array.isArray(profile.assignedSubjects)) {
    for (const sid of profile.assignedSubjects) {
      if (!subjectIds.some((id) => id.toString() === sid.toString())) {
        subjectIds.push(sid);
      }
    }
  }

  return { subjects, subjectIds };
};

// Standard weekly timetable slot template for assigned subjects
const generateWeeklySchedule = (subjects) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const slots = [
    { period: 1, startTime: '09:30 AM', endTime: '10:30 AM', type: 'Lecture' },
    { period: 2, startTime: '10:45 AM', endTime: '11:45 AM', type: 'Lecture' },
    { period: 3, startTime: '01:15 PM', endTime: '02:15 PM', type: 'Tutorial' },
    { period: 4, startTime: '02:30 PM', endTime: '04:30 PM', type: 'Laboratory' },
  ];

  const rooms = ['Room CS-301', 'Room CS-302', 'Room CS-204', 'Advanced Lab 2', 'Systems Lab 1'];

  const schedule = [];
  if (!subjects || subjects.length === 0) return schedule;

  let subIdx = 0;
  days.forEach((day, dayIndex) => {
    // 2 to 3 slots per day
    const slotsCount = (dayIndex % 2 === 0) ? 3 : 2;
    for (let i = 0; i < slotsCount; i++) {
      const subject = subjects[subIdx % subjects.length];
      const slotDef = slots[i];
      const room = subject.subjectType === 'Laboratory' ? 'Advanced Computing Lab 3' : rooms[(dayIndex + i) % rooms.length];

      schedule.push({
        id: `${day}-${slotDef.period}-${subject._id}`,
        day,
        period: slotDef.period,
        startTime: slotDef.startTime,
        endTime: slotDef.endTime,
        subject: {
          _id: subject._id,
          code: subject.code,
          name: subject.name,
          department: subject.department,
          semester: subject.semester,
          subjectType: subject.subjectType,
        },
        classSection: `${subject.department} - Sem ${subject.semester} (Sec A)`,
        room,
        type: subject.subjectType === 'Laboratory' ? 'Laboratory' : slotDef.type,
      });

      subIdx++;
    }
  });

  return schedule;
};

// @desc Get Faculty Dashboard summary, dynamic stats, today's schedule, pending tasks
// @route GET /api/faculty/dashboard
// @access Private (Faculty / Admin)
exports.getFacultyDashboard = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjects, subjectIds } = await getAssignedSubjectIds(facultyUserId);

    // 1. Total subjects handled
    const totalSubjects = subjects.length;

    // 2. Total assigned classes / sections (distinct department + semester)
    const sectionSet = new Set();
    subjects.forEach((s) => sectionSet.add(`${s.department}-Sem${s.semester}`));
    const totalSections = sectionSet.size;

    // 3. Total distinct students taught
    const distinctStudents = await StudentProfile.find({
      enrolledSubjects: { $in: subjectIds },
    }).distinct('user');
    const totalStudentsTaught = distinctStudents.length;

    // 4. Pending Tasks Calculation
    const pendingTasks = [];

    // Check incomplete marks entries (students enrolled in faculty's subjects without published results)
    const unpublishedResults = await SubjectResult.countDocuments({
      subject: { $in: subjectIds },
      isPublished: false,
    });

    if (unpublishedResults > 0) {
      pendingTasks.push({
        id: 'task-marks-pending',
        title: 'Unpublished Assessment Marks',
        description: `${unpublishedResults} student assessment results are currently pending review or publication.`,
        urgency: 'high',
        category: 'Marks',
        count: unpublishedResults,
        link: '/faculty/marks',
      });
    }

    // Check recent attendance sessions
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentAttendanceCount = await AttendanceRecord.countDocuments({
      subject: { $in: subjectIds },
      sessionDate: { $gte: oneWeekAgo },
    });

    if (recentAttendanceCount === 0 && totalSubjects > 0) {
      pendingTasks.push({
        id: 'task-attendance-pending',
        title: 'Record Weekly Attendance',
        description: 'No attendance records logged for your assigned subjects within the past 7 days.',
        urgency: 'medium',
        category: 'Attendance',
        count: totalSubjects,
        link: '/faculty/attendance',
      });
    }

    // Check for students with attendance shortages (< 75%)
    let shortageStudentCount = 0;
    if (subjectIds.length > 0) {
      const records = await AttendanceRecord.find({ subject: { $in: subjectIds } });
      const studentMap = {};
      records.forEach((r) => {
        const sId = r.student.toString();
        if (!studentMap[sId]) studentMap[sId] = { attended: 0, total: 0 };
        studentMap[sId].attended += r.attendedClasses;
        studentMap[sId].total += r.totalClasses;
      });

      Object.values(studentMap).forEach((st) => {
        if (st.total > 0 && (st.attended / st.total) < 0.75) {
          shortageStudentCount++;
        }
      });
    }

    if (shortageStudentCount > 0) {
      pendingTasks.push({
        id: 'task-attendance-shortage',
        title: 'Attendance Shortage Alerts',
        description: `${shortageStudentCount} student(s) enrolled in your subjects are falling below the 75% threshold.`,
        urgency: 'high',
        category: 'Alert',
        count: shortageStudentCount,
        link: '/faculty/reports',
      });
    }

    // 5. Weekly Schedule and Today's Schedule
    const weeklySchedule = generateWeeklySchedule(subjects);
    const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

    const todayClasses = weeklySchedule.filter((s) => s.day === currentDayName);

    // Compute status (upcoming, in-progress, completed) based on time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinutes;

    const parseTimeToMinutes = (timeStr) => {
      const [time, period] = timeStr.split(' ');
      let [h, m] = time.split(':').map(Number);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };

    const todaySchedule = todayClasses.map((item) => {
      const startMin = parseTimeToMinutes(item.startTime);
      const endMin = parseTimeToMinutes(item.endTime);
      let status = 'upcoming';
      if (currentTimeVal >= startMin && currentTimeVal <= endMin) {
        status = 'in-progress';
      } else if (currentTimeVal > endMin) {
        status = 'completed';
      }
      return {
        ...item,
        status,
      };
    });

    // Overview metrics
    res.json({
      success: true,
      data: {
        summary: {
          totalSubjects,
          totalSections,
          totalStudentsTaught,
          pendingTasksCount: pendingTasks.length,
          shortageStudentCount,
        },
        pendingTasks,
        todaySchedule: {
          day: currentDayName,
          date: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          classes: todaySchedule,
        },
        assignedSubjects: subjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get Faculty Profile details
// @route GET /api/faculty/profile
// @access Private (Faculty / Admin)
exports.getFacultyProfile = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const user = await User.findById(facultyUserId).select('-password');
    let profile = await FacultyProfile.findOne({ user: facultyUserId }).populate('assignedSubjects');

    if (!profile) {
      profile = await FacultyProfile.create({
        user: facultyUserId,
        employeeId: `FAC${Math.floor(100 + Math.random() * 900)}`,
        department: 'CSE',
        designation: 'Assistant Professor',
      });
    }

    const { subjects } = await getAssignedSubjectIds(facultyUserId);

    res.json({
      success: true,
      data: {
        user,
        profile,
        assignedSubjects: subjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update permitted Faculty Profile fields
// @route PUT /api/faculty/profile
// @access Private (Faculty / Admin)
exports.updateFacultyProfile = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { phone, bio, officeHours, designation } = req.body;

    // Update User permitted fields
    const user = await User.findById(facultyUserId);
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    await user.save();

    // Update FacultyProfile permitted fields (protected fields: employeeId, department, user)
    let profile = await FacultyProfile.findOne({ user: facultyUserId });
    if (profile) {
      if (officeHours !== undefined) profile.officeHours = officeHours;
      // Allow designation only if administrator
      if (req.user.role === 'administrator' && designation) {
        profile.designation = designation;
      }
      await profile.save();
    }

    // Log audit trail
    await AuditLog.create({
      user: facultyUserId,
      action: 'UPDATE_FACULTY_PROFILE',
      targetEntity: 'FacultyProfile',
      entityId: profile?._id,
      details: `Updated faculty profile details for ${user.name}`,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user, profile },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get list of subjects assigned to faculty with enrollment and performance stats
// @route GET /api/faculty/subjects
// @access Private (Faculty / Admin)
exports.getFacultySubjects = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjects } = await getAssignedSubjectIds(facultyUserId);

    const subjectsWithStats = await Promise.all(
      subjects.map(async (sub) => {
        const enrolledCount = await StudentProfile.countDocuments({
          enrolledSubjects: sub._id,
        });

        const attendanceRecords = await AttendanceRecord.find({ subject: sub._id });
        let totalClasses = 0;
        let attendedClasses = 0;
        attendanceRecords.forEach((r) => {
          totalClasses += r.totalClasses;
          attendedClasses += r.attendedClasses;
        });

        const avgAttendance = calculateAttendancePercentage(attendedClasses, totalClasses);

        const resultsCount = await SubjectResult.countDocuments({ subject: sub._id });
        const passedCount = await SubjectResult.countDocuments({ subject: sub._id, status: 'PASS' });

        return {
          ...sub.toObject(),
          enrolledCount,
          avgAttendance,
          totalSessionsLogged: attendanceRecords.length,
          resultsCount,
          passedCount,
          passRate: resultsCount > 0 ? Math.round((passedCount / resultsCount) * 100) : 0,
        };
      })
    );

    res.json({
      success: true,
      data: subjectsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get students enrolled in faculty's assigned subjects with search, filter, pagination
// @route GET /api/faculty/students
// @access Private (Faculty / Admin)
exports.getFacultyStudents = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjects, subjectIds } = await getAssignedSubjectIds(facultyUserId);

    const { subjectId, search, semester, page = 1, limit = 15 } = req.query;

    let targetSubjectIds = subjectIds;
    if (subjectId) {
      // Security check: verify subject is assigned to this faculty
      if (!subjectIds.some((id) => id.toString() === subjectId.toString()) && req.user.role !== 'administrator') {
        return res.status(403).json({ success: false, message: 'Unauthorized subject access.' });
      }
      targetSubjectIds = [subjectId];
    }

    const query = {
      enrolledSubjects: { $in: targetSubjectIds },
    };

    if (semester) {
      query.currentSemester = Number(semester);
    }

    // Find student profiles
    let profiles = await StudentProfile.find(query)
      .populate('user', 'name email phone avatar')
      .populate('enrolledSubjects', 'code name semester credits');

    // Filter by search query (name or registration number)
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      profiles = profiles.filter(
        (p) =>
          p.registrationNumber?.toLowerCase().includes(term) ||
          p.user?.name?.toLowerCase().includes(term) ||
          p.user?.email?.toLowerCase().includes(term)
      );
    }

    // Calculate subject-specific attendance and performance for each student
    const studentList = await Promise.all(
      profiles.map(async (p) => {
        const studentUserId = p.user?._id;
        if (!studentUserId) return null;

        // Fetch attendance in faculty's subjects
        const records = await AttendanceRecord.find({
          student: studentUserId,
          subject: { $in: targetSubjectIds },
        });

        let totalClasses = 0;
        let attendedClasses = 0;
        records.forEach((r) => {
          totalClasses += r.totalClasses;
          attendedClasses += r.attendedClasses;
        });

        const attendancePct = calculateAttendancePercentage(attendedClasses, totalClasses);
        const hasShortage = totalClasses > 0 && attendancePct < 75;

        // Fetch subject results
        const results = await SubjectResult.find({
          student: studentUserId,
          subject: { $in: targetSubjectIds },
        });

        return {
          id: p._id,
          userId: studentUserId,
          name: p.user?.name || 'Unknown',
          email: p.user?.email || '',
          registrationNumber: p.registrationNumber,
          department: p.department,
          degree: p.degree,
          academicYear: p.academicYear,
          currentSemester: p.currentSemester,
          batch: p.batch,
          cgpa: p.cgpa,
          sgpa: p.sgpa,
          attendancePercentage: attendancePct,
          totalClasses,
          attendedClasses,
          hasShortage,
          enrolledFacultySubjects: p.enrolledSubjects.filter((s) =>
            targetSubjectIds.some((id) => id.toString() === s._id.toString())
          ),
          results: results.map((r) => ({
            subjectId: r.subject,
            totalMarks: r.totalMarks,
            grade: r.grade,
            status: r.status,
            isPublished: r.isPublished,
          })),
        };
      })
    );

    const validStudents = studentList.filter(Boolean);
    const total = validStudents.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = validStudents.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      data: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
      availableSubjects: subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get enrolled students for a specific subject with attendance session status
// @route GET /api/faculty/attendance
// @access Private (Faculty / Admin)
exports.getFacultyAttendanceSession = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjects, subjectIds } = await getAssignedSubjectIds(facultyUserId);

    let subjectId = req.query.subjectId;
    if (!subjectId && subjects.length > 0) {
      subjectId = subjects[0]._id.toString();
    }

    if (!subjectId) {
      return res.json({
        success: true,
        data: {
          students: [],
          subject: null,
          subjects,
          sessionStats: { totalEnrolled: 0, presentCount: 0, absentCount: 0, excusedCount: 0 },
        },
      });
    }

    // Security check
    if (!subjectIds.some((id) => id.toString() === subjectId.toString()) && req.user.role !== 'administrator') {
      return res.status(403).json({ success: false, message: 'Unauthorized subject access.' });
    }

    const subject = await Subject.findById(subjectId);
    const sessionDate = req.query.date ? new Date(req.query.date) : new Date();
    // Normalize to date bounds
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get enrolled students
    const studentProfiles = await StudentProfile.find({ enrolledSubjects: subjectId })
      .populate('user', 'name email')
      .sort({ registrationNumber: 1 });

    // Get existing session attendance records for this date
    const existingRecords = await AttendanceRecord.find({
      subject: subjectId,
      sessionDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const recordMap = {};
    existingRecords.forEach((r) => {
      recordMap[r.student.toString()] = r;
    });

    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    const roster = await Promise.all(
      studentProfiles.map(async (sp) => {
        const studentUserId = sp.user?._id;
        const rec = recordMap[studentUserId?.toString()];

        // Cumulative attendance for this subject
        const allRecords = await AttendanceRecord.find({
          student: studentUserId,
          subject: subjectId,
        });

        let totalSoFar = 0;
        let attendedSoFar = 0;
        allRecords.forEach((r) => {
          totalSoFar += r.totalClasses;
          attendedSoFar += r.attendedClasses;
        });

        const cumulativePct = calculateAttendancePercentage(attendedSoFar, totalSoFar);

        let status = 'present'; // default recommended status
        if (rec) {
          if (rec.approvedExemption) {
            status = 'excused';
            excusedCount++;
          } else if (rec.attendedClasses > 0) {
            status = 'present';
            presentCount++;
          } else {
            status = 'absent';
            absentCount++;
          }
        }

        return {
          studentId: studentUserId,
          profileId: sp._id,
          name: sp.user?.name || 'Unknown',
          email: sp.user?.email || '',
          registrationNumber: sp.registrationNumber,
          department: sp.department,
          semester: sp.currentSemester,
          status,
          isLoggedForDate: !!rec,
          remarks: rec?.remarks || '',
          cumulativeAttendance: {
            totalClasses: totalSoFar,
            attendedClasses: attendedSoFar,
            percentage: cumulativePct,
            hasShortage: totalSoFar > 0 && cumulativePct < 75,
          },
        };
      })
    );

    // Get list of recent logged dates for this subject
    const recentRecords = await AttendanceRecord.find({ subject: subjectId })
      .sort({ sessionDate: -1 })
      .limit(20);

    const loggedDates = Array.from(
      new Set(recentRecords.map((r) => r.sessionDate.toISOString().split('T')[0]))
    );

    res.json({
      success: true,
      data: {
        subject,
        subjects,
        selectedDate: sessionDate.toISOString().split('T')[0],
        roster,
        stats: {
          totalEnrolled: roster.length,
          presentCount,
          absentCount,
          excusedCount,
          unrecordedCount: roster.filter((r) => !r.isLoggedForDate).length,
        },
        recentLoggedDates: loggedDates,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Save and submit bulk attendance session for a class
// @route POST /api/faculty/attendance
// @access Private (Faculty / Admin)
exports.recordBulkAttendance = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjectId, sessionDate, sessionType = 'Lecture', remarks = '', records } = req.body;

    if (!subjectId || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload: subjectId and records are required.' });
    }

    const { subjectIds } = await getAssignedSubjectIds(facultyUserId);
    if (!subjectIds.some((id) => id.toString() === subjectId.toString()) && req.user.role !== 'administrator') {
      return res.status(403).json({ success: false, message: 'Unauthorized subject access.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const targetDate = sessionDate ? new Date(sessionDate) : new Date();
    // Normalize date to start of day for unique session matching
    targetDate.setHours(12, 0, 0, 0);

    let savedCount = 0;
    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    for (const item of records) {
      const { studentId, status, remarks: studentRemarks } = item;
      if (!studentId) continue;

      const isPresent = status === 'present';
      const isExcused = status === 'excused';
      const attendedClasses = (isPresent || isExcused) ? 1 : 0;
      const approvedExemption = isExcused;

      if (isPresent) presentCount++;
      else if (isExcused) excusedCount++;
      else absentCount++;

      // Upsert record for (student, subject, sessionDate normalized)
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      let record = await AttendanceRecord.findOne({
        student: studentId,
        subject: subjectId,
        sessionDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (record) {
        record.totalClasses = 1;
        record.attendedClasses = attendedClasses;
        record.sessionType = sessionType;
        record.faculty = facultyUserId;
        record.remarks = studentRemarks || remarks || record.remarks;
        record.approvedExemption = approvedExemption;
        await record.save();
      } else {
        record = await AttendanceRecord.create({
          student: studentId,
          subject: subjectId,
          totalClasses: 1,
          attendedClasses,
          sessionDate: targetDate,
          sessionType,
          faculty: facultyUserId,
          remarks: studentRemarks || remarks,
          approvedExemption,
        });
      }

      savedCount++;

      // Check cumulative attendance and notify student if below 75%
      const allStudentRecords = await AttendanceRecord.find({
        student: studentId,
        subject: subjectId,
      });

      const totalSoFar = allStudentRecords.reduce((acc, r) => acc + r.totalClasses, 0);
      const attendSoFar = allStudentRecords.reduce((acc, r) => acc + r.attendedClasses, 0);
      const pct = calculateAttendancePercentage(attendSoFar, totalSoFar);

      if (pct < 75 && totalSoFar >= 3) {
        await Notification.create({
          recipient: studentId,
          title: `Attendance Alert: ${subject.code}`,
          message: `Your attendance in ${subject.name} is currently ${pct}%, falling below the mandatory 75% requirement.`,
          type: 'ATTENDANCE_WARNING',
          linkUrl: '/attendance',
        });
      }
    }

    // Audit log
    await AuditLog.create({
      user: facultyUserId,
      action: 'RECORD_BULK_ATTENDANCE',
      targetEntity: 'AttendanceRecord',
      details: `Logged attendance session for ${subject.code} on ${targetDate.toDateString()}: ${presentCount} Present, ${absentCount} Absent, ${excusedCount} Excused out of ${savedCount} students.`,
    });

    res.json({
      success: true,
      message: `Attendance successfully submitted for ${savedCount} students.`,
      summary: {
        total: savedCount,
        present: presentCount,
        absent: absentCount,
        excused: excusedCount,
        sessionDate: targetDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get student assessment marks for a subject and semester
// @route GET /api/faculty/marks
// @access Private (Faculty / Admin)
exports.getFacultyMarks = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjects, subjectIds } = await getAssignedSubjectIds(facultyUserId);

    let subjectId = req.query.subjectId;
    if (!subjectId && subjects.length > 0) {
      subjectId = subjects[0]._id.toString();
    }

    if (!subjectId) {
      return res.json({
        success: true,
        data: { subject: null, subjects, students: [] },
      });
    }

    // Security check
    if (!subjectIds.some((id) => id.toString() === subjectId.toString()) && req.user.role !== 'administrator') {
      return res.status(403).json({ success: false, message: 'Unauthorized subject access.' });
    }

    const subject = await Subject.findById(subjectId);
    const semester = req.query.semester ? Number(req.query.semester) : subject.semester;

    // Get enrolled students
    const studentProfiles = await StudentProfile.find({ enrolledSubjects: subjectId })
      .populate('user', 'name email')
      .sort({ registrationNumber: 1 });

    // Get existing SubjectResult documents
    const existingResults = await SubjectResult.find({
      subject: subjectId,
      semester,
    });

    const resultMap = {};
    existingResults.forEach((r) => {
      resultMap[r.student.toString()] = r;
    });

    const students = studentProfiles.map((sp) => {
      const studentUserId = sp.user?._id;
      const resItem = resultMap[studentUserId?.toString()];

      return {
        studentId: studentUserId,
        profileId: sp._id,
        name: sp.user?.name || 'Unknown',
        email: sp.user?.email || '',
        registrationNumber: sp.registrationNumber,
        department: sp.department,
        semester: sp.currentSemester,
        internalMarks: resItem ? resItem.internalMarks : 0,
        midtermMarks: resItem ? resItem.midtermMarks : 0,
        practicalMarks: resItem ? resItem.practicalMarks : 0,
        endSemMarks: resItem ? resItem.endSemMarks : 0,
        totalMarks: resItem ? resItem.totalMarks : 0,
        grade: resItem ? resItem.grade : 'PENDING',
        gradePoints: resItem ? resItem.gradePoints : 0,
        status: resItem ? resItem.status : 'PENDING',
        isPublished: resItem ? resItem.isPublished : false,
        resultId: resItem?._id || null,
      };
    });

    res.json({
      success: true,
      data: {
        subject,
        subjects,
        semester,
        students,
        stats: {
          totalEnrolled: students.length,
          publishedCount: students.filter((s) => s.isPublished).length,
          passedCount: students.filter((s) => s.status === 'PASS').length,
          failedCount: students.filter((s) => s.status === 'FAIL' || s.status === 'BACKLOG').length,
          pendingCount: students.filter((s) => s.status === 'PENDING').length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Save and submit bulk marks for a subject
// @route POST /api/faculty/marks
// @access Private (Faculty / Admin)
exports.saveBulkMarks = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjectId, semester, academicYear = '2025-2026', isPublished = false, marksList } = req.body;

    if (!subjectId || !marksList || !Array.isArray(marksList) || marksList.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload: subjectId and marksList are required.' });
    }

    const { subjectIds } = await getAssignedSubjectIds(facultyUserId);
    if (!subjectIds.some((id) => id.toString() === subjectId.toString()) && req.user.role !== 'administrator') {
      return res.status(403).json({ success: false, message: 'Unauthorized subject access.' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    let savedCount = 0;
    const savedResults = [];

    for (const item of marksList) {
      const { studentId, internalMarks = 0, midtermMarks = 0, practicalMarks = 0, endSemMarks = 0 } = item;
      if (!studentId) continue;

      // Input validation: prevent negative marks or exceeding limits
      const safeInternal = Math.max(0, Math.min(Number(internalMarks), subject.internalMaxMarks || 30));
      const safeMidterm = Math.max(0, Number(midtermMarks));
      const safePractical = Math.max(0, Number(practicalMarks));
      const safeEndSem = Math.max(0, Math.min(Number(endSemMarks), subject.endSemMaxMarks || 70));

      const mockResult = {
        internalMarks: safeInternal,
        midtermMarks: safeMidterm,
        practicalMarks: safePractical,
        endSemMarks: safeEndSem,
      };

      const evaluation = evaluateSubjectStatus(mockResult, subject);

      let record = await SubjectResult.findOne({
        student: studentId,
        subject: subjectId,
        semester: semester || subject.semester,
      });

      if (record) {
        record.internalMarks = safeInternal;
        record.midtermMarks = safeMidterm;
        record.practicalMarks = safePractical;
        record.endSemMarks = safeEndSem;
        record.totalMarks = evaluation.totalMarks;
        record.grade = evaluation.grade;
        record.gradePoints = evaluation.gradePoints;
        record.status = evaluation.status;
        if (isPublished) {
          record.isPublished = true;
          record.publishedBy = facultyUserId;
        }
        await record.save();
      } else {
        record = await SubjectResult.create({
          student: studentId,
          subject: subjectId,
          semester: semester || subject.semester,
          academicYear,
          internalMarks: safeInternal,
          midtermMarks: safeMidterm,
          practicalMarks: safePractical,
          endSemMarks: safeEndSem,
          totalMarks: evaluation.totalMarks,
          maxMarks: subject.maxMarks || 100,
          grade: evaluation.grade,
          gradePoints: evaluation.gradePoints,
          status: evaluation.status,
          isPublished: Boolean(isPublished),
          publishedBy: isPublished ? facultyUserId : null,
        });
      }

      savedCount++;
      savedResults.push(record);

      // If published, notify student
      if (isPublished) {
        await Notification.create({
          recipient: studentId,
          title: `Results Published: ${subject.code}`,
          message: `Your final assessment marks for ${subject.name} have been published. Grade: ${evaluation.grade} (${evaluation.status})`,
          type: 'RESULT_PUBLISHED',
          linkUrl: '/results',
        });
      }
    }

    // Audit log
    await AuditLog.create({
      user: facultyUserId,
      action: isPublished ? 'PUBLISH_MARKS' : 'DRAFT_MARKS',
      targetEntity: 'SubjectResult',
      details: `${isPublished ? 'Published' : 'Saved draft'} marks for ${savedCount} students in ${subject.code} (${subject.name}).`,
    });

    res.json({
      success: true,
      message: isPublished
        ? `Marks finalized and published for ${savedCount} students!`
        : `Assessment marks saved as draft for ${savedCount} students.`,
      savedCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get full weekly timetable and upcoming academic calendar events
// @route GET /api/faculty/timetable
// @access Private (Faculty / Admin)
exports.getFacultyTimetable = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjects } = await getAssignedSubjectIds(facultyUserId);

    const weeklySchedule = generateWeeklySchedule(subjects);

    const academicCalendar = [
      { date: '2026-11-15', event: 'Mid-Semester Examinations Commencement', type: 'Exam' },
      { date: '2026-11-25', event: 'Internal Assessment Submission Deadline', type: 'Academic' },
      { date: '2026-12-05', event: 'End-Semester Practical Evaluations', type: 'Practical' },
      { date: '2026-12-15', event: 'Final Theory Examinations Begin', type: 'Exam' },
      { date: '2026-12-28', event: 'Winter Recess Begins', type: 'Holiday' },
    ];

    res.json({
      success: true,
      data: {
        subjects,
        weeklySchedule,
        academicCalendar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get comprehensive Faculty Analytics & Reports
// @route GET /api/faculty/reports
// @access Private (Faculty / Admin)
exports.getFacultyReports = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjects, subjectIds } = await getAssignedSubjectIds(facultyUserId);

    // 1. Subject-wise Attendance Statistics
    const subjectAttendanceStats = await Promise.all(
      subjects.map(async (sub) => {
        const records = await AttendanceRecord.find({ subject: sub._id });
        let total = 0;
        let attended = 0;
        records.forEach((r) => {
          total += r.totalClasses;
          attended += r.attendedClasses;
        });
        const pct = calculateAttendancePercentage(attended, total);

        return {
          subjectId: sub._id,
          code: sub.code,
          name: sub.name,
          department: sub.department,
          semester: sub.semester,
          averageAttendance: pct,
          totalSessionsLogged: records.length,
          totalClasses: total,
          attendedClasses: attended,
        };
      })
    );

    // 2. Students below attendance threshold (< 75%)
    const shortageStudents = [];
    const studentProfiles = await StudentProfile.find({
      enrolledSubjects: { $in: subjectIds },
    }).populate('user', 'name email');

    for (const sp of studentProfiles) {
      for (const sub of subjects) {
        if (!sp.enrolledSubjects.some((id) => id.toString() === sub._id.toString())) continue;

        const records = await AttendanceRecord.find({
          student: sp.user?._id,
          subject: sub._id,
        });

        let total = 0;
        let attended = 0;
        records.forEach((r) => {
          total += r.totalClasses;
          attended += r.attendedClasses;
        });

        if (total > 0) {
          const pct = calculateAttendancePercentage(attended, total);
          if (pct < 75) {
            const needed = calculateClassesToReachTarget(attended, total, 0.75);
            shortageStudents.push({
              studentId: sp.user?._id,
              name: sp.user?.name || 'Unknown',
              registrationNumber: sp.registrationNumber,
              subjectCode: sub.code,
              subjectName: sub.name,
              attendancePercentage: pct,
              attended,
              total,
              classesNeeded: needed,
            });
          }
        }
      }
    }

    // 3. Grade Distribution across faculty's subjects
    const results = await SubjectResult.find({
      subject: { $in: subjectIds },
    });

    const gradeDistribution = {
      O: 0,
      'A+': 0,
      A: 0,
      'B+': 0,
      B: 0,
      C: 0,
      F: 0,
      PENDING: 0,
    };

    let passCount = 0;
    let failCount = 0;

    results.forEach((r) => {
      if (gradeDistribution[r.grade] !== undefined) {
        gradeDistribution[r.grade]++;
      }
      if (r.status === 'PASS') passCount++;
      else if (r.status === 'FAIL' || r.status === 'BACKLOG') failCount++;
    });

    const totalResults = results.length;
    const passPercentage = totalResults > 0 ? Math.round((passCount / totalResults) * 100) : 0;

    res.json({
      success: true,
      data: {
        subjectAttendanceStats,
        shortageStudents,
        gradeDistribution,
        performanceSummary: {
          totalEvaluated: totalResults,
          passCount,
          failCount,
          passPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get and Create Faculty Announcements
// @route GET /api/faculty/announcements
// @access Private (Faculty / Admin)
exports.getFacultyAnnouncements = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { subjects } = await getAssignedSubjectIds(facultyUserId);

    // Get general and faculty announcements
    const notifications = await Notification.find({
      $or: [
        { recipient: facultyUserId },
        { type: 'ANNOUNCEMENT' },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      data: {
        announcements: notifications,
        assignedSubjects: subjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Broadcast class/subject announcement from faculty to enrolled students
// @route POST /api/faculty/announcements
// @access Private (Faculty / Admin)
exports.createFacultyAnnouncement = async (req, res, next) => {
  try {
    const facultyUserId = req.user.id;
    const { title, message, subjectId } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    const { subjectIds } = await getAssignedSubjectIds(facultyUserId);
    let targetStudentIds = [];

    if (subjectId) {
      if (!subjectIds.some((id) => id.toString() === subjectId.toString()) && req.user.role !== 'administrator') {
        return res.status(403).json({ success: false, message: 'Unauthorized subject access.' });
      }
      const profiles = await StudentProfile.find({ enrolledSubjects: subjectId });
      targetStudentIds = profiles.map((p) => p.user);
    } else {
      // Broadcast to all students in faculty's assigned subjects
      const profiles = await StudentProfile.find({ enrolledSubjects: { $in: subjectIds } });
      targetStudentIds = Array.from(new Set(profiles.map((p) => p.user.toString())));
    }

    if (targetStudentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No enrolled students found to receive announcement.' });
    }

    const notifications = targetStudentIds.map((studentUserId) => ({
      recipient: studentUserId,
      title: `[Notice] ${title}`,
      message,
      type: 'ANNOUNCEMENT',
      linkUrl: '/dashboard',
    }));

    await Notification.insertMany(notifications);

    // Audit log
    await AuditLog.create({
      user: facultyUserId,
      action: 'BROADCAST_ANNOUNCEMENT',
      targetEntity: 'Notification',
      details: `Dispatched announcement "${title}" to ${targetStudentIds.length} students.`,
    });

    res.status(201).json({
      success: true,
      message: `Announcement broadcast successfully to ${targetStudentIds.length} enrolled students.`,
    });
  } catch (error) {
    next(error);
  }
};
