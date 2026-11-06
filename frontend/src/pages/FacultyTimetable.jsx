import React, { useState, useEffect } from 'react';
import { getFacultyTimetableApi } from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  CalendarDays,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function FacultyTimetable() {
  const [schedule, setSchedule] = useState([]);
  const [academicCalendar, setAcademicCalendar] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'daily'
  const [selectedDay, setSelectedDay] = useState(
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()] === 'Sunday' ||
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()] === 'Saturday'
      ? 'Monday'
      : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()]
  );

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await getFacultyTimetableApi();
      if (res.data?.success) {
        setSchedule(res.data.data?.weeklySchedule || []);
        setAcademicCalendar(res.data.data?.academicCalendar || []);
        setSubjects(res.data.data?.subjects || []);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredSchedule = activeTab === 'daily'
    ? schedule.filter((s) => s.day === selectedDay)
    : schedule;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#500071]" />
            <h1 className="text-2xl font-black text-[#290044]">Academic Timetable & Schedule</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weekly teaching hours, laboratory sessions, classroom allocations, and institutional calendar milestones.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-purple-50 p-1 rounded-2xl border border-purple-100 self-start md:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'weekly'
                ? 'bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] shadow-sm'
                : 'text-purple-900 hover:text-[#500071]'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'daily'
                ? 'bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] shadow-sm'
                : 'text-purple-900 hover:text-[#500071]'
            }`}
          >
            Day View
          </button>
        </div>
      </div>

      {/* Daily View Day Selector */}
      {activeTab === 'daily' && (
        <div className="flex flex-wrap items-center gap-2">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedDay === d
                  ? 'bg-[#290044] text-[#EEE3B0] border-[#290044] shadow-sm'
                  : 'bg-white text-slate-600 border-purple-100 hover:bg-purple-50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Main Timetable Content */}
      {loading ? (
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#500071] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading weekly academic timetable...</p>
        </div>
      ) : activeTab === 'weekly' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {days.map((day) => {
            const daySlots = schedule.filter((s) => s.day === day);
            const isToday =
              ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()] === day;

            return (
              <div
                key={day}
                className={`rounded-3xl p-4 border transition-all space-y-3 flex flex-col justify-between ${
                  isToday
                    ? 'bg-gradient-to-b from-[#EEE3B0]/20 to-white border-[#8A2A78] ring-1 ring-[#8A2A78]/30 shadow-sm'
                    : 'bg-white border-purple-100'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-purple-50">
                    <h3 className="font-black text-sm text-[#290044]">{day}</h3>
                    {isToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8A2A78] text-[#EEE3B0]">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {daySlots.length > 0 ? (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100/70 hover:bg-purple-50 transition-all space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#500071] text-[#EEE3B0]">
                              {slot.subject.code}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">{slot.startTime}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">{slot.subject.name}</h4>
                          <div className="flex flex-col gap-0.5 text-[10px] text-slate-500 pt-1 border-t border-purple-100/50">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#8A2A78]" /> {slot.room}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" /> {slot.classSection}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-purple-100 rounded-xl">
                        Free Slot
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-purple-50">
                  {daySlots.length} Session(s)
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Daily View List */
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-50">
            <h3 className="text-base font-bold text-[#290044]">{selectedDay} Schedule</h3>
            <span className="text-xs text-slate-500 font-semibold">{filteredSchedule.length} Lecture(s)</span>
          </div>

          {filteredSchedule.length > 0 ? (
            <div className="space-y-3">
              {filteredSchedule.map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#500071] text-[#EEE3B0] text-xs font-black">
                        {slot.subject.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">{slot.subject.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#500071]">
                        {slot.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8A2A78]" /> {slot.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {slot.classSection}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-purple-100 text-[#290044] shadow-2xs">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No classes scheduled for {selectedDay}.
            </div>
          )}
        </div>
      )}

      {/* Academic Calendar Milestones */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-purple-50">
          <CalendarDays className="w-5 h-5 text-[#8A2A78]" />
          <h3 className="text-base font-black text-[#290044]">Institutional Academic Calendar Dates</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {academicCalendar.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl border border-purple-100 bg-slate-50/50 flex items-start gap-3 text-xs"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#500071] flex flex-col items-center justify-center font-bold text-[10px] shrink-0">
                <span>{new Date(item.date).toLocaleString('en-US', { month: 'short' })}</span>
                <span className="text-sm font-black text-[#290044] leading-none">
                  {new Date(item.date).getDate()}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 leading-snug">{item.event}</h4>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#8A2A78]/10 text-[#8A2A78]">
                  {item.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
