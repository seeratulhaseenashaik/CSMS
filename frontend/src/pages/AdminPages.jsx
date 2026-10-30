import React, { useState, useEffect } from 'react';
import { getUsersApi, getPromotionRulesApi, createPromotionRuleApi, publishAnnouncementApi, getAdminDashboardApi } from '../services/api';
import { Users, Shield, Bell, TrendingUp, CheckCircle2, Plus } from 'lucide-react';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsersApi().then(res => {
      if (res.data.success) setUsers(res.data.users);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-black text-[#290044]">User Management Directory</h1>
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#290044]/5 border-b border-purple-100 text-[#290044] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-purple-50/40">
                <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4 capitalize font-bold text-[#8A2A78]">{u.role.replace('_', ' ')}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#EEE3B0] text-[#290044] border border-[#cbaf6a]/50">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminPromotionRules() {
  const [rules, setRules] = useState([]);
  const [batch, setBatch] = useState('2023-2027');
  const [dept, setDept] = useState('CSE');
  const [minRatio, setMinRatio] = useState(0.75);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const res = await getPromotionRulesApi();
    if (res.data.success) setRules(res.data.rules);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    const res = await createPromotionRuleApi({
      batch,
      department: dept,
      fromYear: 3,
      toYear: 4,
      minPassedSubjectsRatio: minRatio,
      minEarnedCredits: 60,
      maxPermittedBacklogs: 2,
    });
    if (res.data.success) {
      setMsg('Promotion Rule configured successfully!');
      fetchRules();
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-[#290044]">Configure Academic Promotion Rules</h1>

      {msg && <div className="p-3 bg-[#EEE3B0]/50 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl">{msg}</div>}

      <form onSubmit={handleSaveRule} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Batch</label>
            <input type="text" value={batch} onChange={e=>setBatch(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Department</label>
            <input type="text" value={dept} onChange={e=>setDept(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Min Passed Ratio (0.75 = 75%)</label>
            <input type="number" step="0.05" value={minRatio} onChange={e=>setMinRatio(Number(e.target.value))} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
        </div>
        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl shadow-md shadow-[#500071]/25 border border-[#EEE3B0]/30 hover:opacity-95">
          Save Promotion Rule
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 space-y-3">
        <h3 className="font-bold text-[#290044] text-sm">Active Rules</h3>
        {rules.map(r => (
          <div key={r._id} className="p-3.5 bg-purple-50/40 rounded-xl text-xs flex justify-between border border-purple-100">
            <span>Batch {r.batch} ({r.department}) Year {r.fromYear} → {r.toYear}</span>
            <span className="font-bold text-[#500071]">Min Pass: {(r.minPassedSubjectsRatio*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState('');

  const handlePublish = async (e) => {
    e.preventDefault();
    const res = await publishAnnouncementApi({ title, message });
    if (res.data.success) {
      setMsg(res.data.message);
      setTitle('');
      setMessage('');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-[#290044]">Publish Official Announcement</h1>
      {msg && <div className="p-3 bg-[#EEE3B0]/50 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl">{msg}</div>}
      <form onSubmit={handlePublish} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Notice Title</label>
          <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Message Content</label>
          <textarea rows="4" required value={message} onChange={e=>setMessage(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl shadow-md shadow-[#500071]/25 border border-[#EEE3B0]/30 hover:opacity-95">
          Publish to All Users
        </button>
      </form>
    </div>
  );
}
