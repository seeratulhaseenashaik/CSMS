import React, { useState, useEffect } from 'react';
import { getMyAttendanceApi } from '../services/api';
import AttendanceCalculatorModal from '../components/AttendanceCalculatorModal';
import { CalendarCheck, AlertTriangle, CheckCircle2, Calculator, Info, Search } from 'lucide-react';

export default function AttendancePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await getMyAttendanceApi(0.75);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overall = data?.overall || {};
  const breakdown = data?.subjectBreakdown || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Management & Analysis</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time attendance tracking, 75% threshold recovery calculator, and bunk allowance analysis.</p>
        </div>
        <button
          onClick={() => {
            setSelectedSub(null);
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          <span>Open Smart Calculator</span>
        </button>
      </div>

      {/* Overall Attendance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Overall Percentage</p>
          <h2 className={`text-3xl font-bold mt-1 ${overall.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {overall.percentage}%
          </h2>
          <p className="text-xs text-slate-400 mt-1">Target threshold: 75.0%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Classes Conducted</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">{overall.totalClasses}</h2>
          <p className="text-xs text-slate-400 mt-1">Attended: {overall.attendedClasses} | Missed: {overall.missedClasses}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Recovery Classes Needed</p>
          <h2 className="text-3xl font-bold text-amber-600 mt-1">{overall.classesNeededToReachTarget}</h2>
          <p className="text-xs text-slate-400 mt-1">Consecutive future classes without missing</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Permitted Absences</p>
          <h2 className="text-3xl font-bold text-indigo-600 mt-1">{overall.bunkAllowance}</h2>
          <p className="text-xs text-slate-400 mt-1">Bunk allowance before falling below 75%</p>
        </div>
      </div>

      {/* Subject-Wise Attendance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Subject-Wise Attendance Breakdown</h2>
          <span className="text-xs text-slate-500 font-medium">Minimum Required: 75.0%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Conducted</th>
                <th className="px-6 py-4">Attended</th>
                <th className="px-6 py-4">Missed</th>
                <th className="px-6 py-4">Attendance %</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Recovery / Bunk Allowance</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown.map((item) => (
                <tr key={item.subject._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.subject.name}</div>
                    <div className="text-[11px] text-slate-400">{item.subject.code} • {item.subject.subjectType}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{item.totalClasses}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-700">{item.attendedClasses}</td>
                  <td className="px-6 py-4 font-semibold text-rose-700">{item.missedClasses}</td>
                  <td className="px-6 py-4">
                    <span className={`font-extrabold text-sm ${item.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {item.percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      item.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.percentage < 75 ? (
                      <span className="text-rose-700 font-semibold">
                        Must attend next <strong className="underline text-sm">{item.classesNeededToReachTarget}</strong> classes
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        Can miss up to <strong className="underline text-sm">{item.bunkAllowance}</strong> classes
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedSub(item);
                        setShowModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Calculate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Smart Attendance Calculator Modal */}
      <AttendanceCalculatorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialAttended={selectedSub ? selectedSub.attendedClasses : overall.attendedClasses}
        initialTotal={selectedSub ? selectedSub.totalClasses : overall.totalClasses}
      />
    </div>
  );
}
