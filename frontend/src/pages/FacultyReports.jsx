import React, { useState, useEffect } from 'react';
import { getFacultyReportsApi } from '../services/api';
import {
  BarChart3,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  RefreshCw,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';

export default function FacultyReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFacultyReportsApi();
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Unable to compile analytics reports for your assigned subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Export report to CSV
  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Subject Code,Subject Name,Metric 1,Metric 2\r\n';

    // Subject Attendance
    data.subjectAttendanceStats?.forEach((s) => {
      csvContent += `Attendance,${s.code},"${s.name}",${s.averageAttendance}%,${s.totalSessionsLogged} sessions\r\n`;
    });

    // Shortage students
    data.shortageStudents?.forEach((st) => {
      csvContent += `Shortage Alert,${st.subjectCode},"${st.name} (${st.registrationNumber})",${st.attendancePercentage}%,Needs ${st.classesNeeded} classes\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `faculty_academic_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#500071] animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Aggregating departmental reports & performance metrics...</p>
      </div>
    );
  }

  const attendanceStats = data?.subjectAttendanceStats || [];
  const shortageStudents = data?.shortageStudents || [];
  const gradeDist = data?.gradeDistribution || {};
  const perf = data?.performanceSummary || { totalEvaluated: 0, passCount: 0, failCount: 0, passPercentage: 0 };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#8A2A78]" />
            <h1 className="text-2xl font-black text-[#290044]">Reports & Academic Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional performance trends, attendance compliance monitoring, and score distributions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] text-xs font-bold shadow-md shadow-[#500071]/25 hover:opacity-95 transition-all inline-flex items-center gap-2 self-start md:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#EEE3B0]" /> Export CSV Report
        </button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">Subjects Monitored</p>
          <h3 className="text-2xl font-black text-[#290044]">{attendanceStats.length}</h3>
          <p className="text-[11px] text-[#500071] font-semibold">Active Syllabus Courses</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">Evaluated Students</p>
          <h3 className="text-2xl font-black text-[#290044]">{perf.totalEvaluated}</h3>
          <p className="text-[11px] text-slate-500 font-semibold">Assessment Scorecards</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">Overall Pass Rate</p>
          <h3 className="text-2xl font-black text-emerald-600">{perf.passPercentage}%</h3>
          <p className="text-[11px] text-slate-500 font-semibold">{perf.passCount} Passed, {perf.failCount} Failed</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase">Attendance Shortages</p>
          <h3 className={`text-2xl font-black ${shortageStudents.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {shortageStudents.length}
          </h3>
          <p className="text-[11px] text-slate-500 font-semibold">Below 75% Requirement</p>
        </div>
      </div>

      {/* Subject-wise Attendance Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#290044]">Subject-wise Attendance Compliance</h3>

        <div className="space-y-4">
          {attendanceStats.map((sub) => (
            <div key={sub.subjectId} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  <span className="text-[#500071]">{sub.code}</span> - {sub.name}
                </span>
                <span className="font-bold text-slate-700">
                  {sub.averageAttendance}% ({sub.totalSessionsLogged} sessions logged)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sub.averageAttendance >= 75
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      : 'bg-gradient-to-r from-rose-500 to-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, sub.averageAttendance)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Distribution Bar Visualizer */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#290044]">Assessment Grade Distribution</h3>
        <p className="text-xs text-slate-500">
          Distribution of letter grades awarded across all finalized continuous and end-sem assessments.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {['O', 'A+', 'A', 'B+', 'B', 'C', 'F'].map((g) => {
            const count = gradeDist[g] || 0;
            const isF = g === 'F';

            return (
              <div
                key={g}
                className={`p-4 rounded-2xl border text-center space-y-1 ${
                  isF ? 'bg-rose-50 border-rose-100' : 'bg-purple-50/40 border-purple-100'
                }`}
              >
                <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                  isF ? 'bg-rose-600 text-white' : 'bg-[#500071] text-[#EEE3B0]'
                }`}>
                  Grade {g}
                </span>
                <h4 className="text-2xl font-black text-slate-800 mt-2">{count}</h4>
                <p className="text-[10px] text-slate-400 font-medium">Students</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Low Attendance Student Alerts Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-black text-[#290044]">
              Students Below Attendance Threshold (&lt;75%)
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
            {shortageStudents.length} Alert(s)
          </span>
        </div>

        {shortageStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
            All students in your assigned cohorts meet or exceed the institutional 75% attendance criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-900 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Current Attendance</th>
                  <th className="py-2.5 px-3">Classes Needed for 75%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50">
                {shortageStudents.map((st, idx) => (
                  <tr key={idx} className="hover:bg-rose-50/30">
                    <td className="py-3 px-3 font-bold text-slate-800">{st.name}</td>
                    <td className="py-3 px-3 font-mono text-[#500071]">{st.registrationNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {st.subjectCode} - {st.subjectName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-rose-600 px-2 py-0.5 rounded-full bg-rose-100">
                        {st.attendancePercentage}% ({st.attended}/{st.total})
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700">
                      Must attend next {st.classesNeeded} classes
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
