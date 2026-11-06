import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Shield,
  UserCheck,
  GraduationCap,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import classroomImg from '../assets/classroom.png';

const PORTAL_ROLES = {
  student: {
    key: 'student',
    label: 'Student',
    portalName: 'Student Academic Portal',
    idLabel: 'Registration Number / Roll No',
    idPlaceholder: 'e.g. 2023CSE042 or student@csms.edu',
    idHelp: 'Enter your assigned university Registration Number',
    pwdLabel: 'Date of Birth (DOB)',
    pwdPlaceholder: 'YYYY-MM-DD or DD-MM-YYYY (e.g. 2004-05-15)',
    pwdHelp: 'Your Date of Birth serves as your default student password',
    sampleId: '2023CSE042',
    samplePwd: '2004-05-15',
    icon: GraduationCap,
  },
  faculty: {
    key: 'faculty',
    label: 'Faculty',
    portalName: 'Faculty & Instruction Portal',
    idLabel: 'Faculty Employee ID',
    idPlaceholder: 'e.g. FAC001 or faculty@csms.edu',
    idHelp: 'Enter your department Employee Identification ID',
    pwdLabel: 'Date of Birth / Password',
    pwdPlaceholder: 'YYYY-MM-DD or Password (e.g. 1982-04-12)',
    pwdHelp: 'Enter your registered DOB or faculty account password',
    sampleId: 'FAC001',
    samplePwd: '1982-04-12',
    icon: UserCheck,
  },
  admin: {
    key: 'admin',
    label: 'Admin',
    portalName: 'Registrar & System Administration',
    idLabel: 'Administrator Email',
    idPlaceholder: 'admin@csms.edu',
    idHelp: 'Enter institutional registrar credentials',
    pwdLabel: 'Administrator Password',
    pwdPlaceholder: '••••••••',
    pwdHelp: 'Enter your secure master password',
    sampleId: 'admin@csms.edu',
    samplePwd: 'Password123!',
    icon: Shield,
  },
  coordinator: {
    key: 'coordinator',
    label: 'Coordinator',
    portalName: 'Clubs & Student Activities Portal',
    idLabel: 'Coordinator Email / User ID',
    idPlaceholder: 'coordinator@csms.edu',
    idHelp: 'Enter campus club coordinator account ID',
    pwdLabel: 'Coordinator Password',
    pwdPlaceholder: '••••••••',
    pwdHelp: 'Enter your club management password',
    sampleId: 'coordinator@csms.edu',
    samplePwd: 'Password123!',
    icon: Users,
  },
};

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeConfig = PORTAL_ROLES[selectedRole];
  const ActiveIcon = activeConfig.icon;

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setIdentifier('');
    setPassword('');
  };

  const handleFillSample = () => {
    setIdentifier(activeConfig.sampleId);
    setPassword(activeConfig.samplePwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(identifier, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-slate-950 font-sans">
      {/* 1. Full-Screen Background Image */}
      <img
        src={classroomImg}
        alt="Classroom Lecture"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.08] scale-105 transition-transform duration-1000"
      />

      {/* 2. Velvet & Royal Purple Gradient Tint Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#290044]/90 via-[#500071]/70 to-[#1b002e]/95 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/20 to-black/60 pointer-events-none" />

      {/* Decorative Brand Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#8A2A78]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#500071]/35 blur-3xl pointer-events-none" />

      {/* 3. Centered Modern Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-7 sm:p-9 border border-white/40 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-black text-[#290044] tracking-tight">CSMS Portal</h2>
          <p className="text-xs text-[#8A2A78] font-bold mt-0.5">
            Centralized Student Management System
          </p>
        </div>

        {/* 4. Role Navigation Switcher (Student, Faculty, Admin, Coordinator) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-2xl mb-5 border border-purple-100/80">
          {Object.values(PORTAL_ROLES).map((roleItem) => {
            const Icon = roleItem.icon;
            const isActive = selectedRole === roleItem.key;
            return (
              <button
                key={roleItem.key}
                type="button"
                onClick={() => handleRoleChange(roleItem.key)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] shadow-md shadow-[#500071]/30 scale-[1.02]'
                    : 'text-slate-600 hover:text-[#500071] hover:bg-white/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{roleItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Role Portal Badge */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[11px] font-bold text-[#500071] border border-purple-100/80">
            <ActiveIcon className="w-3.5 h-3.5 text-[#8A2A78]" />
            <span>{activeConfig.portalName}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold text-center animate-in slide-in-from-top-1">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>{activeConfig.idLabel}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeConfig.idPlaceholder}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#500071]/20 focus:border-[#8A2A78] outline-none bg-slate-50/70 focus:bg-white transition-all uppercase placeholder:normal-case"
              />
              <ActiveIcon className="w-4 h-4 text-purple-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{activeConfig.idHelp}</p>
          </div>

          {/* Password / Date of Birth Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>{activeConfig.pwdLabel}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeConfig.pwdPlaceholder}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-purple-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#500071]/20 focus:border-[#8A2A78] outline-none bg-slate-50/70 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{activeConfig.pwdHelp}</p>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#500071] via-[#8A2A78] to-[#500071] hover:opacity-95 text-[#EEE3B0] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#500071]/35 transition-all flex items-center justify-center gap-2 border border-[#EEE3B0]/30 hover:scale-[1.01] active:scale-[0.99]"
          >
            <LogIn className="w-4 h-4 text-[#EEE3B0]" />
            <span>{loading ? 'Authenticating...' : `Sign In as ${activeConfig.label}`}</span>
          </button>
        </form>

        {/* Quick Credentials Auto-Fill Option for Testing */}
        <div className="mt-5 pt-4 border-t border-purple-100 text-center">
          <button
            type="button"
            onClick={handleFillSample}
            className="text-[11px] font-bold text-[#8A2A78] hover:text-[#500071] transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-fill {activeConfig.label} Credentials</span>
            <span className="text-[10px] text-slate-400 font-mono">({activeConfig.sampleId})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
