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
import loginBgImg from '../assets/students_study.jpg';

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
    <div className="min-h-screen w-full relative flex items-center justify-center lg:justify-start p-4 sm:p-6 md:p-10 lg:p-12 lg:pl-16 xl:pl-28 overflow-hidden bg-[#090D0B] font-sans selection:bg-[#53B879] selection:text-[#090D0B] isolate">
      {/* Layer 1 — Base Image (College Students in Collaborative Study) */}
      <img
        src={loginBgImg}
        alt="College Students in Collaborative Study"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.68] contrast-[1.14] saturate-[0.70] scale-100 transition-transform duration-1000"
      />

      {/* Layer 2 — Dark Charcoal Seamless Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(9, 13, 11, 0.94) 0%, rgba(12, 22, 15, 0.82) 38%, rgba(10, 20, 13, 0.52) 70%, rgba(9, 13, 11, 0.76) 100%)',
        }}
      />

      {/* Layer 3 — Emerald Atmospheric Gradients & Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 72% 38%, rgba(83, 184, 121, 0.18), transparent 60%), radial-gradient(ellipse at 28% 68%, rgba(46, 92, 60, 0.14), transparent 52%)',
        }}
      />

      {/* Layer 4 — Cinematic Vignette & Edge Shadowing */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 25%, rgba(0, 0, 0, 0.65) 100%)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#090D0B]/85 via-transparent to-[#090D0B]/90 pointer-events-none" />

      {/* Layer 5 — Subtle Cinematic Lighting & Geometric Accents (Inspired by Reference 1) */}
      {/* Soft vertical light beam casting down from above */}
      <div className="absolute top-0 right-1/4 w-[480px] h-full bg-gradient-to-b from-[#53B879]/15 via-[#53B879]/[0.03] to-transparent blur-3xl pointer-events-none" />

      {/* Subtle horizontal glowing accent rule */}
      <div className="absolute top-[48%] inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#53B879]/20 to-transparent pointer-events-none" />

      {/* Subtle halo ring in the background */}
      <div className="absolute top-[16%] right-[14%] w-[420px] h-[420px] rounded-full border border-[#53B879]/10 bg-[#53B879]/[0.015] blur-[1px] pointer-events-none hidden md:block" />

      {/* Technical Monospace Micro-Labels */}
      <div className="absolute top-6 left-8 font-mono text-[10px] text-[#A1B4A6]/70 tracking-widest hidden md:flex items-center gap-2 pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-[#53B879] animate-pulse" />
        <span>CSMS // ACADEMIC PLATFORM</span>
        <span>•</span>
        <span>SECURE ACCESS</span>
      </div>

      {/* Modern Status Badge in top right */}
      <div className="absolute top-6 right-8 hidden sm:flex items-center gap-2 pointer-events-none">
        <span className="px-3 py-1 rounded-full bg-[#101A14]/90 border border-[#42614B]/50 text-[#A4F5AE] text-[10px] font-mono tracking-widest uppercase shadow-sm">
          SYSTEM ACTIVE
        </span>
      </div>

      {/* 4. Deep Charcoal-Green Glassmorphic Login Card */}
      <div
        className="relative z-10 w-full max-w-md backdrop-blur-xl rounded-[22px] p-7 sm:p-9 border animate-in fade-in zoom-in-95 duration-300"
        style={{
          backgroundColor: 'rgba(17, 28, 21, 0.86)',
          borderColor: 'rgba(164, 245, 174, 0.18)',
          boxShadow:
            '0 24px 70px rgba(0, 0, 0, 0.55), 0 0 35px rgba(83, 184, 121, 0.08), inset 0 1px 0 0 rgba(164, 245, 174, 0.15)',
        }}
      >
        {/* Brand Header with Emerald Accents */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-black text-[#F4F6F0] tracking-tight">CSMS Portal</h2>
          <div className="flex items-center justify-center gap-2 mt-2 mb-1.5">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#53B879]/50" />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#A4F5AE] shadow-sm shadow-[#A4F5AE]" />
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#53B879]/50" />
          </div>
          <p className="text-xs text-[#A1B4A6] font-medium tracking-wide">
            Centralized Student Management System
          </p>
        </div>

        {/* 5. Role Navigation Switcher (Student, Faculty, Admin, Coordinator) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#101A14] rounded-2xl mb-5 border border-[#42614B]/35 shadow-inner">
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
                    ? 'bg-gradient-to-r from-[#1E3B29] to-[#2B543B] text-[#A4F5AE] shadow-[0_0_15px_rgba(83,184,121,0.22)] border border-[#53B879]/50 scale-[1.02]'
                    : 'text-[#A1B4A6] hover:text-[#F4F6F0] hover:bg-[#17231D]/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#A4F5AE]' : 'text-[#A1B4A6]'}`} />
                <span className="truncate">{roleItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Role Portal Badge */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101A14]/90 text-[11px] font-bold text-[#A4F5AE] border border-[#42614B]/50 shadow-sm">
            <ActiveIcon className="w-3.5 h-3.5 text-[#53B879]" />
            <span>{activeConfig.portalName}</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-[#2A1518]/90 border border-rose-500/40 text-xs text-rose-300 font-semibold text-center animate-in slide-in-from-top-1">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-bold text-[#A1B4A6] mb-1 flex items-center justify-between">
              <span>{activeConfig.idLabel}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={activeConfig.idPlaceholder}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#42614B]/40 text-xs font-medium text-[#F4F6F0] placeholder-[#A1B4A6]/40 focus:ring-2 focus:ring-[#53B879]/25 focus:border-[#53B879] outline-none bg-[#101A14] focus:bg-[#122018] transition-all uppercase placeholder:normal-case"
              />
              <ActiveIcon className="w-4 h-4 text-[#53B879]/70 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            <p className="text-[10px] text-[#A1B4A6]/70 mt-1">{activeConfig.idHelp}</p>
          </div>

          {/* Password / Date of Birth Input */}
          <div>
            <label className="block text-xs font-bold text-[#A1B4A6] mb-1 flex items-center justify-between">
              <span>{activeConfig.pwdLabel}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeConfig.pwdPlaceholder}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#42614B]/40 text-xs font-medium text-[#F4F6F0] placeholder-[#A1B4A6]/40 focus:ring-2 focus:ring-[#53B879]/25 focus:border-[#53B879] outline-none bg-[#101A14] focus:bg-[#122018] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-[#A1B4A6]/60 hover:text-[#A4F5AE] transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-[#A1B4A6]/70 mt-1">{activeConfig.pwdHelp}</p>
          </div>

          {/* Premium Emerald Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1E5232] via-[#2F7347] to-[#1E5232] hover:from-[#26633D] hover:via-[#398A55] hover:to-[#26633D] text-[#F4F6F0] font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(83,184,121,0.22)] hover:shadow-[0_0_28px_rgba(83,184,121,0.38)] transition-all flex items-center justify-center gap-2 border border-[#A4F5AE]/30 hover:border-[#A4F5AE]/60 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            <LogIn className="w-4 h-4 text-[#A4F5AE]" />
            <span>{loading ? 'Authenticating...' : `Sign In as ${activeConfig.label}`}</span>
          </button>
        </form>

        {/* Quick Credentials Auto-Fill Option for Testing */}
        <div className="mt-5 pt-4 border-t border-[#42614B]/30 text-center">
          <button
            type="button"
            onClick={handleFillSample}
            className="text-[11px] font-bold text-[#53B879] hover:text-[#A4F5AE] transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-fill {activeConfig.label} Credentials</span>
            <span className="text-[10px] text-[#A1B4A6]/60 font-mono">({activeConfig.sampleId})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
