import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'royal', linkTo, badge }) {
  const navigate = useNavigate();

  const colorStyles = {
    royal: 'bg-[#500071]/10 text-[#500071] border-[#500071]/20',
    magenta: 'bg-[#8A2A78]/10 text-[#8A2A78] border-[#8A2A78]/20',
    cream: 'bg-[#EEE3B0]/40 text-[#290044] border-[#EEE3B0]',
    deep: 'bg-[#290044]/10 text-[#290044] border-[#290044]/20',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const handleClick = () => {
    if (linkTo) navigate(linkTo);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-2xl p-5 border border-purple-100/80 shadow-sm transition-all duration-200 ${
        linkTo ? 'cursor-pointer hover:shadow-md hover:border-[#8A2A78]/50 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">{title}</p>
          <h3 className="text-2xl font-black text-[#290044] mt-1.5">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.royal}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {badge && (
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EEE3B0]/50 text-[#290044] border border-[#EEE3B0]">
          {badge}
        </div>
      )}
    </div>
  );
}
