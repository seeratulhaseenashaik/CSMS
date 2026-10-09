import React, { useState, useEffect } from 'react';
import { getMyMembershipsApi } from '../services/api';
import { Users, Calendar, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyClubsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyMemberships();
  }, []);

  const fetchMyMemberships = async () => {
    try {
      const res = await getMyMembershipsApi();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load my memberships:', err);
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

  const memberships = data?.memberships || [];
  const upcomingEvents = data?.upcomingEvents || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Clubs Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Track your enrolled club memberships, application statuses, and upcoming events.</p>
      </div>

      {/* Memberships List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-slate-900 text-base">Club Memberships</h2>

        <div className="divide-y divide-slate-100">
          {memberships.map((m) => (
            <div key={m._id} className="py-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">{m.club?.name}</h3>
                  <span className="text-[11px] font-semibold text-blue-600">({m.role})</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{m.club?.category}</p>
                <p className="text-[11px] text-slate-400 mt-1">Applied: {new Date(m.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  m.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : m.status === 'pending'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  Status: {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
