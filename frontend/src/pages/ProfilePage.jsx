import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfileApi } from '../services/api';
import { User, Phone, Mail, Award, CheckCircle2, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await updateProfileApi({ name, phone, bio });
      if (res.data.success) {
        setUser(res.data.user);
        setMsg('Profile details updated successfully!');
      }
    } catch (err) {
      setMsg('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const profile = user?.profile || {};

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#290044]">User Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage personal information and academic bio details.</p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-purple-100 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-purple-50 pb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-black text-2xl flex items-center justify-center shadow-lg shadow-[#500071]/25 border border-[#EEE3B0]/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#290044]">{user?.name}</h2>
            <p className="text-xs text-[#8A2A78] font-semibold capitalize mt-0.5">{user?.role?.replace('_', ' ')} • {user?.email}</p>
          </div>
        </div>

        {msg && (
          <div className="p-3.5 rounded-xl bg-[#EEE3B0]/40 text-[#290044] text-xs font-bold border border-[#cbaf6a]/50">
            {msg}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs outline-none focus:border-[#8A2A78]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs outline-none focus:border-[#8A2A78]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Bio / Areas of Interest</label>
            <textarea
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 text-xs outline-none focus:border-[#8A2A78]"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] hover:opacity-95 text-[#EEE3B0] font-bold text-xs shadow-md shadow-[#500071]/25 flex items-center gap-2 border border-[#EEE3B0]/30"
          >
            <Save className="w-4 h-4 text-[#EEE3B0]" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
