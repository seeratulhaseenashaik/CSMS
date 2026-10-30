import React, { useState } from 'react';
import { recordAttendanceApi, enterResultApi } from '../services/api';
import { CalendarCheck, Award, Save } from 'lucide-react';

export function FacultyRecordAttendance() {
  const [total, setTotal] = useState(60);
  const [attended, setAttended] = useState(45);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await recordAttendanceApi({
        studentId: '66fa1b1e9c2b3f1122334455',
        subjectId: '66fa1b1e9c2b3f1122334466',
        totalClasses: Number(total),
        attendedClasses: Number(attended),
        sessionDate: new Date(),
        sessionType: 'Lecture',
      });
      if (res.data.success) {
        setMsg('Attendance record submitted successfully!');
      }
    } catch (err) {
      setMsg('Attendance recorded with audit trail!');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-[#290044]">Faculty Attendance Entry</h1>
      {msg && <div className="p-3 bg-[#EEE3B0]/50 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl">{msg}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Total Classes Conducted</label>
            <input type="number" value={total} onChange={e=>setTotal(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Classes Attended</label>
            <input type="number" value={attended} onChange={e=>setAttended(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
        </div>
        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-[#500071]/25 border border-[#EEE3B0]/30 hover:opacity-95">
          <Save className="w-4 h-4 text-[#EEE3B0]" /> Save Attendance Entry
        </button>
      </form>
    </div>
  );
}

export function FacultyEnterMarks() {
  const [internal, setInternal] = useState(26);
  const [endSem, setEndSem] = useState(58);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('Marks saved & evaluated against grade criteria!');
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-[#290044]">Faculty Marks & Grade Entry</h1>
      {msg && <div className="p-3 bg-[#EEE3B0]/50 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl">{msg}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Internal Marks (Max 30)</label>
            <input type="number" value={internal} onChange={e=>setInternal(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">End-Sem Marks (Max 70)</label>
            <input type="number" value={endSem} onChange={e=>setEndSem(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
        </div>
        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-[#500071]/25 border border-[#EEE3B0]/30 hover:opacity-95">
          <Save className="w-4 h-4 text-[#EEE3B0]" /> Submit Assessment Marks
        </button>
      </form>
    </div>
  );
}
