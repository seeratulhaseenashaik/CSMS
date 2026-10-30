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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#500071]"></div>
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
          <h1 className="text-2xl font-black text-[#290044]">Attendance Management & Analysis</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time attendance tracking, 75% threshold recovery calculator, and bunk allowance analysis.</p>
        </div>
        <button
          onClick={() => {
            setSelectedSub(null);
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] hover:opacity-95 text-[#EEE3B0] font-bold text-xs shadow-md shadow-[#500071]/25 transition-all flex items-center gap-2 border border-[#EEE3B0]/30"
        >
          <Calculator className="w-4 h-4 text-[#EEE3B0]" />
          <span>Open Smart Calculator</span>
        </button>
      </div>

      {/* Overall Attendance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Overall Percentage</p>
          <h2 className={`text-3xl font-black mt-1 ${overall.percentage >= 75 ? 'text-emerald-600' : 'text-[#8A2A78]'}`}>
            {overall.percentage}%
          </h2>
          <p className="text-xs text-slate-400 mt-1">Target threshold: 75.0%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Classes Conducted</p>
          <h2 className="text-3xl font-black text-[#290044] mt-1">{overall.totalClasses}</h2>
          <p className="text-xs text-slate-400 mt-1">Attended: {overall.attendedClasses} | Missed: {overall.missedClasses}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Recovery Classes Needed</p>
          <h2 className="text-3xl font-black text-[#8A2A78] mt-1">{overall.classesNeededToReachTarget}</h2>
          <p className="text-xs text-slate-400 mt-1">Consecutive future classes without missing</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Permitted Absences</p>
          <h2 className="text-3xl font-black text-[#500071] mt-1">{overall.bunkAllowance}</h2>
          <p className="text-xs text-slate-400 mt-1">Bunk allowance before falling below 75%</p>
        </div>
      </div>

      {/* Subject-Wise Attendance Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-purple-50 flex items-center justify-between">
          <h2 className="font-bold text-[#290044] text-base">Subject-Wise Attendance Breakdown</h2>
          <span className="text-xs font-bold text-[#500071] bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            Minimum Required: 75.0%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#290044]/5 border-b border-purple-100 text-[#290044] font-bold uppercase tracking-wider">
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
            <tbody className="divide-y divide-purple-50">
              {breakdown.map((item) => (
                <tr key={item.subject._id} className="hover:bg-purple-50/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.subject.name}</div>
                    <div className="text-[11px] text-[#500071] font-semibold">{item.subject.code} • {item.subject.subjectType}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{item.totalClasses}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-700">{item.attendedClasses}</td>
                  <td className="px-6 py-4 font-semibold text-rose-700">{item.missedClasses}</td>
                  <td className="px-6 py-4">
                    <span className={`font-black text-sm ${item.percentage >= 75 ? 'text-emerald-600' : 'text-[#8A2A78]'}`}>
                      {item.percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      item.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-[#8A2A78]/15 text-[#8A2A78]'
                    }`}>
                      {item.status?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {item.percentage < 75 ? (
                      <span className="text-[#8A2A78] font-bold">
                        Must attend next <strong className="underline text-sm">{item.classesNeededToReachTarget}</strong> classes
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold">
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
                      className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-[#500071] text-[#290044] hover:text-[#EEE3B0] font-bold transition-all border border-purple-200"
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
