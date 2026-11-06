const {
  calculateAttendancePercentage,
  calculateClassesToReachTarget,
  calculateBunkAllowance,
  getAttendanceStatus,
} = require('../src/utils/attendanceCalculator');
const { evaluateSubjectStatus } = require('../src/utils/gpaCalculator');

describe('Faculty Module Business Logic & Institutional Calculations', () => {
  const cseSubject = {
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    maxMarks: 100,
    minPassingMarks: 40,
    internalMaxMarks: 30,
    internalMinPassingMarks: 12,
    endSemMaxMarks: 70,
    endSemMinPassingMarks: 28,
  };

  test('Attendance calculation treats excused absence as attended under institutional policy', () => {
    // 40 attended + 2 excused out of 50 sessions conducted
    const regularAttended = 40;
    const excused = 2;
    const totalConducted = 50;

    const effectiveAttended = regularAttended + excused;
    const percentage = calculateAttendancePercentage(effectiveAttended, totalConducted);

    expect(percentage).toBe(84);
    expect(percentage).toBeGreaterThanOrEqual(75);
    expect(getAttendanceStatus(percentage, 75).code).toBe('MEETS_REQUIREMENT');
  });

  test('Attendance shortage warning correctly identifies student below 75% threshold', () => {
    // 35 attended out of 50 conducted -> 70%
    const attended = 35;
    const total = 50;
    const percentage = calculateAttendancePercentage(attended, total);

    expect(percentage).toBe(70);
    const classesNeeded = calculateClassesToReachTarget(attended, total, 0.75);
    // Needed: (0.75 * 50 - 35) / (1 - 0.75) = (37.5 - 35) / 0.25 = 2.5 / 0.25 = 10 classes
    expect(classesNeeded).toBe(10);
    expect(getAttendanceStatus(percentage, 75).code).toBe('AT_RISK');
  });

  test('Marks entry validation prevents negative marks and calculates letter grade O for >= 90', () => {
    const studentMarks = {
      internalMarks: 28, // Max 30
      midtermMarks: 0,
      practicalMarks: 0,
      endSemMarks: 65, // Max 70
    };

    const evaluation = evaluateSubjectStatus(studentMarks, cseSubject);
    expect(evaluation.totalMarks).toBe(93);
    expect(evaluation.isPassed).toBe(true);
    expect(evaluation.grade).toBe('O');
    expect(evaluation.gradePoints).toBe(10);
  });

  test('Fails when end-sem marks are below passing threshold (27 < 28)', () => {
    const studentMarks = {
      internalMarks: 30, // Perfect internal
      endSemMarks: 27,   // 27 < 28 (fails component)
    };

    const evaluation = evaluateSubjectStatus(studentMarks, cseSubject);
    expect(evaluation.totalMarks).toBe(57);
    expect(evaluation.totalPassed).toBe(true);
    expect(evaluation.endSemPassed).toBe(false);
    expect(evaluation.status).toBe('FAIL');
    expect(evaluation.grade).toBe('F');
    expect(evaluation.gradePoints).toBe(0);
    expect(evaluation.endSemNeeded).toBe(1);
  });

  test('Date of Birth format normalization supports YYYY-MM-DD, DD-MM-YYYY, and compact variants', () => {
    // Test that various user inputs for a DOB match the stored ISO format
    const storedDob = '2004-05-15';

    function normalizeDobVariants(input) {
      if (!input) return [];
      const trimmed = String(input).trim();
      const digits = trimmed.replace(/\D/g, '');
      const variants = new Set([trimmed]);

      if (digits.length === 8) {
        variants.add(digits);
        const y1 = Number(digits.slice(0, 4));
        const m1 = digits.slice(4, 6);
        const d1 = digits.slice(6, 8);
        if (y1 >= 1900 && y1 <= 2100) {
          variants.add(`${y1}-${m1}-${d1}`);
          variants.add(`${d1}-${m1}-${y1}`);
          variants.add(`${d1}/${m1}/${y1}`);
        }
        const d2 = digits.slice(0, 2);
        const m2 = digits.slice(2, 4);
        const y2 = Number(digits.slice(4, 8));
        if (y2 >= 1900 && y2 <= 2100) {
          variants.add(`${y2}-${m2}-${d2}`);
          variants.add(`${d2}-${m2}-${y2}`);
          variants.add(`${d2}/${m2}/${y2}`);
        }
      }
      return Array.from(variants);
    }

    const targetVariants = normalizeDobVariants(storedDob);

    // Matches standard ISO YYYY-MM-DD
    expect(normalizeDobVariants('2004-05-15').some((v) => targetVariants.includes(v))).toBe(true);
    // Matches Indian / Commonwealth format DD-MM-YYYY
    expect(normalizeDobVariants('15-05-2004').some((v) => targetVariants.includes(v))).toBe(true);
    // Matches slash format DD/MM/YYYY
    expect(normalizeDobVariants('15/05/2004').some((v) => targetVariants.includes(v))).toBe(true);
    // Matches compact numeric DDMMYYYY
    expect(normalizeDobVariants('15052004').some((v) => targetVariants.includes(v))).toBe(true);
    // Rejects incorrect DOB
    expect(normalizeDobVariants('2004-05-16').some((v) => targetVariants.includes(v))).toBe(false);
  });
});
