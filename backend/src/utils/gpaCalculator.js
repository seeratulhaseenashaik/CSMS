/**
 * Subject Marks, Grade Points, SGPA & CGPA Business Logic
 */

/**
 * Maps percentage to standard Letter Grade & Grade Point (10-point scale).
 */
function getGradeAndPoints(percentage) {
  if (percentage >= 90) return { grade: 'O', gradePoints: 10 };
  if (percentage >= 80) return { grade: 'A+', gradePoints: 9 };
  if (percentage >= 70) return { grade: 'A', gradePoints: 8 };
  if (percentage >= 60) return { grade: 'B+', gradePoints: 7 };
  if (percentage >= 50) return { grade: 'B', gradePoints: 6 };
  if (percentage >= 40) return { grade: 'C', gradePoints: 5 };
  return { grade: 'F', gradePoints: 0 };
}

/**
 * Evaluates subject result status based on total marks and individual component thresholds.
 */
function evaluateSubjectStatus(result, subject) {
  const totalMarks = (result.internalMarks || 0) + (result.midtermMarks || 0) + (result.practicalMarks || 0) + (result.endSemMarks || 0);
  const maxMarks = subject.maxMarks || 100;
  const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

  const minTotal = subject.minPassingMarks || 40;
  const minInternal = subject.internalMinPassingMarks || 0;
  const minEndSem = subject.endSemMinPassingMarks || 0;

  const internalPassed = (result.internalMarks || 0) >= minInternal;
  const endSemPassed = (result.endSemMarks || 0) >= minEndSem;
  const totalPassed = totalMarks >= minTotal;

  const isPassed = internalPassed && endSemPassed && totalPassed;

  const { grade, gradePoints } = isPassed ? getGradeAndPoints(percentage) : { grade: 'F', gradePoints: 0 };
  const status = isPassed ? 'PASS' : 'FAIL';

  // Calculate remaining marks required for pass
  const marksNeededForTotal = Math.max(0, minTotal - totalMarks);
  const internalNeeded = Math.max(0, minInternal - (result.internalMarks || 0));
  const endSemNeeded = Math.max(0, minEndSem - (result.endSemMarks || 0));

  return {
    totalMarks,
    percentage: Number(percentage.toFixed(2)),
    grade,
    gradePoints,
    status,
    isPassed,
    internalPassed,
    endSemPassed,
    totalPassed,
    marksNeededForTotal,
    internalNeeded,
    endSemNeeded,
  };
}

/**
 * Calculates Semester Grade Point Average (SGPA).
 * SGPA = Sum(Credits * GradePoints) / Sum(Credits)
 */
function calculateSGPA(subjectResults, subjectsMap) {
  let totalCredits = 0;
  let weightedPoints = 0;

  for (const result of subjectResults) {
    const subjectId = result.subject._id ? result.subject._id.toString() : result.subject.toString();
    const subject = subjectsMap[subjectId] || result.subject;
    const credits = subject?.credits || 4;

    if (result.status === 'PASS') {
      weightedPoints += (result.gradePoints || 0) * credits;
    }
    totalCredits += credits;
  }

  if (totalCredits === 0) return 0;
  return Number((weightedPoints / totalCredits).toFixed(2));
}

/**
 * Calculates Cumulative Grade Point Average (CGPA).
 */
function calculateCGPA(semestersSgpaList) {
  if (!semestersSgpaList || semestersSgpaList.length === 0) return 0;
  let totalSgpa = 0;
  let validSemesters = 0;

  for (const item of semestersSgpaList) {
    if (typeof item.sgpa === 'number' && item.credits > 0) {
      totalSgpa += item.sgpa * item.credits;
      validSemesters += item.credits;
    }
  }

  if (validSemesters === 0) return 0;
  return Number((totalSgpa / validSemesters).toFixed(2));
}

module.exports = {
  getGradeAndPoints,
  evaluateSubjectStatus,
  calculateSGPA,
  calculateCGPA,
};
