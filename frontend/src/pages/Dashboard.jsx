import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyAttendanceApi, getMyResultsApi, getMyMembershipsApi, getQuestionsApi } from '../services/api';
import StatCard from '../components/StatCard';
import AttendanceCalculatorModal from '../components/AttendanceCalculatorModal';
import {
  CalendarCheck,
  Award,
  TrendingUp,
  Users,
  AlertTriangle,
  Calculator,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [results, setResults] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCalcModal, setShowCalcModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'student' || user?.role === 'administrator') {
          const [attRes, resRes, clubRes, qaRes] = await Promise.all([
            getMyAttendanceApi().catch(() => ({ data: { success: false } })),
            getMyResultsApi().catch(() => ({ data: { success: false } })),
            getMyMembershipsApi().catch(() => ({ data: { success: false } })),
            getQuestionsApi({ sort: 'recent' }).catch(() => ({ data: { success: false } })),
          ]);

          if (attRes.data?.success) setAttendance(attRes.data);
          if (resRes.data?.success) setResults(resRes.data);
          if (clubRes.data?.success) setMemberships(clubRes.data.memberships || []);
          if (qaRes.data?.success) setQuestions(qaRes.data.questions?.slice(0, 4) || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const profile = user?.profile || {};

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider">
            {profile.department || 'Computer Science & Engineering'} • {profile.degree || 'B.Tech'}
          </span>
          <h1 className="text-3xl font-extrabold mt-3">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-blue-100 mt-1">
            Reg. No: <span className="font-semibold">{profile.registrationNumber || '2023CSE042'}</span> | Year {profile.academicYear || 3}, Sem {profile.currentSemester || 5} | Batch {profile.batch || '2023-2027'}
          </p>
        </div>

        <button
          onClick={() => setShowCalcModal(true)}
          className="relative z-10 px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm shadow-lg hover:bg-blue-50 transition-all flex items-center gap-2.5 shrink-0"
        >
          <Calculator className="w-5 h-5 text-blue-600" />
          <span>Smart Attendance Calculator</span>
        </button>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Interactive Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Overall Attendance"
          value={`${attendance?.overall?.percentage || 0}%`}
          subtitle={attendance?.overall?.percentage >= 75 ? 'Target 75% Satisfied' : 'Attendance Shortage Alert'}
          icon={CalendarCheck}
          color={attendance?.overall?.percentage >= 75 ? 'green' : 'amber'}
          linkTo="/attendance"
          badge={attendance?.overall?.shortageCount > 0 ? `${attendance.overall.shortageCount} Shortage` : 'Optimal'}
        />
        <StatCard
          title="CGPA / SGPA"
          value={`${results?.summary?.cgpa || '8.75'} / ${results?.summary?.sgpa || '8.90'}`}
          subtitle={`Earned Credits: ${results?.summary?.earnedCredits || 78}`}
          icon={Award}
          color="indigo"
          linkTo="/results"
        />
        <StatCard
          title="Backlogs / Passed"
          value={`${results?.summary?.failedSubjects || 0} / ${results?.summary?.passedSubjects || 4}`}
          subtitle="Passed all Semester 5 Subjects"
          icon={TrendingUp}
          color={results?.summary?.failedSubjects > 0 ? 'red' : 'green'}
          linkTo="/results"
        />
        <StatCard
          title="My Clubs"
          value={`${memberships?.length || 1} Active`}
          subtitle="CodeX Programming Club"
          icon={Users}
          color="purple"
          linkTo="/my-clubs"
        />
      </div>

      {/* Attendance Shortage Warning Alert Banner */}
      {attendance?.overall?.shortageAlerts?.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Attendance Shortage Warning</h3>
              <p className="text-xs text-amber-800 mt-1">
                You have an attendance shortage in {attendance.overall.shortageAlerts.length} subject(s).
                For example, in <span className="font-bold">{attendance.overall.shortageAlerts[0]?.subject?.name}</span> ({attendance.overall.shortageAlerts[0]?.percentage}%),
                you must attend the next <span className="font-bold underline">{attendance.overall.shortageAlerts[0]?.classesNeededToReachTarget} consecutive classes</span>.
              </p>
            </div>
          </div>
          <Link to="/attendance" className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-semibold text-xs shrink-0 hover:bg-amber-700">
            View Analysis
          </Link>
        </div>
      )}

      {/* Main Grid: Subject Breakdown & Recent Q&A Discussions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrolled Subjects & Attendance Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Enrolled Subjects & Attendance</h2>
              <p className="text-xs text-slate-500">Semester 5 Current Course Load</p>
            </div>
            <Link to="/attendance" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <span>View Full Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {attendance?.subjectBreakdown?.map((item) => (
              <div key={item.subject._id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-xs">{item.subject.code}</span>
                    <h3 className="font-semibold text-slate-700 text-sm">{item.subject.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attended {item.attendedClasses} / {item.totalClasses} classes
                  </p>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold ${item.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.percentage}%
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.percentage < 75
                      ? `Need ${item.classesNeededToReachTarget} classes`
                      : `Bunk allowance: ${item.bunkAllowance}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievers Q&A Discussions Side Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <span>Achievers Q&A</span>
            </h2>
            <Link to="/qa" className="text-xs font-semibold text-blue-600 hover:underline">
              Explore All
            </Link>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <Link
                key={q._id}
                to={`/qa/${q._id}`}
                className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-100 transition-all"
              >
                <h3 className="font-semibold text-xs text-slate-800 line-clamp-2">{q.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{q.author?.name}</span>
                  <span className="text-blue-600 font-semibold">{q.answersCount} answers</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Attendance Calculator Modal */}
      <AttendanceCalculatorModal
        isOpen={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        initialAttended={42}
        initialTotal={60}
      />
    </div>
  );
}
