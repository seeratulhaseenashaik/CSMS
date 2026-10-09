const { evaluateSubjectStatus, calculateSGPA, calculateCGPA } = require('../src/utils/gpaCalculator');

describe('Subject Scorecard & GPA Calculation Tests', () => {
  const subjectScheme = {
    maxMarks: 100,
    minPassingMarks: 40,
    internalMinPassingMarks: 12,
    endSemMinPassingMarks: 28,
    credits: 4,
  };

  test('Marks exactly at passing threshold should pass', () => {
    const result = { internalMarks: 12, endSemMarks: 28 };
    const res = evaluateSubjectStatus(result, subjectScheme);
    expect(res.status).toBe('PASS');
    expect(res.grade).toBe('C');
    expect(res.gradePoints).toBe(5);
    expect(res.marksNeededForTotal).toBe(0);
  });

  test('Fails if internal mark is below internal threshold even if total >= 40', () => {
    // Internal 10 (min 12), EndSem 40. Total 50.
    const result = { internalMarks: 10, endSemMarks: 40 };
    const res = evaluateSubjectStatus(result, subjectScheme);
    expect(res.status).toBe('FAIL');
    expect(res.internalPassed).toBe(false);
    expect(res.internalNeeded).toBe(2);
  });

  test('Fails if total mark is below overall threshold', () => {
    const result = { internalMarks: 12, endSemMarks: 20 }; // Total 32 (min 40)
    const res = evaluateSubjectStatus(result, subjectScheme);
    expect(res.status).toBe('FAIL');
    expect(res.marksNeededForTotal).toBe(8);
  });

  test('SGPA & CGPA Calculation', () => {
    const subject1 = { _id: 's1', credits: 4 };
    const subject2 = { _id: 's2', credits: 4 };

    const subjectResults = [
      { subject: subject1, status: 'PASS', gradePoints: 9 }, // A+ (9) * 4 = 36
      { subject: subject2, status: 'PASS', gradePoints: 8 }, // A  (8) * 4 = 32
    ];

    const sgpa = calculateSGPA(subjectResults, { s1: subject1, s2: subject2 });
    expect(sgpa).toBe(8.5); // (36 + 32) / 8 = 68 / 8 = 8.5

    const semList = [
      { semester: 1, sgpa: 8.5, credits: 20 },
      { semester: 2, sgpa: 9.0, credits: 20 },
    ];
    const cgpa = calculateCGPA(semList);
    expect(cgpa).toBe(8.75); // (8.5*20 + 9.0*20) / 40 = 170 + 180 / 40 = 350 / 40 = 8.75
  });
});
