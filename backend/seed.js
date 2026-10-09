const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB, disconnectDB } = require('./src/config/db');

const User = require('./src/models/User');
const StudentProfile = require('./src/models/StudentProfile');
const FacultyProfile = require('./src/models/FacultyProfile');
const Department = require('./src/models/Department');
const Subject = require('./src/models/Subject');
const AttendanceRecord = require('./src/models/AttendanceRecord');
const SubjectResult = require('./src/models/SubjectResult');
const PromotionRule = require('./src/models/PromotionRule');
const Club = require('./src/models/Club');
const ClubMembership = require('./src/models/ClubMembership');
const ClubEvent = require('./src/models/ClubEvent');
const Question = require('./src/models/Question');
const Answer = require('./src/models/Answer');
const Vote = require('./src/models/Vote');
const AchieverRecord = require('./src/models/AchieverRecord');
const Notification = require('./src/models/Notification');
const AuditLog = require('./src/models/AuditLog');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      FacultyProfile.deleteMany({}),
      Department.deleteMany({}),
      Subject.deleteMany({}),
      AttendanceRecord.deleteMany({}),
      SubjectResult.deleteMany({}),
      PromotionRule.deleteMany({}),
      Club.deleteMany({}),
      ClubMembership.deleteMany({}),
      ClubEvent.deleteMany({}),
      Question.deleteMany({}),
      Answer.deleteMany({}),
      Vote.deleteMany({}),
      AchieverRecord.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Creating Departments...');
    const cseDept = await Department.create({
      code: 'CSE',
      name: 'Department of Computer Science & Engineering',
      description: 'Cutting-edge computing, AI, software engineering, and systems research.',
    });

    const eceDept = await Department.create({
      code: 'ECE',
      name: 'Department of Electronics & Communication',
      description: 'Embedded systems, signal processing, and robotics.',
    });

    console.log('[Seed] Creating Users...');
    const password = 'Password123!';

    const adminUser = await User.create({
      name: 'Dr. Arthur Pendelton',
      email: 'admin@csms.edu',
      password,
      role: 'administrator',
      phone: '+1 555-0199',
      bio: 'Chief Academic Registrar & System Administrator',
    });

    const facultyUser = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'faculty@csms.edu',
      password,
      role: 'faculty',
      phone: '+1 555-0142',
      bio: 'Associate Professor of Computer Science & Data Structures Lead',
    });

    const coordinatorUser = await User.create({
      name: 'Marcus Vance',
      email: 'coordinator@csms.edu',
      password,
      role: 'club_coordinator',
      phone: '+1 555-0188',
      bio: 'Student Activities & CodeX Club Coordinator',
    });

    const studentUser = await User.create({
      name: 'Alex Rivera',
      email: 'student@csms.edu',
      password,
      role: 'student',
      phone: '+1 555-0123',
      bio: 'Junior CSE Undergrad | Full-Stack Dev | Competitive Programmer',
    });

    const studentUser2 = await User.create({
      name: 'Elena Rostova',
      email: 'student2@csms.edu',
      password,
      role: 'student',
      phone: '+1 555-0124',
      bio: 'Sophomore CSE Undergrad interested in ML & Robotics',
    });

    console.log('[Seed] Creating Faculty & Student Profiles...');
    await FacultyProfile.create({
      user: facultyUser._id,
      employeeId: 'FAC001',
      department: 'CSE',
      designation: 'Associate Professor',
      officeHours: 'Mon/Wed/Fri 2:00 PM - 4:00 PM',
    });

    console.log('[Seed] Creating Subjects...');
    const dsaSubject = await Subject.create({
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      department: 'CSE',
      semester: 5,
      credits: 4,
      subjectType: 'Lecture',
      maxMarks: 100,
      minPassingMarks: 40,
      internalMaxMarks: 30,
      internalMinPassingMarks: 12,
      endSemMaxMarks: 70,
      endSemMinPassingMarks: 28,
      faculty: facultyUser._id,
    });

    const dbmsSubject = await Subject.create({
      code: 'CS302',
      name: 'Database Management Systems',
      department: 'CSE',
      semester: 5,
      credits: 4,
      subjectType: 'Lecture',
      maxMarks: 100,
      minPassingMarks: 40,
      internalMaxMarks: 30,
      internalMinPassingMarks: 12,
      endSemMaxMarks: 70,
      endSemMinPassingMarks: 28,
      faculty: facultyUser._id,
    });

    const osSubject = await Subject.create({
      code: 'CS303',
      name: 'Operating Systems',
      department: 'CSE',
      semester: 5,
      credits: 4,
      subjectType: 'Lecture',
      maxMarks: 100,
      minPassingMarks: 40,
      faculty: facultyUser._id,
    });

    const webSubject = await Subject.create({
      code: 'CS304',
      name: 'Web Engineering & MERN Stack',
      department: 'CSE',
      semester: 5,
      credits: 3,
      subjectType: 'Laboratory',
      maxMarks: 100,
      minPassingMarks: 40,
      faculty: facultyUser._id,
    });

    const studentProfile = await StudentProfile.create({
      user: studentUser._id,
      registrationNumber: '2023CSE042',
      department: 'CSE',
      degree: 'B.Tech',
      academicYear: 3,
      currentSemester: 5,
      batch: '2023-2027',
      cgpa: 8.75,
      sgpa: 8.90,
      earnedCredits: 78,
      enrolledSubjects: [dsaSubject._id, dbmsSubject._id, osSubject._id, webSubject._id],
      isAchieverVerified: true,
    });

    await StudentProfile.create({
      user: studentUser2._id,
      registrationNumber: '2024CSE018',
      department: 'CSE',
      degree: 'B.Tech',
      academicYear: 2,
      currentSemester: 3,
      batch: '2024-2028',
      cgpa: 7.90,
      sgpa: 8.00,
      earnedCredits: 42,
      enrolledSubjects: [dsaSubject._id, dbmsSubject._id],
      isAchieverVerified: false,
    });

    console.log('[Seed] Creating Attendance Records...');
    // Attendance data for Alex (Student 1):
    // DSA: Attended 42 out of 60 -> 70% (Shortage, needs 12 classes)
    // DBMS: Attended 50 out of 55 -> 90.9% (Meets req, bunk allowance 11)
    // OS: Attended 48 out of 50 -> 96%
    // Web: Attended 30 out of 40 -> 75%
    await AttendanceRecord.create([
      {
        student: studentUser._id,
        subject: dsaSubject._id,
        totalClasses: 60,
        attendedClasses: 42,
        sessionDate: new Date('2026-10-01'),
        sessionType: 'Lecture',
        faculty: facultyUser._id,
        remarks: 'Regular lecture series',
      },
      {
        student: studentUser._id,
        subject: dbmsSubject._id,
        totalClasses: 55,
        attendedClasses: 50,
        sessionDate: new Date('2026-10-02'),
        sessionType: 'Lecture',
        faculty: facultyUser._id,
      },
      {
        student: studentUser._id,
        subject: osSubject._id,
        totalClasses: 50,
        attendedClasses: 48,
        sessionDate: new Date('2026-10-03'),
        sessionType: 'Lecture',
        faculty: facultyUser._id,
      },
      {
        student: studentUser._id,
        subject: webSubject._id,
        totalClasses: 40,
        attendedClasses: 30,
        sessionDate: new Date('2026-10-04'),
        sessionType: 'Laboratory',
        faculty: facultyUser._id,
      },
    ]);

    console.log('[Seed] Creating Subject Results & Scorecards...');
    await SubjectResult.create([
      {
        student: studentUser._id,
        subject: dsaSubject._id,
        semester: 5,
        academicYear: '2025-2026',
        internalMarks: 26,
        midtermMarks: 18,
        practicalMarks: 0,
        endSemMarks: 58,
        totalMarks: 84,
        maxMarks: 100,
        grade: 'A+',
        gradePoints: 9,
        status: 'PASS',
        isPublished: true,
        publishedBy: adminUser._id,
      },
      {
        student: studentUser._id,
        subject: dbmsSubject._id,
        semester: 5,
        academicYear: '2025-2026',
        internalMarks: 25,
        midtermMarks: 19,
        practicalMarks: 0,
        endSemMarks: 60,
        totalMarks: 85,
        maxMarks: 100,
        grade: 'A+',
        gradePoints: 9,
        status: 'PASS',
        isPublished: true,
        publishedBy: adminUser._id,
      },
      {
        student: studentUser._id,
        subject: osSubject._id,
        semester: 5,
        academicYear: '2025-2026',
        internalMarks: 22,
        midtermMarks: 16,
        practicalMarks: 0,
        endSemMarks: 52,
        totalMarks: 74,
        maxMarks: 100,
        grade: 'A',
        gradePoints: 8,
        status: 'PASS',
        isPublished: true,
        publishedBy: adminUser._id,
      },
      {
        student: studentUser._id,
        subject: webSubject._id,
        semester: 5,
        academicYear: '2025-2026',
        internalMarks: 28,
        midtermMarks: 20,
        practicalMarks: 0,
        endSemMarks: 64,
        totalMarks: 92,
        maxMarks: 100,
        grade: 'O',
        gradePoints: 10,
        status: 'PASS',
        isPublished: true,
        publishedBy: adminUser._id,
      },
    ]);

    console.log('[Seed] Creating Promotion Rules...');
    await PromotionRule.create({
      batch: '2023-2027',
      degree: 'B.Tech',
      department: 'CSE',
      fromYear: 3,
      toYear: 4,
      minPassedSubjectsRatio: 0.75, // 75%
      minEarnedCredits: 60,
      maxPermittedBacklogs: 2,
      compulsorySubjectCodes: ['CS301', 'CS302'],
      minAttendancePercentage: 75,
      isActive: true,
    });

    console.log('[Seed] Creating College Clubs & Events...');
    const codexClub = await Club.create({
      name: 'CodeX Programming Club',
      category: 'Coding & Programming',
      description: 'Premier competitive programming and full-stack software development society.',
      facultyCoordinator: facultyUser._id,
      studentLeaders: [studentUser._id],
      eligibilityRules: 'Open to all students enthusiastic about algorithm design and software development.',
      meetingSchedule: 'Wednesdays at 4:30 PM',
      location: 'Computer Lab 3, Innovation Block',
      contactEmail: 'codex@csms.edu',
    });

    const aiClub = await Club.create({
      name: 'AI & Neural Networks Society',
      category: 'Artificial Intelligence',
      description: 'Explorations in Machine Learning, Computer Vision, and Generative AI.',
      facultyCoordinator: facultyUser._id,
      eligibilityRules: 'Open to 2nd, 3rd, and 4th year engineering students.',
      meetingSchedule: 'Fridays at 3:30 PM',
      location: 'Seminar Hall B',
      contactEmail: 'ai-society@csms.edu',
    });

    await ClubMembership.create({
      club: codexClub._id,
      student: studentUser._id,
      status: 'active',
      role: 'President',
      applicationText: 'Founding member and algorithmic enthusiast.',
      joinedDate: new Date('2024-01-15'),
    });

    await ClubMembership.create({
      club: aiClub._id,
      student: studentUser2._id,
      status: 'pending',
      role: 'Member',
      applicationText: 'I want to learn PyTorch and build neural net applications.',
    });

    await ClubEvent.create({
      club: codexClub._id,
      title: 'Annual HackCSMS 2026 Hackathon',
      description: '24-hour sprint to build innovative campus solutions with real-time prizes.',
      eventDate: new Date('2026-10-25'),
      location: 'Main Campus Auditorium',
      maxParticipants: 150,
      createdBy: coordinatorUser._id,
    });

    console.log('[Seed] Creating Achievers Q&A Data...');
    const question1 = await Question.create({
      author: studentUser2._id,
      title: 'How should I structure my preparation for Data Structures and Algorithms?',
      description: 'I am in 2nd year CSE and want to build strong algorithmic problem-solving skills for internship online assessments. Should I follow LeetCode top 150 or Striver SDE sheet?',
      category: 'Data Structures & Algorithms',
      tags: ['dsa', 'leetcode', 'placements', 'cpp'],
      upvotesCount: 14,
      answersCount: 1,
      views: 182,
    });

    const answer1 = await Answer.create({
      question: question1._id,
      author: studentUser._id,
      content: `Here is my battle-tested roadmap that helped me secure a top tech internship:

1. **Master Core Fundamentals First**: Spend 2 weeks on Arrays, Strings, Two Pointers, and Sliding Window.
2. **Standard Trees & Graphs**: Master DFS/BFS traversals until you can write them without thinking.
3. **Follow Striver's A2Z Sheet**: It provides structured progression from easy to hard.
4. **Consistency Over Intensity**: Solve 2 problems daily rather than 10 in one weekend!`,
      upvotesCount: 28,
      isAccepted: true,
    });

    question1.acceptedAnswer = answer1._id;
    await question1.save();

    console.log('[Seed] Creating Verified Achiever Profile...');
    await AchieverRecord.create({
      student: studentUser._id,
      achievementsSummary: 'Knight on LeetCode (Rating 1940+), Winner of HackCSMS 2025, Incoming SWE Intern at TechCorp.',
      codingBadges: ['LeetCode Knight (Top 3%)', 'CodeChef 5-Star Division 1'],
      hackathonsWon: ['1st Place - National Hack-a-Nation 2025', 'Best UI/UX - HackCSMS 2025'],
      internships: ['Backend Engineering Intern @ Acme Systems (Summer 2025)'],
      expertiseAreas: ['Data Structures & Algorithms', 'React & Node.js Architecture', 'MongoDB Optimization'],
      verificationStatus: 'VERIFIED',
      verifiedBy: facultyUser._id,
      verificationComments: 'Academic records and competition certificates verified by Faculty Board.',
    });

    console.log('[Seed] Creating Notifications & Audit Logs...');
    await Notification.create({
      recipient: studentUser._id,
      title: 'Attendance Shortage Alert',
      message: 'Your attendance in Data Structures & Algorithms is 70% (below 75%). You must attend the next 12 consecutive classes.',
      type: 'ATTENDANCE_WARNING',
      linkUrl: '/attendance',
    });

    await AuditLog.create({
      user: adminUser._id,
      action: 'SYSTEM_SEED',
      targetEntity: 'System',
      details: 'System database successfully seeded with initial academic records and sample profiles.',
    });

    console.log('\n=============================================================');
    console.log('  SUCCESS: CSMS DATABASE SEEDED WITH REALISTIC DEMO DATA!  ');
    console.log('=============================================================');
    console.log(' Sample Login Credentials:');
    console.log('  Student:       student@csms.edu      / Password123!');
    console.log('  Student 2:     student2@csms.edu     / Password123!');
    console.log('  Faculty:       faculty@csms.edu      / Password123!');
    console.log('  Administrator: admin@csms.edu        / Password123!');
    console.log('  Coordinator:   coordinator@csms.edu  / Password123!');
    console.log('=============================================================\n');

  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
  } finally {
    await disconnectDB();
  }
};

seedData();
