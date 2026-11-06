import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  Search,
  User,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  const isFaculty = user?.role === 'faculty';

  return (
    <header className="h-16 bg-white border-b border-purple-100/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Branding & Portal Badge */}
      <div className="flex items-center gap-4">
        {isFaculty ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#290044]/10 via-[#500071]/10 to-[#8A2A78]/10 border border-[#8A2A78]/30 rounded-xl">
            <GraduationCap className="w-4 h-4 text-[#500071]" />
            <span className="text-xs font-bold bg-gradient-to-r from-[#290044] to-[#8A2A78] bg-clip-text text-transparent">
              Faculty Academic Portal
            </span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-purple-50/80 border border-purple-200/50 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#500071]" />
            <span className="text-xs font-semibold text-[#500071] capitalize">
              {user?.role?.replace('_', ' ')} Portal
            </span>
          </div>
        )}

        {/* Search Bar */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 px-3.5 py-1.5 rounded-xl text-slate-500 w-64 max-w-sm focus-within:ring-2 focus-within:ring-[#500071]/20 focus-within:bg-white border border-transparent focus-within:border-[#8A2A78] transition-all">
          <Search className="w-4 h-4 text-purple-400 shrink-0" />
          <input
            type="text"
            placeholder="Search subjects, students, records..."
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
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

        {/* User Profile Menu Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-3 pl-3 border-l border-slate-200 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#500071] to-[#8A2A78] text-[#EEE3B0] flex items-center justify-center font-bold text-xs shadow-sm border border-[#8A2A78]/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
              <p className="text-[10px] text-[#8A2A78] font-medium mt-0.5 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Popover Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-purple-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 bg-gradient-to-r from-[#290044] to-[#500071] text-white">
                <p className="text-xs font-bold truncate text-[#EEE3B0]">{user?.name}</p>
                <p className="text-[11px] text-purple-200 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[#8A2A78]/60 text-white font-medium capitalize">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-[#500071] rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-[#8A2A78]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to={isFaculty ? '/faculty/settings' : '/profile'}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-[#500071] rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-purple-500" />
                  <span>Account Settings</span>
                </Link>

                <div className="my-1 border-t border-purple-50" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
