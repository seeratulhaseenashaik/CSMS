import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Search, User, CheckCircle2, AlertTriangle, Info, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-purple-100/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-slate-100/80 px-3.5 py-2 rounded-xl text-slate-500 w-72 max-w-sm focus-within:ring-2 focus-within:ring-[#500071]/20 focus-within:bg-white border border-transparent focus-within:border-[#8A2A78] transition-all">
        <Search className="w-4 h-4 text-purple-400 shrink-0" />
        <input
          type="text"
          placeholder="Search subjects, Q&A, clubs..."
          className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl text-slate-600 hover:bg-purple-50 hover:text-[#500071] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#8A2A78] text-[#EEE3B0] text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-purple-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 bg-gradient-to-r from-[#290044] to-[#500071] text-white flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                  <p className="text-xs text-[#EEE3B0] font-medium">{unreadCount} unread message(s)</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-[#EEE3B0] hover:text-white underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-purple-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications found</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`p-3.5 hover:bg-purple-50/50 transition-colors cursor-pointer flex gap-3 ${
                        !n.isRead ? 'bg-[#EEE3B0]/15' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {n.type === 'ATTENDANCE_WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'RESULT_PUBLISHED' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {n.type === 'CLUB_UPDATE' && <BookOpen className="w-4 h-4 text-[#8A2A78]" />}
                        {n.type === 'ANNOUNCEMENT' && <Info className="w-4 h-4 text-[#500071]" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-slate-800">{n.title}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-purple-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs text-[#500071] font-semibold hover:text-[#8A2A78]"
                >
                  View notification history
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Header Badge */}
        <Link to="/profile" className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#500071] to-[#8A2A78] text-[#EEE3B0] flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
            <p className="text-[10px] text-[#8A2A78] font-medium mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
