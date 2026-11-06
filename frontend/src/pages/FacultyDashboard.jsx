import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getFacultyDashboardApi } from '../services/api';
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await getFacultyDashboardApi();
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError('Failed to load faculty dashboard data.');
      }
    } catch (err) {
      console.error('Error fetching faculty dashboard:', err);
      setError('Unable to connect to the server. Please check your network connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-28 bg-purple-100/50 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-purple-50 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-purple-50 rounded-3xl" />
          <div className="h-80 bg-purple-50 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Dashboard Unavailable</h2>
        <p className="text-sm text-slate-500">{error}</p>
        <button
          onClick={() => fetchDashboard(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const summary = data?.summary || {
    totalSubjects: 0,
    totalSections: 0,
    totalStudentsTaught: 0,
    pendingTasksCount: 0,
    shortageStudentCount: 0,
  };

  const todaySchedule = data?.todaySchedule || { classes: [] };
  const pendingTasks = data?.pendingTasks || [];
  const assignedSubjects = data?.assignedSubjects || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#290044] via-[#500071] to-[#8A2A78] p-6 md:p-8 text-white shadow-xl shadow-[#290044]/15 border border-[#8A2A78]/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEE3B0]/15 border border-[#EEE3B0]/30 text-[#EEE3B0] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Faculty Academic Overview</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Welcome back, <span className="text-[#EEE3B0]">{user?.name || 'Professor'}</span>
            </h1>
            <p className="text-xs md:text-sm text-purple-200/90 max-w-2xl">
              Today is{' '}
              <span className="font-semibold text-[#EEE3B0]">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              . You are managing {summary.totalSubjects} assigned subject(s) across {summary.totalSections} academic class section(s).
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/faculty/attendance"
              className="px-4 py-2.5 rounded-xl bg-[#EEE3B0] text-[#290044] hover:bg-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4 text-[#500071]" />
              <span>Take Attendance</span>
            </Link>
            <Link
              to="/faculty/marks"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#EEE3B0] border border-[#EEE3B0]/30 text-xs font-bold transition-all flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4 text-[#EEE3B0]" />
              <span>Enter Marks</span>
            </Link>
            <button
              onClick={() => fetchDashboard(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#EEE3B0] border border-[#EEE3B0]/30 text-xs font-bold transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Decorative background glow circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#8A2A78]/30 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-56 h-56 rounded-full bg-[#EEE3B0]/10 blur-2xl pointer-events-none" />
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Subjects Handled */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Subjects Handled</p>
              <h3 className="text-3xl font-black text-[#290044] mt-1.5">{summary.totalSubjects}</h3>
              <p className="text-[11px] text-[#500071] font-medium mt-1">Assigned Department Courses</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#290044] to-[#500071] text-[#EEE3B0] flex items-center justify-center shadow-md shadow-[#290044]/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Active Scheme</span>
            <Link to="/faculty/subjects" className="text-[#8A2A78] font-bold hover:underline inline-flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 2: Assigned Classes / Sections */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Sections</p>
              <h3 className="text-3xl font-black text-[#290044] mt-1.5">{summary.totalSections}</h3>
              <p className="text-[11px] text-[#500071] font-medium mt-1">Class Cohorts & Labs</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#500071] to-[#8A2A78] text-[#EEE3B0] flex items-center justify-center shadow-md shadow-[#500071]/20 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Weekly Schedule</span>
            <Link to="/faculty/timetable" className="text-[#8A2A78] font-bold hover:underline inline-flex items-center gap-1">
              Timetable <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Total Students Taught (Distinct count) */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Students Taught</p>
              <h3 className="text-3xl font-black text-[#290044] mt-1.5">{summary.totalStudentsTaught}</h3>
              <p className="text-[11px] text-[#500071] font-medium mt-1">Distinct Enrolled Students</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8A2A78] to-[#500071] text-[#EEE3B0] flex items-center justify-center shadow-md shadow-[#8A2A78]/20 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Student Roster</span>
            <Link to="/faculty/students" className="text-[#8A2A78] font-bold hover:underline inline-flex items-center gap-1">
              Directory <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 4: Pending Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Tasks</p>
              <h3 className={`text-3xl font-black mt-1.5 ${summary.pendingTasksCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {summary.pendingTasksCount}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {summary.pendingTasksCount > 0 ? 'Requires Faculty Action' : 'All Tasks Completed'}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
              summary.pendingTasksCount > 0
                ? 'bg-amber-100 text-amber-700 shadow-amber-200'
                : 'bg-emerald-100 text-emerald-700 shadow-emerald-200'
            }`}>
              {summary.pendingTasksCount > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-50 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Shortage alerts: {summary.shortageStudentCount}</span>
            <Link to="/faculty/reports" className="text-[#8A2A78] font-bold hover:underline inline-flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Actionable Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-purple-50">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#500071]" />
                <h2 className="text-lg font-black text-[#290044]">Today's Academic Schedule</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {todaySchedule.day}, {todaySchedule.date}
              </p>
            </div>
            <Link
              to="/faculty/timetable"
              className="text-xs font-bold text-[#8A2A78] hover:text-[#500071] inline-flex items-center gap-1 bg-purple-50/80 px-3 py-1.5 rounded-xl border border-purple-100"
            >
              Full Weekly Timetable <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Schedule List */}
          {todaySchedule.classes && todaySchedule.classes.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.classes.map((lecture) => {
                const isUpcoming = lecture.status === 'upcoming';
                const isInProgress = lecture.status === 'in-progress';
                const isCompleted = lecture.status === 'completed';

                return (
                  <div
                    key={lecture.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isInProgress
                        ? 'bg-[#EEE3B0]/20 border-[#8A2A78] ring-1 ring-[#8A2A78]/30 shadow-sm'
                        : 'bg-slate-50/70 border-purple-100/70 hover:bg-purple-50/40'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#500071] text-[#EEE3B0] text-[11px] font-black tracking-wide">
                          {lecture.subject.code}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">{lecture.subject.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lecture.type === 'Laboratory'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-[#500071]'
                        }`}>
                          {lecture.type}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {lecture.classSection}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {lecture.room}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <div className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-purple-100 shadow-2xs">
                        {lecture.startTime} - {lecture.endTime}
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        isInProgress
                          ? 'bg-emerald-100 text-emerald-700 animate-pulse'
                          : isCompleted
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isInProgress ? '● In Progress' : lecture.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-purple-50/30 rounded-2xl border border-dashed border-purple-200 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 flex items-center justify-center text-[#500071]">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No Lectures Scheduled Today</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Enjoy your academic research day or office hours. Review your upcoming weekly lectures on the timetable.
                </p>
              </div>
              <Link
                to="/faculty/timetable"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#8A2A78] hover:underline"
              >
                View Full Weekly Timetable <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column: Pending Action Items */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#8A2A78]" />
              <h2 className="text-base font-black text-[#290044]">Pending Tasks</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#EEE3B0] text-[#290044]">
              {pendingTasks.length} Task(s)
            </span>
          </div>

          {pendingTasks.length > 0 ? (
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl border border-purple-100/80 bg-slate-50/50 hover:bg-purple-50/30 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800">{task.title}</h4>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      task.urgency === 'high'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {task.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{task.description}</p>
                  <div className="pt-1 flex items-center justify-end">
                    <Link
                      to={task.link}
                      className="text-xs font-bold text-[#500071] hover:text-[#8A2A78] inline-flex items-center gap-1 group"
                    >
                      Resolve Now <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">All Caught Up!</h4>
              <p className="text-[11px] text-slate-400">
                You have no pending attendance or marks entries waiting for submission.
              </p>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-purple-50 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Shortcuts</p>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <Link
                to="/faculty/reports"
                className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/70 text-[#500071] font-bold transition-colors flex flex-col items-center gap-1"
              >
                <BarChart3 className="w-4 h-4 text-[#8A2A78]" />
                <span>Reports</span>
              </Link>
              <Link
                to="/faculty/students"
                className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/70 text-[#500071] font-bold transition-colors flex flex-col items-center gap-1"
              >
                <Users className="w-4 h-4 text-[#8A2A78]" />
                <span>My Students</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Subjects Overview */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-[#290044]">My Assigned Courses & Scheme</h2>
            <p className="text-xs text-slate-500">
              Department curriculum subjects assigned to you for instruction and continuous assessment.
            </p>
          </div>
          <Link
            to="/faculty/subjects"
            className="text-xs font-bold text-[#8A2A78] hover:text-[#500071] inline-flex items-center gap-1"
          >
            Manage All Subjects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {assignedSubjects.map((subject) => (
            <div
              key={subject._id}
              className="p-4 rounded-2xl border border-purple-100 bg-gradient-to-b from-white to-purple-50/30 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-md bg-[#290044] text-[#EEE3B0] text-[11px] font-black">
                    {subject.code}
                  </span>
                  <span className="text-[10px] font-bold text-[#8A2A78] bg-[#8A2A78]/10 px-2 py-0.5 rounded-full">
                    Sem {subject.semester}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 leading-snug">{subject.name}</h4>
                <p className="text-[11px] text-slate-500">
                  {subject.department} • {subject.credits} Credits • {subject.subjectType}
                </p>
              </div>

              <div className="pt-2 border-t border-purple-50 flex items-center justify-between text-xs">
                <Link
                  to={`/faculty/attendance?subjectId=${subject._id}`}
                  className="font-bold text-[#500071] hover:text-[#8A2A78] inline-flex items-center gap-1"
                >
                  <CalendarCheck className="w-3.5 h-3.5" /> Attendance
                </Link>
                <Link
                  to={`/faculty/marks?subjectId=${subject._id}`}
                  className="font-bold text-[#8A2A78] hover:text-[#500071] inline-flex items-center gap-1"
                >
                  <ClipboardList className="w-3.5 h-3.5" /> Marks
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
