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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
            CS
          </div>
          <h2 className="text-2xl font-bold text-slate-900">CSMS Portal</h2>
          <p className="text-xs text-slate-500 mt-1">Centralized Student Management System</p>
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Roles Quick Login */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
            One-Click Demo Account Sign In
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('student@csms.edu')}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-700 flex items-center gap-2 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Student</span>
            </button>
            <button
              onClick={() => handleDemoLogin('faculty@csms.edu')}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-700 flex items-center gap-2 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Faculty</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin@csms.edu')}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-purple-700 flex items-center gap-2 transition-colors"
            >
              <Shield className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleDemoLogin('coordinator@csms.edu')}
              className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-2 transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Coordinator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
