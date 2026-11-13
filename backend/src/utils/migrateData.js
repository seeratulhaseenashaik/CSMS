const AttendanceRecord = require('../models/AttendanceRecord');
const AttendanceSession = require('../models/AttendanceSession');
const SubjectResult = require('../models/SubjectResult');
const InstitutionalSetting = require('../models/InstitutionalSetting');
const Timetable = require('../models/Timetable');
const AcademicTask = require('../models/AcademicTask');
const Subject = require('../models/Subject');
const User = require('../models/User');

/**
 * Safe, idempotent migration to upgrade existing database records to the new
 * AttendanceSession and 4-stage Marks Publication workflow without data loss.
 */
async function runMigrations() {
  console.log('[Migration] Starting data integrity migration check...');

  // 1. Institutional Settings
  await InstitutionalSetting.getActiveSettings();

  // 2. Migrate unlinked AttendanceRecord documents into AttendanceSessions
  const unlinkedRecords = await AttendanceRecord.find({
    $or: [{ attendanceSession: { $exists: false } }, { attendanceSession: null }],
  });

  if (unlinkedRecords.length > 0) {
    console.log(`[Migration] Found ${unlinkedRecords.length} unlinked attendance records. Migrating into sessions...`);

    // Group by subject, normalized sessionDate (day), and faculty
    const sessionMap = new Map();

    for (const rec of unlinkedRecords) {
      const dateKey = rec.sessionDate ? rec.sessionDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const key = `${rec.subject.toString()}_${dateKey}_${rec.faculty ? rec.faculty.toString() : 'unknown'}`;

      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          subject: rec.subject,
          faculty: rec.faculty,
          sessionDate: rec.sessionDate || new Date(),
          sessionType: rec.sessionType || 'Lecture',
          records: [],
        });
      }
      sessionMap.get(key).records.push(rec);
    }

    for (const [key, group] of sessionMap.entries()) {
      const presentCount = group.records.filter((r) => r.attendedClasses > 0 && !r.approvedExemption).length;
      const excusedCount = group.records.filter((r) => r.approvedExemption).length;
      const absentCount = group.records.filter((r) => r.attendedClasses === 0).length;
      const totalStudents = group.records.length;

      // Find or create AttendanceSession
      const targetDate = new Date(group.sessionDate);
      targetDate.setHours(12, 0, 0, 0);

      let session = await AttendanceSession.findOne({
        subject: group.subject,
        sessionDate: targetDate,
        period: 1,
      });

      if (!session) {
        session = await AttendanceSession.create({
          subject: group.subject,
          classAndSection: 'CSE-A',
          academicYear: '2025-2026',
          semester: 5,
          sessionDate: targetDate,
          period: 1,
          sessionType: group.sessionType,
          faculty: group.faculty || (await User.findOne({ role: 'faculty' }))._id,
          status: 'Finalized',
          submissionTimestamp: targetDate,
          finalizationTimestamp: targetDate,
          summary: {
            totalStudents,
            presentCount,
            absentCount,
            excusedCount,
            attendancePercentage: totalStudents > 0 ? Math.round(((presentCount + excusedCount) / totalStudents) * 100) : 0,
          },
          auditTrail: [{
            action: 'MIGRATED_FROM_LEGACY_RECORDS',
            remarks: 'Auto-migrated during CSMS portal upgrade.',
          }],
        });
      }

      // Link records to the session
      const recordIds = group.records.map((r) => r._id);
      await AttendanceRecord.updateMany(
        { _id: { $in: recordIds } },
        {
          $set: {
            attendanceSession: session._id,
            status: group.records[0]?.approvedExemption ? 'Excused' : (group.records[0]?.attendedClasses > 0 ? 'Present' : 'Absent'),
          },
        }
      );
    }
    console.log('[Migration] Attendance sessions migration complete.');
  }

  // 3. Migrate SubjectResult workflowStatus
  const unmigratedResults = await SubjectResult.find({
    workflowStatus: { $exists: false },
  });

  if (unmigratedResults.length > 0) {
    console.log(`[Migration] Migrating ${unmigratedResults.length} SubjectResult workflow statuses...`);
    for (const res of unmigratedResults) {
      res.workflowStatus = res.isPublished ? 'Published' : 'Draft';
      await res.save();
    }
  }

  // 4. Seed Persisted Timetable entries if none exist
  const timetableCount = await Timetable.countDocuments();
  if (timetableCount === 0) {
    console.log('[Migration] Seeding initial persisted Timetable entries...');
    const subjects = await Subject.find().limit(5);
    const facultyUser = await User.findOne({ role: 'faculty' });

    if (subjects.length > 0 && facultyUser) {
      const scheduleEntries = [
        {
          subject: subjects[0]._id,
          faculty: facultyUser._id,
          classAndSection: 'CSE-A',
          department: 'CSE',
          day: 'Monday',
          startTime: '09:30 AM',
          endTime: '10:30 AM',
          classroom: 'Room CS-301',
          academicYear: '2025-2026',
          semester: 5,
          period: 1,
          type: 'Lecture',
        },
        {
          subject: subjects[1] ? subjects[1]._id : subjects[0]._id,
          faculty: facultyUser._id,
          classAndSection: 'CSE-A',
          department: 'CSE',
          day: 'Monday',
          startTime: '10:45 AM',
          endTime: '11:45 AM',
          classroom: 'Room CS-302',
          academicYear: '2025-2026',
          semester: 5,
          period: 2,
          type: 'Lecture',
        },
        {
          subject: subjects[2] ? subjects[2]._id : subjects[0]._id,
          faculty: facultyUser._id,
          classAndSection: 'CSE-A',
          department: 'CSE',
          day: 'Tuesday',
          startTime: '09:30 AM',
          endTime: '10:30 AM',
          classroom: 'Room CS-301',
          academicYear: '2025-2026',
          semester: 5,
          period: 1,
          type: 'Lecture',
        },
        {
          subject: subjects[0]._id,
          faculty: facultyUser._id,
          classAndSection: 'CSE-A',
          department: 'CSE',
          day: 'Wednesday',
          startTime: '02:00 PM',
          endTime: '04:00 PM',
          classroom: 'Advanced Lab 2',
          academicYear: '2025-2026',
          semester: 5,
          period: 4,
          type: 'Laboratory',
        },
        {
          subject: subjects[1] ? subjects[1]._id : subjects[0]._id,
          faculty: facultyUser._id,
          classAndSection: 'CSE-A',
          department: 'CSE',
          day: 'Thursday',
          startTime: '11:00 AM',
          endTime: '12:00 PM',
          classroom: 'Room CS-204',
          academicYear: '2025-2026',
          semester: 5,
          period: 2,
          type: 'Tutorial',
        },
        {
          subject: subjects[0]._id,
          faculty: facultyUser._id,
          classAndSection: 'CSE-A',
          department: 'CSE',
          day: 'Friday',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          classroom: 'Room CS-301',
          academicYear: '2025-2026',
          semester: 5,
          period: 2,
          type: 'Lecture',
        },
      ];

      await Timetable.insertMany(scheduleEntries);
      console.log('[Migration] Timetable entries seeded successfully.');
    }
  }

  // 5. Seed initial Academic Tasks if none exist
  const taskCount = await AcademicTask.countDocuments();
  if (taskCount === 0) {
    console.log('[Migration] Seeding initial Academic Tasks...');
    const now = new Date();
    const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const initialTasks = [
      {
        title: 'Mid-Semester Assessment Marks Submission',
        description: 'Complete and submit mid-semester evaluation marks for CSE Sem 5.',
        category: 'ASSESSMENT',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: futureDate(5),
        assignedRole: 'faculty',
        linkUrl: '/faculty/marks',
      },
      {
        title: 'Attendance Session Review & Reconciliation',
        description: 'Finalize draft attendance sessions for the ongoing instructional week.',
        category: 'ATTENDANCE_CORRECTION',
        status: 'PENDING',
        priority: 'NORMAL',
        dueDate: futureDate(2),
        assignedRole: 'faculty',
        linkUrl: '/faculty/attendance',
      },
      {
        title: 'Course Feedback & Attendance Threshold Verification',
        description: 'Verify subject-wise attendance and ensure minimum 75% requirement is met.',
        category: 'DEADLINE',
        status: 'UPCOMING',
        priority: 'NORMAL',
        dueDate: futureDate(14),
        assignedRole: 'student',
        linkUrl: '/attendance',
      },
      {
        title: 'Semester 5 Laboratory Assessment Report',
        description: 'Submit practical laboratory experiment workbook for evaluation.',
        category: 'ASSIGNMENT',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: futureDate(4),
        assignedRole: 'student',
        linkUrl: '/results',
      },
    ];

    await AcademicTask.insertMany(initialTasks);
    console.log('[Migration] Academic tasks seeded successfully.');
  }

  console.log('[Migration] All migrations completed successfully.');
}

module.exports = { runMigrations };
