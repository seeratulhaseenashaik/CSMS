const { evaluatePromotionEligibility } = require('../src/utils/progressionEvaluator');

describe('Academic Progression & Promotion Eligibility Engine Tests', () => {
  const studentProfile = {
    registrationNumber: '2023CSE001',
    department: 'CSE',
    academicYear: 3,
    batch: '2023-2027',
    earnedCredits: 70,
  };

  const rule = {
    batch: '2023-2027',
    department: 'CSE',
    fromYear: 3,
    toYear: 4,
    minPassedSubjectsRatio: 0.75, // 75% of subjects (e.g. 6 out of 8)
    minEarnedCredits: 60,
    maxPermittedBacklogs: 2,
    compulsorySubjectCodes: ['CS301'],
    minAttendancePercentage: 75,
  };

  test('All promotion conditions satisfied -> ELIGIBLE', () => {
    const results = [
      { subject: { code: 'CS301' }, status: 'PASS' },
      { subject: { code: 'CS302' }, status: 'PASS' },
      { subject: { code: 'CS303' }, status: 'PASS' },
      { subject: { code: 'CS304' }, status: 'PASS' },
      { subject: { code: 'CS305' }, status: 'PASS' },
      { subject: { code: 'CS306' }, status: 'PASS' },
      { subject: { code: 'CS307' }, status: 'PASS' },
      { subject: { code: 'CS308' }, status: 'PASS' },
    ];

    const evalRes = evaluatePromotionEligibility(studentProfile, results, rule, 80);
    expect(evalRes.status).toBe('ELIGIBLE');
    expect(evalRes.eligible).toBe(true);
    expect(evalRes.passedSubjectsCount).toBe(8);
  });

  test('Insufficient subjects cleared -> NOT_ELIGIBLE', () => {
    // Only 4 passed out of 8 (50% < 75%)
    const results = [
      { subject: { code: 'CS301' }, status: 'PASS' },
      { subject: { code: 'CS302' }, status: 'PASS' },
      { subject: { code: 'CS303' }, status: 'PASS' },
      { subject: { code: 'CS304' }, status: 'PASS' },
      { subject: { code: 'CS305' }, status: 'FAIL' },
      { subject: { code: 'CS306' }, status: 'FAIL' },
      { subject: { code: 'CS307' }, status: 'FAIL' },
      { subject: { code: 'CS308' }, status: 'FAIL' },
    ];

    const evalRes = evaluatePromotionEligibility(studentProfile, results, rule, 80);
    expect(evalRes.status).toBe('NOT_ELIGIBLE');
    expect(evalRes.additionalSubjectsNeeded).toBe(2); // needs 6 - 4 = 2
  });

  test('Uncleared compulsory subject -> NOT_ELIGIBLE', () => {
    const results = [
      { subject: { code: 'CS301' }, status: 'FAIL' }, // Compulsory failed!
      { subject: { code: 'CS302' }, status: 'PASS' },
      { subject: { code: 'CS303' }, status: 'PASS' },
      { subject: { code: 'CS304' }, status: 'PASS' },
      { subject: { code: 'CS305' }, status: 'PASS' },
      { subject: { code: 'CS306' }, status: 'PASS' },
      { subject: { code: 'CS307' }, status: 'PASS' },
      { subject: { code: 'CS308' }, status: 'PASS' },
    ];

    const evalRes = evaluatePromotionEligibility(studentProfile, results, rule, 80);
    expect(evalRes.status).toBe('NOT_ELIGIBLE');
  });

  test('Pending examination results -> PENDING_VERIFICATION', () => {
    const results = [
      { subject: { code: 'CS301' }, status: 'PASS' },
      { subject: { code: 'CS302' }, status: 'PENDING' },
    ];

    const evalRes = evaluatePromotionEligibility(studentProfile, results, rule, 80);
    expect(evalRes.status).toBe('PENDING_VERIFICATION');
  });
});
