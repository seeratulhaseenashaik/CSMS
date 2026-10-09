const {
  calculateAttendancePercentage,
  calculateClassesToReachTarget,
  calculateBunkAllowance,
  predictFutureAttendance,
} = require('../src/utils/attendanceCalculator');

describe('Attendance Management & Smart Calculator Tests', () => {
  test('Zero classes conducted should return 0%', () => {
    expect(calculateAttendancePercentage(0, 0)).toBe(0);
  });

  test('Zero classes attended should return 0%', () => {
    expect(calculateAttendancePercentage(0, 40)).toBe(0);
  });

  test('Attendance exactly at 75%', () => {
    expect(calculateAttendancePercentage(45, 60)).toBe(75);
    expect(calculateClassesToReachTarget(45, 60, 0.75)).toBe(0);
    expect(calculateBunkAllowance(45, 60, 0.75)).toBe(0);
  });

  test('Attendance below 75% - Calculate required recovery classes correctly', () => {
    // 42 out of 60 -> 70%. Target 75%.
    // Formula: ceil((0.75 * 60 - 42) / (1 - 0.75)) = ceil((45 - 42) / 0.25) = ceil(3 / 0.25) = 12
    expect(calculateAttendancePercentage(42, 60)).toBe(70);
    expect(calculateClassesToReachTarget(42, 60, 0.75)).toBe(12);
    expect(calculateBunkAllowance(42, 60, 0.75)).toBe(0);
  });

  test('Attendance above 75% - Calculate bunk allowance correctly', () => {
    // 50 out of 55 -> 90.91%. Target 75%.
    // Bunk allowance = floor((50 - 0.75 * 55) / 0.75) = floor((50 - 41.25) / 0.75) = floor(8.75 / 0.75) = floor(11.66) = 11
    expect(calculateAttendancePercentage(50, 55)).toBe(90.91);
    expect(calculateClassesToReachTarget(50, 55, 0.75)).toBe(0);
    expect(calculateBunkAllowance(50, 55, 0.75)).toBe(11);
  });

  test('Future attendance prediction', () => {
    // Current 42/60 (70%). Attend next 15 future classes.
    // Total attended = 57/75 = 76%
    const res = predictFutureAttendance(42, 60, 15, 0.75);
    expect(res.projectedPercentage).toBe(76);
    expect(res.meetsTarget).toBe(true);
  });
});
