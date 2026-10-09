/**
 * Academic Progression and Promotion Eligibility Engine
 */

/**
 * Evaluates a student's eligibility for promotion to the next academic year.
 * @param {Object} studentProfile - Student record
 * @param {Array} subjectResults - All subject results for the current academic year/batch
 * @param {Object} rule - Configured PromotionRule object
 * @param {number} overallAttendancePct - Student's overall attendance %
 * @returns {Object} Detailed promotion decision & condition status list
 */
function evaluatePromotionEligibility(studentProfile, subjectResults, rule, overallAttendancePct = 100) {
  if (!rule) {
    return {
      status: 'PENDING_VERIFICATION',
      eligible: false,
      summary: 'Promotion rules not configured for this batch and department.',
      conditions: [],
      passedSubjectsCount: 0,
      totalSubjectsCount: 0,
      additionalSubjectsNeeded: 0,
      backlogsCount: 0,
    };
  }

  const totalSubjectsCount = subjectResults.length;
  const passedResults = subjectResults.filter(r => r.status === 'PASS');
  const failedResults = subjectResults.filter(r => r.status === 'FAIL' || r.status === 'BACKLOG');
  const pendingResults = subjectResults.filter(r => r.status === 'PENDING' || r.status === 'PROVISIONAL');

  const passedSubjectsCount = passedResults.length;
  const backlogsCount = failedResults.length;

  // Minimum required subjects calculation: R = ceil(q * N)
  const requiredPassedRatio = rule.minPassedSubjectsRatio || 0.75;
  const requiredPassedCount = Math.ceil(requiredPassedRatio * totalSubjectsCount);
  const additionalSubjectsNeeded = Math.max(0, requiredPassedCount - passedSubjectsCount);

  // Condition 1: Minimum passed subjects
  const condSubjects = {
    name: 'Minimum Passed Subjects',
    required: `${requiredPassedCount} out of ${totalSubjectsCount} subjects (${(requiredPassedRatio * 100).toFixed(0)}%)`,
    actual: `${passedSubjectsCount} passed`,
    satisfied: passedSubjectsCount >= requiredPassedCount,
    details: passedSubjectsCount >= requiredPassedCount 
      ? 'Requirement satisfied.' 
      : `Short by ${additionalSubjectsNeeded} subject(s).`,
  };

  // Condition 2: Maximum Permitted Backlogs
  const maxBacklogsAllowed = rule.maxPermittedBacklogs ?? 2;
  const condBacklogs = {
    name: 'Maximum Permitted Backlogs',
    required: `Maximum ${maxBacklogsAllowed} backlog(s)`,
    actual: `${backlogsCount} backlog(s)`,
    satisfied: backlogsCount <= maxBacklogsAllowed,
    details: backlogsCount <= maxBacklogsAllowed 
      ? 'Requirement satisfied.' 
      : `Exceeds max allowed backlogs by ${backlogsCount - maxBacklogsAllowed}.`,
  };

  // Condition 3: Minimum Earned Credits
  const minCredits = rule.minEarnedCredits || 30;
  const actualEarnedCredits = studentProfile.earnedCredits || 0;
  const condCredits = {
    name: 'Minimum Earned Credits',
    required: `${minCredits} credits`,
    actual: `${actualEarnedCredits} credits earned`,
    satisfied: actualEarnedCredits >= minCredits,
    details: actualEarnedCredits >= minCredits 
      ? 'Requirement satisfied.' 
      : `Short by ${minCredits - actualEarnedCredits} credit(s).`,
  };

  // Condition 4: Compulsory Subject Clearance
  const compulsoryCodes = rule.compulsorySubjectCodes || [];
  const unclearedCompulsory = [];

  for (const code of compulsoryCodes) {
    const passed = passedResults.some(r => r.subject?.code?.toUpperCase() === code.toUpperCase());
    if (!passed) {
      unclearedCompulsory.push(code);
    }
  }

  const condCompulsory = {
    name: 'Compulsory Subject Clearance',
    required: compulsoryCodes.length > 0 ? `Must clear: ${compulsoryCodes.join(', ')}` : 'None required',
    actual: unclearedCompulsory.length === 0 ? 'All compulsory subjects cleared' : `Uncleared: ${unclearedCompulsory.join(', ')}`,
    satisfied: unclearedCompulsory.length === 0,
    details: unclearedCompulsory.length === 0 
      ? 'Requirement satisfied.' 
      : `Uncleared compulsory subjects: ${unclearedCompulsory.join(', ')}.`,
  };

  // Condition 5: Minimum Attendance Percentage
  const minAttendance = rule.minAttendancePercentage || 75;
  const condAttendance = {
    name: 'Minimum Attendance Requirement',
    required: `${minAttendance}% overall attendance`,
    actual: `${overallAttendancePct}% attendance`,
    satisfied: overallAttendancePct >= minAttendance,
    details: overallAttendancePct >= minAttendance 
      ? 'Requirement satisfied.' 
      : `Short by ${(minAttendance - overallAttendancePct).toFixed(2)}%.`,
  };

  const conditions = [condSubjects, condBacklogs, condCredits, condCompulsory, condAttendance];
  const allSatisfied = conditions.every(c => c.satisfied);

  let status = 'NOT_ELIGIBLE';
  let summary = '';

  if (pendingResults.length > 0) {
    status = 'PENDING_VERIFICATION';
    summary = `Promotion eligibility pending due to ${pendingResults.length} unpublished or pending result(s).`;
  } else if (allSatisfied) {
    status = 'ELIGIBLE';
    summary = `Eligible for promotion from Academic Year ${rule.fromYear} to Year ${rule.toYear}. All official criteria satisfied.`;
  } else if (condSubjects.satisfied && condCredits.satisfied && condCompulsory.satisfied && backlogsCount <= maxBacklogsAllowed + 1) {
    status = 'CONDITIONALLY_ELIGIBLE';
    summary = `Conditionally eligible for promotion subject to clearing supplementary examinations for pending backlogs.`;
  } else {
    status = 'NOT_ELIGIBLE';
    summary = `Not eligible for promotion. ${conditions.filter(c => !c.satisfied).map(c => c.name).join(', ')} failed.`;
  }

  return {
    status,
    eligible: status === 'ELIGIBLE' || status === 'CONDITIONALLY_ELIGIBLE',
    summary,
    conditions,
    passedSubjectsCount,
    totalSubjectsCount,
    additionalSubjectsNeeded,
    backlogsCount,
    pendingResultsCount: pendingResults.length,
    fromYear: rule.fromYear,
    toYear: rule.toYear,
  };
}

module.exports = {
  evaluatePromotionEligibility,
};
