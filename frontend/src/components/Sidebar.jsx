import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Award,
  TrendingUp,
  HelpCircle,
  Users,
  Briefcase,
  Bell,
  Settings,
  LogOut,
  ClipboardList,
  BookOpen
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role || 'student';

  const studentNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
    { name: 'Academic Results', path: '/results', icon: Award },
    { name: 'Academic Progression', path: '/progression', icon: TrendingUp },
    { name: 'Achievers Q&A', path: '/qa', icon: HelpCircle },
    { name: 'College Clubs', path: '/clubs', icon: Users },
    { name: 'My Clubs', path: '/my-clubs', icon: Briefcase },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const facultyNav = [
    { name: 'Faculty Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Record Attendance', path: '/faculty/attendance', icon: CalendarCheck },
    { name: 'Enter Marks', path: '/faculty/marks', icon: ClipboardList },
    { name: 'Achievers Q&A', path: '/qa', icon: HelpCircle },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const adminNav = [
    { name: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Promotion Rules', path: '/admin/promotion-rules', icon: TrendingUp },
    { name: 'Subjects & Scheme', path: '/admin/subjects', icon: BookOpen },
    { name: 'Announcements', path: '/admin/announcements', icon: Bell },
    { name: 'Achievers Q&A', path: '/qa', icon: HelpCircle },
    { name: 'College Clubs', path: '/clubs', icon: Briefcase },
  ];

  const coordinatorNav = [
    { name: 'Coordinator Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Manage Club & Events', path: '/clubs', icon: Briefcase },
    { name: 'Achievers Q&A', path: '/qa', icon: HelpCircle },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  let navItems = studentNav;
  if (role === 'faculty') navItems = facultyNav;
  if (role === 'administrator') navItems = adminNav;
  if (role === 'club_coordinator') navItems = coordinatorNav;

  return (
    <aside className="w-64 bg-[#290044] text-purple-100 min-h-screen flex flex-col justify-between border-r border-[#3e0058] shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 bg-[#1b002e] border-b border-[#3e0058]">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#500071] to-[#8A2A78] flex items-center justify-center text-[#EEE3B0] font-black text-lg shadow-md border border-[#8A2A78]/50">
            CS
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-tight">CSMS Portal</h1>
            <p className="text-xs text-[#EEE3B0] font-semibold capitalize tracking-wide">{role.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-semibold shadow-lg shadow-[#500071]/35 border border-[#8A2A78]/40'
                      : 'text-purple-200/80 hover:text-[#EEE3B0] hover:bg-[#500071]/40'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Info */}
      <div className="p-4 border-t border-[#3e0058] bg-[#1b002e]/70">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-[#500071] border border-[#8A2A78]/50 flex items-center justify-center text-[#EEE3B0] font-bold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-purple-300 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#3e0058]/80 hover:bg-[#8A2A78] hover:text-[#EEE3B0] text-purple-200 text-xs font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
