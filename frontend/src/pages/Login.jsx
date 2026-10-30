import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Shield, UserCheck, GraduationCap, Users } from 'lucide-react';

export default function Login() {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setLoading(true);
    const result = await login(demoEmail, 'Password123!');
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#290044] via-[#500071] to-[#290044] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#500071]/40 border border-[#EEE3B0]/40">
            CS
          </div>
          <h2 className="text-2xl font-black text-[#290044]">CSMS Portal</h2>
          <p className="text-xs text-[#8A2A78] font-semibold mt-1">Centralized Student Management System</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@csms.edu"
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium focus:ring-2 focus:ring-[#500071]/20 focus:border-[#8A2A78] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-purple-200 text-sm font-medium focus:ring-2 focus:ring-[#500071]/20 focus:border-[#8A2A78] outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#500071] to-[#8A2A78] hover:opacity-95 text-[#EEE3B0] font-extrabold text-sm shadow-lg shadow-[#500071]/35 transition-all flex items-center justify-center gap-2 border border-[#EEE3B0]/20"
          >
            <LogIn className="w-4 h-4 text-[#EEE3B0]" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Roles Quick Login */}
        <div className="mt-8 pt-6 border-t border-purple-100">
          <p className="text-[11px] font-bold text-[#8A2A78] uppercase tracking-wider text-center mb-3">
            One-Click Demo Account Sign In
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleDemoLogin('student@csms.edu')}
              className="px-3 py-2 rounded-xl bg-purple-50/60 hover:bg-[#EEE3B0]/40 border border-purple-200 text-xs font-semibold text-[#290044] flex items-center gap-2 transition-all hover:border-[#8A2A78]"
            >
              <GraduationCap className="w-4 h-4 text-[#500071] shrink-0" />
              <span>Student</span>
            </button>
            <button
              onClick={() => handleDemoLogin('faculty@csms.edu')}
              className="px-3 py-2 rounded-xl bg-purple-50/60 hover:bg-[#EEE3B0]/40 border border-purple-200 text-xs font-semibold text-[#290044] flex items-center gap-2 transition-all hover:border-[#8A2A78]"
            >
              <UserCheck className="w-4 h-4 text-[#8A2A78] shrink-0" />
              <span>Faculty</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin@csms.edu')}
              className="px-3 py-2 rounded-xl bg-purple-50/60 hover:bg-[#EEE3B0]/40 border border-purple-200 text-xs font-semibold text-[#290044] flex items-center gap-2 transition-all hover:border-[#8A2A78]"
            >
              <Shield className="w-4 h-4 text-[#500071] shrink-0" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleDemoLogin('coordinator@csms.edu')}
              className="px-3 py-2 rounded-xl bg-purple-50/60 hover:bg-[#EEE3B0]/40 border border-purple-200 text-xs font-semibold text-[#290044] flex items-center gap-2 transition-all hover:border-[#8A2A78]"
            >
              <Users className="w-4 h-4 text-[#8A2A78] shrink-0" />
              <span>Coordinator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
