/**
 * Attendance Calculator Business Logic
 */

/**
 * Calculates current attendance percentage safely.
 * @param {number} attended - Number of classes attended
 * @param {number} total - Total classes conducted
 * @returns {number} Attendance percentage rounded to 2 decimal places
 */
function calculateAttendancePercentage(attended, total) {
  if (!total || total <= 0) return 0;
  if (!attended || attended < 0) return 0;
  const pct = (attended / total) * 100;
  return Number(pct.toFixed(2));
}

/**
 * Determines minimum consecutive classes required to reach target threshold.
 * Condition: (A + x) / (T + x) >= p
 * Formula: x = Math.ceil((p * T - A) / (1 - p))
 * @param {number} attended - A
 * @param {number} total - T
 * @param {number} targetThreshold - p (e.g., 0.75 for 75%)
 * @returns {number} Minimum additional consecutive classes needed
 */
function calculateClassesToReachTarget(attended, total, targetThreshold = 0.75) {
  if (total <= 0) return 0;
  const currentPct = attended / total;
  if (currentPct >= targetThreshold) return 0;

  const required = Math.ceil((targetThreshold * total - attended) / (1 - targetThreshold));
  return Math.max(0, required);
}

/**
 * Calculates maximum additional classes that can be missed while remaining at or above target threshold.
 * Formula: Math.floor((A - p * T) / p)
 * @param {number} attended - A
 * @param {number} total - T
 * @param {number} targetThreshold - p (e.g. 0.75 for 75%)
 * @returns {number} Bunk allowance (non-negative integer)
 */
function calculateBunkAllowance(attended, total, targetThreshold = 0.75) {
  if (total <= 0) return 0;
  const currentPct = attended / total;
  if (currentPct < targetThreshold) return 0;

  const maxAbsences = Math.floor((attended - targetThreshold * total) / targetThreshold);
  return Math.max(0, maxAbsences);
}

/**
 * Calculates projected attendance percentage given future attended classes F.
 * Formula: ((A + F) / (T + F)) * 100
 * @param {number} attended - A
 * @param {number} total - T
 * @param {number} futureAttended - F
 * @returns {{ projectedPercentage: number, meetsTarget: boolean }}
 */
function predictFutureAttendance(attended, total, futureAttended, targetThreshold = 0.75) {
  const newAttended = attended + futureAttended;
  const newTotal = total + futureAttended;
  const projectedPercentage = calculateAttendancePercentage(newAttended, newTotal);
  return {
    projectedPercentage,
    meetsTarget: projectedPercentage >= targetThreshold * 100,
  };
}

/**
 * Determines attendance status badge/classification.
 */
function getAttendanceStatus(percentage, targetThresholdPct = 75, warningThresholdPct = 70) {
  if (percentage >= targetThresholdPct) return { code: 'MEETS_REQUIREMENT', label: 'Meets Requirement', color: 'green' };
  if (percentage >= warningThresholdPct) return { code: 'AT_RISK', label: 'At Risk', color: 'yellow' };
  return { code: 'ATTENDANCE_SHORTAGE', label: 'Attendance Shortage', color: 'red' };
}

module.exports = {
  calculateAttendancePercentage,
  calculateClassesToReachTarget,
  calculateBunkAllowance,
  predictFutureAttendance,
  getAttendanceStatus,
};
