import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, CheckCircle2, AlertTriangle, Info, BookOpen } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#290044]">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">In-app notifications for attendance, academic results, club updates, and official notices.</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-[#500071] text-[#500071] hover:text-[#EEE3B0] font-bold text-xs transition-colors border border-purple-200"
        >
          Mark All as Read
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm divide-y divide-purple-50 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No notifications found</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => markAsRead(n._id)}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !n.isRead ? 'bg-[#EEE3B0]/25' : 'hover:bg-purple-50/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {n.type === 'ATTENDANCE_WARNING' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {n.type === 'RESULT_PUBLISHED' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {n.type === 'CLUB_UPDATE' && <BookOpen className="w-5 h-5 text-[#8A2A78]" />}
                {n.type === 'ANNOUNCEMENT' && <Info className="w-5 h-5 text-[#500071]" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#290044] text-sm">{n.title}</h3>
                  <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
