import React from 'react';
import { Award, CheckCircle2, Code, Briefcase, Trophy } from 'lucide-react';

export default function AchieverCard({ achiever }) {
  const student = achiever.student || {};

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
          {student.name ? student.name.charAt(0).toUpperCase() : 'A'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              {student.name}
              <CheckCircle2 className="w-4 h-4 text-blue-600 fill-blue-100 shrink-0" title="Verified Achiever" />
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Award className="w-3 h-3" /> VERIFIED ACHIEVER
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{student.bio || 'Computer Science & Engineering'}</p>

          <p className="text-xs text-slate-700 mt-3 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{achiever.achievementsSummary}"
          </p>

          {/* Badges / Competitions */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {achiever.codingBadges?.map((badge, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                <Code className="w-3 h-3" /> {badge}
              </span>
            ))}
            {achiever.hackathonsWon?.map((hack, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> {hack}
              </span>
            ))}
            {achiever.internships?.map((intern, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {intern}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
