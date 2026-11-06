import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getFacultyMarksApi, saveBulkMarksApi } from '../services/api';
import {
  ClipboardList,
  Save,
  CheckCircle2,
  AlertTriangle,
  Send,
  Users,
  Search,
  RefreshCw,
  Award,
  BookOpen,
  Info
} from 'lucide-react';

export default function FacultyMarks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSubjectId = searchParams.get('subjectId');

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(urlSubjectId || '');
  const [semester, setSemester] = useState(5);
  const [academicYear, setAcademicYear] = useState('2025-2026');

  const [subjectDetails, setSubjectDetails] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    publishedCount: 0,
    passedCount: 0,
    failedCount: 0,
    pendingCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Load subject marks
  const loadMarks = async (subjId, sem) => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await getFacultyMarksApi({
        subjectId: subjId,
        semester: sem,
      });

      if (res.data?.success) {
        const d = res.data.data;
        setSubjects(d.subjects || []);
        setSubjectDetails(d.subject);
        setStudents(d.students || []);
        setStats(d.stats || {});
        if (!subjId && d.subject?._id) {
          setSelectedSubjectId(d.subject._id);
        }
        if (d.subject?.semester) {
          setSemester(d.subject.semester);
        }
      }
    } catch (err) {
      console.error('Error loading marks data:', err);
      setFeedback({
        type: 'error',
        message: 'Unable to load student marks. Please verify your faculty subject assignment.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarks(selectedSubjectId, semester);
  }, [selectedSubjectId, semester]);

  // Handle live mark input with instant grade recalculation
  const handleMarkChange = (studentId, field, value) => {
    const numVal = Math.max(0, Number(value) || 0);

    setStudents((prev) =>
      prev.map((st) => {
        if (st.studentId !== studentId) return st;

        const updated = { ...st, [field]: numVal };

        // Max bounds from subject rules
        const maxInt = subjectDetails?.internalMaxMarks || 30;
        const maxEnd = subjectDetails?.endSemMaxMarks || 70;
        const minPassInt = subjectDetails?.internalMinPassingMarks || 12;
        const minPassEnd = subjectDetails?.endSemMinPassingMarks || 28;
        const minPassTotal = subjectDetails?.minPassingMarks || 40;

        if (field === 'internalMarks' && numVal > maxInt) {
          updated.internalMarks = maxInt;
        }
        if (field === 'endSemMarks' && numVal > maxEnd) {
          updated.endSemMarks = maxEnd;
        }

        const total = (updated.internalMarks || 0) + (updated.midtermMarks || 0) + (updated.practicalMarks || 0) + (updated.endSemMarks || 0);
        updated.totalMarks = total;

        // Instant letter grade & points
        let grade = 'F';
        let gradePoints = 0;
        if (total >= 90) { grade = 'O'; gradePoints = 10; }
        else if (total >= 80) { grade = 'A+'; gradePoints = 9; }
        else if (total >= 70) { grade = 'A'; gradePoints = 8; }
        else if (total >= 60) { grade = 'B+'; gradePoints = 7; }
        else if (total >= 50) { grade = 'B'; gradePoints = 6; }
        else if (total >= 40) { grade = 'C'; gradePoints = 5; }

        const isPassed =
          updated.internalMarks >= minPassInt &&
          updated.endSemMarks >= minPassEnd &&
          total >= minPassTotal;

        updated.grade = isPassed ? grade : 'F';
        updated.gradePoints = isPassed ? gradePoints : 0;
        updated.status = isPassed ? 'PASS' : 'FAIL';

        return updated;
      })
    );
  };

  // Submit marks (draft or publish)
  const handleSubmitMarks = async (isPublished = false) => {
    setShowPublishModal(false);
    setSaving(true);
    setFeedback(null);

    try {
      const payload = {
        subjectId: selectedSubjectId,
        semester,
        academicYear,
        isPublished,
        marksList: students.map((s) => ({
          studentId: s.studentId,
          internalMarks: s.internalMarks,
          midtermMarks: s.midtermMarks,
          practicalMarks: s.practicalMarks,
          endSemMarks: s.endSemMarks,
        })),
      };

      const res = await saveBulkMarksApi(payload);
      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Marks saved and evaluated against institutional grading criteria!',
        });
        loadMarks(selectedSubjectId, semester);
      }
    } catch (err) {
      console.error('Error saving marks:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error saving marks. Please check input limits.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter students by search
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#8A2A78]" />
            <h1 className="text-2xl font-black text-[#290044]">Marks & Assessments</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enter continuous evaluations, internal assessments, and end-sem marks with automated SGPA/grading calculations.
          </p>
        </div>

        {/* Top Summary Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-[#500071]">
            <span className="font-semibold text-slate-500">Evaluated: </span>
            <strong className="font-bold">{students.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
            <span className="font-semibold text-slate-500">Published: </span>
            <strong className="font-bold">{stats.publishedCount || 0}</strong>
          </div>
        </div>
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

      {/* Subject & Semester Selector */}
      <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSearchParams({ subjectId: e.target.value });
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.code} - {sub.name} ({sub.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Academic Session</label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none"
            />
          </div>
        </div>

        {/* Assessment Rules Pill */}
        {subjectDetails && (
          <div className="pt-3 border-t border-purple-50 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="font-bold text-[#500071] flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Scheme Thresholds:
            </span>
            <span className="bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
              Internal: Max {subjectDetails.internalMaxMarks || 30} (Passing: {subjectDetails.internalMinPassingMarks || 12})
            </span>
            <span className="bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
              End-Sem: Max {subjectDetails.endSemMaxMarks || 70} (Passing: {subjectDetails.endSemMinPassingMarks || 28})
            </span>
            <span className="bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 font-bold text-[#290044]">
              Total Passing: {subjectDetails.minPassingMarks || 40} / {subjectDetails.maxMarks || 100}
            </span>
          </div>
        )}
      </div>

      {/* Search Bar */}
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
          Showing {filteredStudents.length} of {students.length} student scorecard(s)
        </p>
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#500071] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading student scorecards...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Enrolled Students</h4>
            <p className="text-xs text-slate-400">No students are currently enrolled in this subject.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#290044] to-[#500071] text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Internal ({subjectDetails?.internalMaxMarks || 30})</th>
                  <th className="py-3.5 px-4">Midterm (20)</th>
                  <th className="py-3.5 px-4">End-Sem ({subjectDetails?.endSemMaxMarks || 70})</th>
                  <th className="py-3.5 px-4 text-center">Total (100)</th>
                  <th className="py-3.5 px-4 text-center">Grade</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Publication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-xs text-slate-700">
                {filteredStudents.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{student.name}</p>
                      <p className="text-[11px] text-[#500071] font-mono">{student.registrationNumber}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        min="0"
                        max={subjectDetails?.internalMaxMarks || 30}
                        value={student.internalMarks ?? 0}
                        onChange={(e) => handleMarkChange(student.studentId, 'internalMarks', e.target.value)}
                        className="w-20 px-2.5 py-1 bg-slate-50 border border-purple-100 rounded-lg text-xs font-semibold text-center focus:bg-white focus:border-[#8A2A78] outline-none"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={student.midtermMarks ?? 0}
                        onChange={(e) => handleMarkChange(student.studentId, 'midtermMarks', e.target.value)}
                        className="w-20 px-2.5 py-1 bg-slate-50 border border-purple-100 rounded-lg text-xs font-semibold text-center focus:bg-white focus:border-[#8A2A78] outline-none"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        min="0"
                        max={subjectDetails?.endSemMaxMarks || 70}
                        value={student.endSemMarks ?? 0}
                        onChange={(e) => handleMarkChange(student.studentId, 'endSemMarks', e.target.value)}
                        className="w-20 px-2.5 py-1 bg-slate-50 border border-purple-100 rounded-lg text-xs font-semibold text-center focus:bg-white focus:border-[#8A2A78] outline-none"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 text-sm">
                      {student.totalMarks}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-[#500071] font-black text-xs">
                        {student.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          student.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : student.status === 'FAIL'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {student.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          Draft
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Controls Bar */}
        {students.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Award className="w-4 h-4 text-[#8A2A78]" />
              <span>
                Ready to commit {students.length} student marks. Saving as draft preserves work without making it visible to students.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmitMarks(false)}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 text-[#500071] font-bold text-xs shadow-2xs transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPublishModal(true)}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs shadow-md shadow-[#500071]/25 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-[#EEE3B0]" />
                <span>Publish Results</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Result Publication */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-[#290044]">Publish Academic Results</h3>
              <p className="text-xs text-slate-500">
                You are about to publish continuous and final assessment results for{' '}
                <strong className="text-slate-700">{subjectDetails?.name}</strong>.
              </p>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Important Notice:
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Publishing will finalize these grades on the student scorecards, recalculate SGPAs, and notify all enrolled students.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmitMarks(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] text-xs font-bold shadow-md hover:opacity-95 transition-all"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
