import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', linkTo, badge }) {
  const navigate = useNavigate();

  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  const handleClick = () => {
    if (linkTo) navigate(linkTo);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all duration-200 ${
        linkTo ? 'cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
          {badge}
        </div>
      )}
    </div>
  );
}
