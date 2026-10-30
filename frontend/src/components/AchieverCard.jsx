import React from 'react';
import { Award, CheckCircle2, Code, Briefcase, Trophy } from 'lucide-react';

export default function AchieverCard({ achiever }) {
  const student = achiever.student || {};

  return (
    <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#8A2A78]/40">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#500071] to-[#8A2A78] text-[#EEE3B0] flex items-center justify-center font-bold text-lg shadow-md shrink-0 border border-[#EEE3B0]/30">
          {student.name ? student.name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#290044] text-base flex items-center gap-1.5">
              {student.name}
              <CheckCircle2 className="w-4 h-4 text-[#500071] fill-purple-100 shrink-0" title="Verified Achiever" />
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EEE3B0] text-[#290044] border border-[#cbaf6a] flex items-center gap-1">
              <Award className="w-3 h-3 text-[#500071]" /> VERIFIED ACHIEVER
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{student.bio || 'Computer Science & Engineering'}</p>

          <p className="text-xs text-[#290044] mt-3 font-medium bg-[#EEE3B0]/20 p-2.5 rounded-xl border border-purple-100 leading-relaxed">
            "{achiever.achievementsSummary}"
          </p>

          {/* Badges / Competitions */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {achiever.codingBadges?.map((badge, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#500071]/10 text-[#500071] border border-[#500071]/20 flex items-center gap-1">
                <Code className="w-3 h-3 text-[#500071]" /> {badge}
              </span>
            ))}
            {achiever.hackathonsWon?.map((hack, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#8A2A78]/10 text-[#8A2A78] border border-[#8A2A78]/20 flex items-center gap-1">
                <Trophy className="w-3 h-3 text-[#8A2A78]" /> {hack}
              </span>
            ))}
            {achiever.internships?.map((intern, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EEE3B0]/60 text-[#290044] border border-[#cbaf6a]/50 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-[#500071]" /> {intern}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
