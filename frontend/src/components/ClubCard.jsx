import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function ClubCard({ club }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:border-[#8A2A78]/40">
      <div>
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#500071]/10 text-[#500071] border border-[#500071]/20">
            {club.category}
          </span>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#8A2A78]" /> {club.location || 'Campus'}
          </span>
        </div>

        <h3 className="font-bold text-[#290044] text-lg mt-3">{club.name}</h3>
        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{club.description}</p>

        <div className="mt-4 pt-3 border-t border-purple-50 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#500071]" />
            <span>{club.meetingSchedule || 'Weekly Meets'}</span>
          </div>
          {club.facultyCoordinator && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#8A2A78]" />
              <span>Coordinator: {club.facultyCoordinator.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <Link
          to={`/clubs/${club._id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-gradient-to-r hover:from-[#500071] hover:to-[#8A2A78] text-[#290044] hover:text-[#EEE3B0] font-bold text-xs transition-all flex items-center justify-center gap-2 group border border-purple-100 hover:border-[#8A2A78]"
        >
          <span>View Club Profile & Apply</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
