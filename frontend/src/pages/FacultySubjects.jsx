import React, { useState, useEffect } from 'react';
import { getFacultySubjectsApi } from '../services/api';
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Users,
  Award,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFacultySubjectsApi();
      if (res.data?.success) {
        setSubjects(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to fetch assigned subjects from the university registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#500071]" />
            <h1 className="text-2xl font-black text-[#290044]">My Subjects & Classes</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Curriculum subjects and lecture cohorts assigned to your department teaching profile.
          </p>
        </div>

        <button
          onClick={fetchSubjects}
          className="px-4 py-2 rounded-xl bg-purple-50 text-[#500071] hover:bg-purple-100 text-xs font-bold transition-colors inline-flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#500071] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading assigned courses...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl border border-rose-200">
          <p className="text-xs font-bold">{error}</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 space-y-2">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No Assigned Subjects Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no course subjects allocated for this academic semester.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#290044] to-[#500071] text-[#EEE3B0] text-xs font-black tracking-wider">
                    {sub.code}
                  </span>
                  <span className="text-[11px] font-bold text-[#8A2A78] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                    Sem {sub.semester} • {sub.credits} Credits
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-800 leading-snug">{sub.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Department of {sub.department} • {sub.subjectType}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-purple-50/50 rounded-2xl border border-purple-100/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Enrolled</span>
                    <p className="font-black text-[#290044] text-sm mt-0.5">{sub.enrolledCount}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Attend</span>
                    <p className="font-black text-emerald-700 text-sm mt-0.5">{sub.avgAttendance}%</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Pass Rate</span>
                    <p className="font-black text-[#8A2A78] text-sm mt-0.5">{sub.passRate}%</p>
                  </div>
                </div>

                {/* Scheme Thresholds */}
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Internal Marks:</span>
                    <span className="font-bold text-slate-700">Max {sub.internalMaxMarks || 30} (Min {sub.internalMinPassingMarks || 12})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>End-Sem Marks:</span>
                    <span className="font-bold text-slate-700">Max {sub.endSemMaxMarks || 70} (Min {sub.endSemMinPassingMarks || 28})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions Logged:</span>
                    <span className="font-bold text-slate-700">{sub.totalSessionsLogged} recorded</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-purple-50 grid grid-cols-2 gap-2 text-xs">
                <Link
                  to={`/faculty/attendance?subjectId=${sub._id}`}
                  className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-[#500071] text-[#500071] hover:text-[#EEE3B0] font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" /> Attendance
                </Link>
                <Link
                  to={`/faculty/marks?subjectId=${sub._id}`}
                  className="px-3 py-2 rounded-xl bg-[#8A2A78]/10 hover:bg-[#8A2A78] text-[#8A2A78] hover:text-[#EEE3B0] font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <ClipboardList className="w-3.5 h-3.5" /> Marks
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
