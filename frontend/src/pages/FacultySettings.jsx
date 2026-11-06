import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getFacultyProfileApi,
  updateFacultyProfileApi,
  updateProfileApi
} from '../services/api';
import {
  Settings,
  User,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Briefcase,
  Building,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  BookOpen
} from 'lucide-react';

export default function FacultySettings() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [officeHours, setOfficeHours] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdFeedback, setPwdFeedback] = useState(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getFacultyProfileApi();
      if (res.data?.success) {
        const d = res.data.data;
        setProfileData(d);
        setPhone(d.user?.phone || '');
        setBio(d.user?.bio || '');
        setOfficeHours(d.profile?.officeHours || '');
      }
    } catch (err) {
      console.error('Error fetching faculty profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await updateFacultyProfileApi({
        phone,
        bio,
        officeHours,
      });

      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: 'Permitted profile contact details updated successfully!',
        });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdFeedback(null);

    if (newPassword !== confirmPassword) {
      setPwdFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPwdFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setPwdSaving(true);
    try {
      const res = await updateProfileApi({
        password: newPassword,
      });

      if (res.data?.success) {
        setPwdFeedback({ type: 'success', message: 'Password updated successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setPwdFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#500071] animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading faculty settings & verified credentials...</p>
      </div>
    );
  }

  const u = profileData?.user || user;
  const p = profileData?.profile || {};
  const assigned = profileData?.assignedSubjects || [];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#500071]" />
          <h1 className="text-2xl font-black text-[#290044]">Faculty Profile & Settings</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Review academic appointments, institutional designations, and update authorized contact preferences.
        </p>
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

      {/* Institutional Credentials (Protected Read-Only Section) */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-purple-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8A2A78]" />
            <h3 className="text-base font-black text-[#290044]">Official Institutional Records</h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
            <Lock className="w-3 h-3" /> Registrar Protected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Faculty Full Name</span>
            <p className="font-bold text-slate-800 text-sm">{u?.name}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Employee / Faculty ID</span>
            <p className="font-mono font-bold text-[#500071] text-sm">{p?.employeeId || 'FAC001'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Official Institutional Email</span>
            <p className="font-semibold text-slate-800 text-xs truncate">{u?.email}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Department</span>
            <p className="font-bold text-slate-800">{p?.department || 'Computer Science & Engineering'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Academic Designation</span>
            <p className="font-bold text-[#8A2A78]">{p?.designation || 'Associate Professor'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-purple-100/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Subjects</span>
            <p className="font-bold text-slate-800">{assigned.length} Active Courses</p>
          </div>
        </div>
      </div>

      {/* Editable Permitted Contact & Office Settings */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#290044] pb-2 border-b border-purple-50">
          Editable Contact Preferences & Office Hours
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#500071]" /> Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0142"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#500071]" /> Office Hours / Location
              </label>
              <input
                type="text"
                value={officeHours}
                onChange={(e) => setOfficeHours(e.target.value)}
                placeholder="Mon/Wed/Fri 2:00 PM - 4:00 PM (Room CS-301)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#500071]" /> Academic Bio / Research Interests
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Share your academic specialization, research group, and courses lead..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs shadow-md shadow-[#500071]/25 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#EEE3B0]" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password & Security Settings */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#290044] pb-2 border-b border-purple-50 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#8A2A78]" /> Security & Password
        </h3>

        {pwdFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold ${
              pwdFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {pwdFeedback.message}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={pwdSaving}
            className="px-5 py-2.5 bg-[#290044] hover:bg-[#500071] text-[#EEE3B0] text-xs font-bold rounded-xl transition-colors"
          >
            {pwdSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
