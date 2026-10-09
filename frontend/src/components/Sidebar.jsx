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
  ShieldAlert,
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
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-6 bg-slate-950 border-b border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            CS
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-tight">CSMS Portal</h1>
            <p className="text-xs text-blue-400 font-medium capitalize">{role.replace('_', ' ')}</p>
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
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
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
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-300 text-xs font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
