import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getFacultyAttendanceApi,
  recordBulkAttendanceApi
} from '../services/api';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Save,
  Search,
  Filter,
  RefreshCw,
  Info,
  Calendar,
  Check,
  FileCheck
} from 'lucide-react';

export default function FacultyAttendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSubjectId = searchParams.get('subjectId');

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(urlSubjectId || '');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('Lecture');
  const [remarks, setRemarks] = useState('');

  const [roster, setRoster] = useState([]);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recentDates, setRecentDates] = useState([]);

  // Submission feedback and confirmation modal state
  const [feedback, setFeedback] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch roster & attendance for subject and date
  const loadAttendanceSession = async (subjId, dateStr) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await getFacultyAttendanceApi({
        subjectId: subjId,
        date: dateStr,
      });

      if (res.data?.success) {
        const data = res.data.data;
        setSubjects(data.subjects || []);
        setSubjectDetails(data.subject);
        setRoster(data.roster || []);
        setRecentDates(data.recentLoggedDates || []);
        if (!subjId && data.subject?._id) {
          setSelectedSubjectId(data.subject._id);
        }
      }
    } catch (err) {
      console.error('Error loading attendance session:', err);
      setFeedback({
        type: 'error',
        message: 'Failed to load attendance roster. Please ensure you are authorized for this subject.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceSession(selectedSubjectId, sessionDate);
  }, [selectedSubjectId, sessionDate]);

  // Bulk status helpers
  const handleSetStatus = (studentId, status) => {
    setRoster((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, status } : student
      )
    );
  };

  const handleStudentRemarks = (studentId, studentRemarks) => {
    setRoster((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, remarks: studentRemarks } : student
      )
    );
  };

  const handleMarkAll = (status) => {
    setRoster((prev) => prev.map((s) => ({ ...s, status })));
  };

  // Submit attendance records
  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        subjectId: selectedSubjectId,
        sessionDate,
        sessionType,
        remarks,
        records: roster.map((s) => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks,
        })),
      };

      const res = await recordBulkAttendanceApi(payload);
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Attendance records committed and audit logged successfully!',
        });
        // Reload to update cumulative stats
        loadAttendanceSession(selectedSubjectId, sessionDate);
      }
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error saving attendance records. Please verify session locking and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter roster by search
  const filteredRoster = roster.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Live session counts
  const presentCount = roster.filter((s) => s.status === 'present').length;
  const absentCount = roster.filter((s) => s.status === 'absent').length;
  const excusedCount = roster.filter((s) => s.status === 'excused').length;
  const presentPercentage = roster.length > 0 ? Math.round(((presentCount + excusedCount) / roster.length) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#500071]" />
            <h1 className="text-2xl font-black text-[#290044]">Attendance Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conduct and record authorized session attendance, evaluate institutional 75% thresholds, and maintain student audit trails.
          </p>
        </div>

        {/* Quick Date Shortcuts */}
        {recentDates.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
            <span className="text-slate-400 text-[11px] font-medium mr-1">Recent:</span>
            {recentDates.slice(0, 3).map((d) => (
              <button
                key={d}
                onClick={() => setSessionDate(d)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                  sessionDate === d
                    ? 'bg-[#500071] text-[#EEE3B0] border-[#500071]'
                    : 'bg-white text-slate-600 border-purple-100 hover:bg-purple-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-150 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* Control Panel: Subject, Date, Session Type */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Select Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSearchParams({ subjectId: e.target.value });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} - {sub.name} (Sem {sub.semester})
                </option>
              ))}
            </select>
          </div>

          {/* Session Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Session Date</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
            />
          </div>

          {/* Session Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Session Type</label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
            >
              <option value="Lecture">Lecture</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Practical">Practical</option>
            </select>
          </div>

          {/* Session Remarks / Topic */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Curriculum Topic / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Trees & Balanced BSTs..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
            />
          </div>
        </div>

        {/* Live Session Counter & Bulk Actions Bar */}
        <div className="pt-4 border-t border-purple-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Live Session Tally:</span>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Present: {presentCount}
            </span>
            <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> Absent: {absentCount}
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Excused: {excusedCount}
            </span>
            <span className="px-3 py-1 rounded-xl bg-purple-100 text-[#500071] text-xs font-bold">
              Rate: {presentPercentage}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkAll('present')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('absent')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors border border-rose-200"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter within Class Roster */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-purple-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-[#8A2A78] outline-none shadow-2xs"
          />
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Showing {filteredRoster.length} of {roster.length} enrolled student(s)
        </p>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#500071] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading enrolled student roster...</p>
          </div>
        ) : filteredRoster.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Enrolled Students Found</h4>
            <p className="text-xs text-slate-400">
              No students found matching your search term or enrolled in this subject.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#290044] to-[#500071] text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Class & Sem</th>
                  <th className="py-3.5 px-4">Cumulative Attendance</th>
                  <th className="py-3.5 px-4 text-center">Session Attendance Status</th>
                  <th className="py-3.5 px-4">Session Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-xs text-slate-700">
                {filteredRoster.map((student, idx) => {
                  const cum = student.cumulativeAttendance;
                  const isShortage = cum.hasShortage;

                  return (
                    <tr
                      key={student.studentId}
                      className={`hover:bg-purple-50/40 transition-colors ${
                        student.status === 'absent' ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-[11px] text-[#500071] font-mono">{student.registrationNumber}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-700">{student.department}</p>
                        <p className="text-[11px] text-slate-400">Semester {student.semester}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                              isShortage
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {cum.percentage}%
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({cum.attendedClasses}/{cum.totalClasses})
                          </span>
                        </div>
                        {isShortage && (
                          <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Shortage Alert (&lt;75%)
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.studentId, 'present')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              student.status === 'present'
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" /> Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.studentId, 'absent')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              student.status === 'absent'
                                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30 ring-2 ring-rose-600/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(student.studentId, 'excused')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              student.status === 'excused'
                                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-2 ring-amber-500/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                            title="Approved Leave / Institutional Exemption"
                          >
                            <Info className="w-3.5 h-3.5" /> Excused
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder="Optional remark..."
                          value={student.remarks || ''}
                          onChange={(e) => handleStudentRemarks(student.studentId, e.target.value)}
                          className="w-full px-2.5 py-1 bg-slate-50 border border-purple-100 rounded-lg text-xs text-slate-700 focus:bg-white focus:border-[#8A2A78] outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Submit Button */}
        {roster.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>
                Ready to commit session: <strong className="text-slate-800">{presentCount}</strong> Present,{' '}
                <strong className="text-slate-800">{absentCount}</strong> Absent,{' '}
                <strong className="text-slate-800">{excusedCount}</strong> Excused.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs shadow-md shadow-[#500071]/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-[#EEE3B0]" />
              <span>{saving ? 'Submitting...' : 'Save & Submit Attendance'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#500071] flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[#290044]">Confirm Attendance Submission</h3>
              <p className="text-xs text-slate-500">
                You are about to record attendance for <strong className="text-slate-700">{subjectDetails?.name}</strong> on{' '}
                <strong className="text-slate-700">{sessionDate}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-purple-100 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Total Enrolled:</span>
                <span className="font-bold">{roster.length}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Present Count:</span>
                <span className="font-bold">{presentCount}</span>
              </div>
              <div className="flex justify-between text-rose-700">
                <span>Absent Count:</span>
                <span className="font-bold">{absentCount}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Excused Count:</span>
                <span className="font-bold">{excusedCount}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              An institutional audit trail entry will be created and automated warnings will be sent to students with shortages.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] text-xs font-bold shadow-md hover:opacity-95 transition-all"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
