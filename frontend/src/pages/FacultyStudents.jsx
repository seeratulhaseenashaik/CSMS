import React, { useState, useEffect } from 'react';
import { getFacultyStudentsApi } from '../services/api';
import {
  Users,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  CalendarCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';

export default function FacultyStudents() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Modal for individual student academic summary
  const [activeStudentModal, setActiveStudentModal] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getFacultyStudentsApi({
        subjectId: selectedSubject || undefined,
        search: searchTerm || undefined,
        page,
        limit: 10,
      });

      if (res.data?.success) {
        setStudents(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, totalPages: 1 });
        setSubjects(res.data.availableSubjects || []);
      }
    } catch (err) {
      console.error('Error fetching faculty students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedSubject, page]);

  // Handle search submit or debounce
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#500071]" />
            <h1 className="text-2xl font-black text-[#290044]">My Students Roster</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directory of enrolled students across your assigned teaching cohorts and authorized academic sections.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-[#500071] border border-purple-100 self-start md:self-auto">
          Total Enrolled: {pagination.total} Students
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-purple-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search student name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-20 py-2 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#8A2A78] outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] text-[11px] font-bold rounded-lg shadow-2xs hover:opacity-95"
          >
            Search
          </button>
        </form>

        {/* Subject Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#8A2A78] outline-none"
          >
            <option value="">All Assigned Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#500071] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading enrolled student directory...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">No Students Found</h4>
            <p className="text-xs text-slate-400">
              No enrolled students matched your search criteria or assigned subjects.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#290044] to-[#500071] text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Program & Batch</th>
                  <th className="py-3.5 px-4">Attendance in Your Classes</th>
                  <th className="py-3.5 px-4">Current CGPA</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 text-xs text-slate-700">
                {students.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{st.name}</p>
                      <p className="text-[11px] text-[#500071] font-mono">{st.registrationNumber}</p>
                      <p className="text-[10px] text-slate-400">{st.email}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-700">
                        {st.degree} {st.department}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Semester {st.currentSemester} • Batch {st.batch}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            st.hasShortage
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {st.attendancePercentage}%
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({st.attendedClasses}/{st.totalClasses} classes)
                        </span>
                      </div>
                      {st.hasShortage && (
                        <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Below 75% Threshold
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-black text-slate-800 text-sm">
                        {st.cgpa ? Number(st.cgpa).toFixed(2) : 'N/A'}
                      </span>
                      <p className="text-[10px] text-slate-400">SGPA: {st.sgpa ? Number(st.sgpa).toFixed(2) : 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setActiveStudentModal(st)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-[#500071] text-[#500071] hover:text-[#EEE3B0] text-xs font-bold transition-all inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Academic Info</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-purple-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Page {page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-purple-100 bg-white hover:bg-purple-50 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-purple-100 bg-white hover:bg-purple-50 text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Academic Info Modal */}
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-[#500071] text-[#EEE3B0] text-[10px] font-black tracking-wide">
                  {activeStudentModal.registrationNumber}
                </span>
                <h3 className="text-lg font-black text-[#290044] mt-1">{activeStudentModal.name}</h3>
                <p className="text-xs text-slate-500">
                  {activeStudentModal.degree} {activeStudentModal.department} • Semester {activeStudentModal.currentSemester} • Batch {activeStudentModal.batch}
                </p>
              </div>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Academic Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold">Attendance in Your Classes</span>
                <p className="font-black text-slate-800 text-sm mt-0.5">
                  {activeStudentModal.attendancePercentage}%
                </p>
                <span className="text-[10px] text-slate-400">
                  {activeStudentModal.attendedClasses}/{activeStudentModal.totalClasses} classes
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold">Cumulative CGPA</span>
                <p className="font-black text-[#500071] text-sm mt-0.5">
                  {activeStudentModal.cgpa ? Number(activeStudentModal.cgpa).toFixed(2) : 'N/A'}
                </p>
                <span className="text-[10px] text-slate-400">Institutional 10-Pt</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold">Current SGPA</span>
                <p className="font-black text-[#8A2A78] text-sm mt-0.5">
                  {activeStudentModal.sgpa ? Number(activeStudentModal.sgpa).toFixed(2) : 'N/A'}
                </p>
                <span className="text-[10px] text-slate-400">Latest Term</span>
              </div>
            </div>

            {/* Enrolled Faculty Subjects */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Subjects Enrolled with You
              </h4>
              <div className="space-y-1.5">
                {activeStudentModal.enrolledFacultySubjects?.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-purple-100/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{sub.code}</span> - {sub.name}
                    </div>
                    <span className="text-[11px] font-semibold text-[#8A2A78]">
                      {sub.credits} Credits
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Records in Faculty's Subjects */}
            {activeStudentModal.results?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assessment Results
                </h4>
                <div className="space-y-1.5">
                  {activeStudentModal.results.map((res, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-purple-100/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">Score: {res.totalMarks}/100</span>
                        <span className="px-2 py-0.5 bg-purple-100 text-[#500071] font-bold text-[10px] rounded-md">
                          Grade {res.grade}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        res.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setActiveStudentModal(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
