import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClubByIdApi, applyForClubApi, registerForEventApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, MapPin, ArrowLeft, CheckCircle2, Send, Clock } from 'lucide-react';

export default function ClubDetailPage() {
  const { clubId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appText, setAppText] = useState('I am enthusiastic about computer science and algorithm design.');
  const [appSubmitted, setAppSubmitted] = useState(false);
  const [appMessage, setAppMessage] = useState('');

  useEffect(() => {
    fetchClubDetail();
  }, [clubId]);

  const fetchClubDetail = async () => {
    try {
      const res = await getClubByIdApi(clubId);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load club details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const res = await applyForClubApi(clubId, { applicationText: appText });
      if (res.data.success) {
        setAppSubmitted(true);
        setAppMessage('Application submitted successfully! Status set to pending review.');
        fetchClubDetail();
      }
    } catch (err) {
      setAppMessage(err.response?.data?.message || 'Failed to submit application.');
    }
  };

  const handleEventRegister = async (eventId) => {
    try {
      const res = await registerForEventApi(eventId);
      if (res.data.success) {
        alert('Registered for event successfully!');
        fetchClubDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Event registration failed.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const club = data?.club || {};
  const events = data?.events || [];
  const membership = data?.userMembership;

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <Link to="/clubs" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Clubs Directory</span>
      </Link>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
            {club.category}
          </span>
          {membership && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              membership.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Membership Status: {membership.status}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">{club.name}</h1>
        <p className="text-sm text-slate-600 leading-relaxed">{club.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div>
            <span className="font-semibold text-slate-800">Faculty Coordinator:</span>
            <p>{club.facultyCoordinator?.name || 'Prof. Sarah Jenkins'}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-800">Meeting Schedule:</span>
            <p>{club.meetingSchedule}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-800">Location:</span>
            <p>{club.location}</p>
          </div>
        </div>
      </div>

      {/* Application Section */}
      {user?.role === 'student' && !membership && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Apply for Membership</h3>
          <p className="text-xs text-slate-600">Eligibility: {club.eligibilityRules}</p>

          {appMessage && (
            <div className="p-3 rounded-xl bg-white border border-blue-200 text-xs text-blue-800 font-semibold">
              {appMessage}
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-3">
            <textarea
              rows="3"
              required
              value={appText}
              onChange={(e) => setAppText(e.target.value)}
              placeholder="Why do you want to join this club?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs outline-none bg-white"
            ></textarea>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20"
            >
              Submit Membership Application
            </button>
          </form>
        </div>
      )}

      {/* Upcoming Events */}
      <div className="space-y-4">
        <h2 className="font-bold text-slate-900 text-lg">Upcoming Club Events & Workshops</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => (
            <div key={evt._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base">{evt.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>
              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(evt.eventDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evt.location}</span>
              </div>
              <button
                onClick={() => handleEventRegister(evt._id)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-semibold text-xs transition-colors"
              >
                Register for Event
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
