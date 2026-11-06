import React, { useState, useEffect } from 'react';
import {
  getFacultyAnnouncementsApi,
  createFacultyAnnouncementApi
} from '../services/api';
import {
  Megaphone,
  Send,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  RefreshCw,
  Info
} from 'lucide-react';

export default function FacultyAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await getFacultyAnnouncementsApi();
      if (res.data?.success) {
        setAnnouncements(res.data.data?.announcements || []);
        setSubjects(res.data.data?.assignedSubjects || []);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setBroadcasting(true);
    setFeedback(null);

    try {
      const res = await createFacultyAnnouncementApi({
        title,
        message,
        subjectId: selectedSubjectId || undefined,
      });

      if (res.data?.success) {
        setFeedback({
          type: 'success',
          message: res.data.message || 'Announcement broadcast successfully!',
        });
        setTitle('');
        setMessage('');
        fetchAnnouncements();
      }
    } catch (err) {
      console.error('Error broadcasting announcement:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to dispatch class announcement.',
      });
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#500071]" />
            <h1 className="text-2xl font-black text-[#290044]">Announcements & Class Notices</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish syllabus notices, assignment deadlines, and view departmental circulars.
          </p>
        </div>

        <button
          onClick={fetchAnnouncements}
          className="px-4 py-2 rounded-xl bg-purple-50 text-[#500071] hover:bg-purple-100 text-xs font-bold transition-colors inline-flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
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

      {/* Broadcast Form */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-purple-50">
          <Send className="w-4 h-4 text-[#8A2A78]" />
          <h3 className="text-base font-black text-[#290044]">Broadcast a Class Announcement</h3>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. Midterm Examination Syllabus & Timetable Update..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Student Audience</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none"
              >
                <option value="">All My Assigned Subjects & Classes</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.code} - {s.name} (Sem {s.semester})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Details</label>
            <textarea
              rows={3}
              placeholder="Enter announcement instructions, links, or submission guidelines..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={broadcasting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs shadow-md shadow-[#500071]/25 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-[#EEE3B0]" />
              <span>{broadcasting ? 'Broadcasting...' : 'Broadcast to Enrolled Students'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed of Announcements */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-purple-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#500071]" />
            <h3 className="text-base font-black text-[#290044]">Recent Department & College Notices</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{announcements.length} notice(s)</span>
        </div>

        {announcements.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No notices published yet.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a._id}
                className="p-4 rounded-2xl border border-purple-100 bg-slate-50/60 hover:bg-purple-50/30 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xs font-bold text-slate-800">{a.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>
                <div className="pt-1 flex items-center gap-2 text-[10px] text-[#8A2A78] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-purple-100/70">
                    {a.type || 'Notice'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
