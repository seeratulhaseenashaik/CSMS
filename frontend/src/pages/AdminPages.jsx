import React, { useState, useEffect } from 'react';
import {
  getUsersApi,
  getPromotionRulesApi,
  createPromotionRuleApi,
  publishAnnouncementApi,
  getAdminDashboardApi,
  getAdminSubjectsApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
  getAdminDepartmentsApi,
  getAdminSettingsApi,
  updateAdminSettingsApi,
  getAdminTimetableApi,
  createTimetableEntryApi,
  deleteTimetableEntryApi,
  getAdminAuditLogsApi,
  getPendingMarksApprovalsApi,
  approveMarksApi,
  publishMarksApi,
  getCorrectionRequestsApi,
  reviewCorrectionRequestApi,
} from '../services/api';
import {
  Users,
  Shield,
  Bell,
  TrendingUp,
  CheckCircle2,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  AlertTriangle,
  Check,
  X,
  Search,
  Filter,
  Edit2,
  Trash2,
  Settings,
  History,
  CheckCheck,
  Send,
  FileText,
  ChevronRight,
  Eye,
} from 'lucide-react';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi(roleFilter ? { role: roleFilter } : {});
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#290044]">User Management Directory</h1>
          <p className="text-xs text-slate-500 font-medium">Manage student, faculty, and administrative accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-white border border-purple-200 rounded-xl outline-none text-[#290044]"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
            <option value="administrator">Administrators</option>
            <option value="club_coordinator">Club Coordinators</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#290044]/5 border-b border-purple-100 text-[#290044] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400">Loading user accounts...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-purple-50/40">
                  <td className="px-6 py-4 font-bold text-slate-800">{u.name}</td>
                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                  <td className="px-6 py-4 capitalize font-bold text-[#8A2A78]">{u.role?.replace('_', ' ')}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#EEE3B0] text-[#290044] border border-[#cbaf6a]/50">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Dedicated Admin Subjects Management Component
// ----------------------------------------------------------------------
export function AdminSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const initialForm = {
    code: '',
    name: '',
    department: 'CSE',
    semester: 5,
    credits: 4,
    subjectType: 'Lecture',
    maxMarks: 100,
    minPassingMarks: 40,
    internalMaxMarks: 30,
    internalMinPassingMarks: 12,
    endSemMaxMarks: 70,
    endSemMinPassingMarks: 28,
    faculty: '',
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, [departmentFilter, semesterFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (departmentFilter) params.department = departmentFilter;
      if (semesterFilter) params.semester = semesterFilter;
      if (search) params.search = search;

      const [subRes, facRes, deptRes] = await Promise.all([
        getAdminSubjectsApi(params),
        getUsersApi({ role: 'faculty' }),
        getAdminDepartmentsApi().catch(() => ({ data: { departments: [] } })),
      ]);

      if (subRes.data.success) setSubjects(subRes.data.subjects);
      if (facRes.data.success) setFacultyList(facRes.data.users);
      if (deptRes.data?.success) setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormData(initialForm);
    setErrorMsg('');
    setStatusMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      department: subject.department,
      semester: subject.semester,
      credits: subject.credits,
      subjectType: subject.subjectType || 'Lecture',
      maxMarks: subject.maxMarks || 100,
      minPassingMarks: subject.minPassingMarks || 40,
      internalMaxMarks: subject.internalMaxMarks || 30,
      internalMinPassingMarks: subject.internalMinPassingMarks || 12,
      endSemMaxMarks: subject.endSemMaxMarks || 70,
      endSemMinPassingMarks: subject.endSemMinPassingMarks || 28,
      faculty: subject.faculty?._id || subject.faculty || '',
    });
    setErrorMsg('');
    setStatusMsg('');
    setModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (editingSubject) {
        const res = await updateSubjectApi(editingSubject._id, formData);
        if (res.data.success) {
          setStatusMsg('Subject successfully updated!');
          setModalOpen(false);
          loadData();
        }
      } else {
        const res = await createSubjectApi(formData);
        if (res.data.success) {
          setStatusMsg('Subject successfully registered!');
          setModalOpen(false);
          loadData();
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save subject.');
    }
  };

  const handleDeleteSubject = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete subject ${code}? This cannot be undone.`)) return;
    try {
      const res = await deleteSubjectApi(id);
      if (res.data.success) {
        setStatusMsg(`Subject ${code} deleted.`);
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete subject.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#290044]">Curriculum & Subject Management</h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure institutional course schemes, credit weights, passing thresholds, and faculty allocations
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl shadow-md shadow-[#500071]/25 hover:opacity-95"
        >
          <Plus className="w-4 h-4" /> Add New Subject
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#EEE3B0]/60 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]"
          />
        </form>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3 py-2 border border-purple-200 rounded-xl text-xs font-semibold text-[#290044] outline-none"
        >
          <option value="">All Departments</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="MECH">MECH</option>
          <option value="CIVIL">CIVIL</option>
          {departments.map((d) => (
            <option key={d._id} value={d.code}>{d.code} - {d.name}</option>
          ))}
        </select>

        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="px-3 py-2 border border-purple-200 rounded-xl text-xs font-semibold text-[#290044] outline-none"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#290044]/5 border-b border-purple-100 text-[#290044] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Subject Code & Name</th>
              <th className="px-6 py-4">Dept / Sem</th>
              <th className="px-6 py-4">Type & Credits</th>
              <th className="px-6 py-4">Passing Rules</th>
              <th className="px-6 py-4">Assigned Faculty</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">Loading subject catalog...</td>
              </tr>
            ) : subjects.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">No subjects matching criteria found.</td>
              </tr>
            ) : (
              subjects.map((s) => (
                <tr key={s._id} className="hover:bg-purple-50/40">
                  <td className="px-6 py-4">
                    <div className="font-black text-[#290044] text-sm">{s.code}</div>
                    <div className="text-slate-600 font-medium">{s.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#8A2A78]">{s.department}</span>
                    <span className="text-slate-400"> • Sem {s.semester}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-[#500071]">
                      {s.subjectType || 'Lecture'}
                    </span>
                    <span className="ml-2 font-bold text-slate-700">{s.credits} Credits</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 space-y-0.5">
                    <div>Min Total: <span className="font-bold text-slate-800">{s.minPassingMarks}/{s.maxMarks}</span></div>
                    <div className="text-[10px] text-slate-400">
                      Internal: {s.internalMinPassingMarks}/{s.internalMaxMarks} | EndSem: {s.endSemMinPassingMarks}/{s.endSemMaxMarks}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {s.faculty ? (
                      <div>
                        <div className="font-bold text-slate-800">{s.faculty.name}</div>
                        <div className="text-[10px] text-slate-400">{s.faculty.email}</div>
                      </div>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 text-[#500071]"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(s._id, s.code)}
                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Subject Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <h3 className="font-black text-[#290044] text-lg">
                {editingSubject ? `Edit Subject: ${editingSubject.code}` : 'Register New Subject'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS501"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none focus:border-[#8A2A78] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Title / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none focus:border-[#8A2A78]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.code}>{d.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Type</label>
                  <select
                    value={formData.subjectType}
                    onChange={(e) => setFormData({ ...formData, subjectType: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Practical">Practical</option>
                    <option value="Project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Faculty In-Charge</label>
                  <select
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  >
                    <option value="">-- Select Faculty --</option>
                    {facultyList.map((f) => (
                      <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assessment Breakdown */}
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                <h4 className="font-black text-[#290044]">Grading & Marks Distribution Scheme</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Max Total Marks</label>
                    <input
                      type="number"
                      value={formData.maxMarks}
                      onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
                      className="w-full p-2 border border-purple-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Min Passing Marks</label>
                    <input
                      type="number"
                      value={formData.minPassingMarks}
                      onChange={(e) => setFormData({ ...formData, minPassingMarks: Number(e.target.value) })}
                      className="w-full p-2 border border-purple-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Internal Max</label>
                    <input
                      type="number"
                      value={formData.internalMaxMarks}
                      onChange={(e) => setFormData({ ...formData, internalMaxMarks: Number(e.target.value) })}
                      className="w-full p-2 border border-purple-200 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Internal Min Pass</label>
                    <input
                      type="number"
                      value={formData.internalMinPassingMarks}
                      onChange={(e) => setFormData({ ...formData, internalMinPassingMarks: Number(e.target.value) })}
                      className="w-full p-2 border border-purple-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">End Sem Max</label>
                    <input
                      type="number"
                      value={formData.endSemMaxMarks}
                      onChange={(e) => setFormData({ ...formData, endSemMaxMarks: Number(e.target.value) })}
                      className="w-full p-2 border border-purple-200 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">End Sem Min Pass</label>
                    <input
                      type="number"
                      value={formData.endSemMinPassingMarks}
                      onChange={(e) => setFormData({ ...formData, endSemMinPassingMarks: Number(e.target.value) })}
                      className="w-full p-2 border border-purple-200 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold rounded-xl shadow-md hover:opacity-95"
                >
                  {editingSubject ? 'Save Changes' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Dedicated Admin Timetable & Conflict Detection Component
// ----------------------------------------------------------------------
export function AdminTimetable() {
  const [entries, setEntries] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState('');
  const [classFilter, setClassFilter] = useState('CSE-A');
  const [modalOpen, setModalOpen] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    faculty: '',
    classAndSection: 'CSE-A',
    day: 'Monday',
    period: 1,
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    classroom: 'Room 301',
    type: 'Lecture',
  });

  useEffect(() => {
    loadTimetable();
  }, [dayFilter, classFilter]);

  const loadTimetable = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dayFilter) params.day = dayFilter;
      if (classFilter) params.classAndSection = classFilter;

      const [ttRes, subRes, facRes] = await Promise.all([
        getAdminTimetableApi(params),
        getAdminSubjectsApi(),
        getUsersApi({ role: 'faculty' }),
      ]);

      if (ttRes.data.success) setEntries(ttRes.data.timetable);
      if (subRes.data.success) setSubjects(subRes.data.subjects);
      if (facRes.data.success) setFacultyList(facRes.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    setConflicts([]);
    setErrorMsg('');
    try {
      const res = await createTimetableEntryApi(formData);
      if (res.data.success) {
        setStatusMsg('Timetable schedule entry created successfully!');
        setModalOpen(false);
        loadTimetable();
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.conflicts) {
        setConflicts(err.response.data.conflicts);
        setErrorMsg('Scheduling Conflict Detected! Please adjust time, room, or assigned faculty.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to save timetable slot.');
      }
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Delete this timetable schedule slot?')) return;
    try {
      const res = await deleteTimetableEntryApi(id);
      if (res.data.success) {
        setStatusMsg('Timetable slot deleted.');
        loadTimetable();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete slot.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#290044]">Timetable & Scheduling Matrix</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage persisted schedules with 3-way automated conflict detection (Faculty, Class, Classroom)
          </p>
        </div>
        <button
          onClick={() => {
            setConflicts([]);
            setErrorMsg('');
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl shadow-md hover:opacity-95"
        >
          <Plus className="w-4 h-4" /> Add Timetable Slot
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#EEE3B0]/60 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-wrap items-center gap-4">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 border border-purple-200 rounded-xl text-xs font-semibold text-[#290044] outline-none"
        >
          <option value="CSE-A">Class: CSE-A</option>
          <option value="CSE-B">Class: CSE-B</option>
          <option value="ECE-A">Class: ECE-A</option>
          <option value="MECH-A">Class: MECH-A</option>
        </select>

        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="px-3 py-2 border border-purple-200 rounded-xl text-xs font-semibold text-[#290044] outline-none"
        >
          <option value="">All Days (Mon - Fri)</option>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Timetable Table */}
      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#290044]/5 border-b border-purple-100 text-[#290044] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Day & Period</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Class & Section</th>
              <th className="px-6 py-4">Classroom</th>
              <th className="px-6 py-4">Faculty In-Charge</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">Loading schedule records...</td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">No scheduled timetable entries found.</td>
              </tr>
            ) : (
              entries.map((item) => (
                <tr key={item._id} className="hover:bg-purple-50/40">
                  <td className="px-6 py-4">
                    <div className="font-black text-[#290044]">{item.day}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">
                      Period {item.period} ({item.startTime} - {item.endTime})
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.subject?.code} - {item.subject?.name}</div>
                    <span className="text-[10px] text-[#8A2A78] font-bold">{item.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-[#500071]">
                      {item.classAndSection}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{item.classroom}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.faculty?.name || 'Unassigned'}</div>
                    <div className="text-[10px] text-slate-400">{item.faculty?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteEntry(item._id)}
                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Slot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <h3 className="font-black text-[#290044] text-lg">Add Timetable Slot</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conflict Error Display */}
            {conflicts.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Overlap Conflicts Detected:
                </div>
                {conflicts.map((c, i) => (
                  <div key={i} className="text-[11px] text-rose-700 pl-6 list-disc">
                    • <span className="font-bold capitalize">{c.type} clash:</span> {c.reason}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => {
                    const sel = subjects.find((s) => s._id === e.target.value);
                    setFormData({
                      ...formData,
                      subject: e.target.value,
                      faculty: sel?.faculty?._id || sel?.faculty || formData.faculty,
                    });
                  }}
                  className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>{s.code} - {s.name} ({s.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Faculty</label>
                <select
                  required
                  value={formData.faculty}
                  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                  className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                >
                  <option value="">-- Select Faculty --</option>
                  {facultyList.map((f) => (
                    <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Class & Section</label>
                  <input
                    type="text"
                    required
                    value={formData.classAndSection}
                    onChange={(e) => setFormData({ ...formData, classAndSection: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classroom / Hall</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 301"
                    value={formData.classroom}
                    onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Period (1 - 8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: Number(e.target.value) })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold rounded-xl shadow-md hover:opacity-95"
                >
                  Validate & Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Dedicated Admin Marks Approvals & Publication Workflow Component
// ----------------------------------------------------------------------
export function AdminMarksApprovals() {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await getPendingMarksApprovalsApi();
      if (res.data.success) {
        setPendingApprovals(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (subjectId, semester) => {
    try {
      const res = await approveMarksApi({ subjectId, semester });
      if (res.data.success) {
        setStatusMsg(res.data.message);
        loadApprovals();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to approve marks.');
    }
  };

  const handlePublish = async (subjectId, semester) => {
    try {
      const res = await publishMarksApi({ subjectId, semester });
      if (res.data.success) {
        setStatusMsg(res.data.message);
        loadApprovals();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish marks to students.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#290044]">Marks Moderation & Publication Workflow</h1>
        <p className="text-xs text-slate-500 font-medium">
          Multi-stage assessment validation: Draft → Submitted → Approved → Published
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#EEE3B0]/60 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-[#290044]">{pendingApprovals.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Submissions Pending Review</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#290044]/5 border-b border-purple-100 text-[#290044] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Subject & Semester</th>
              <th className="px-6 py-4">Submitted By</th>
              <th className="px-6 py-4">Student Records</th>
              <th className="px-6 py-4">Current Workflow Stage</th>
              <th className="px-6 py-4 text-right">Administrative Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">Loading pending assessments...</td>
              </tr>
            ) : pendingApprovals.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">
                  No submissions currently waiting for approval or publication.
                </td>
              </tr>
            ) : (
              pendingApprovals.map((item, idx) => (
                <tr key={idx} className="hover:bg-purple-50/40">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#290044] text-sm">
                      {item.subject?.code} - {item.subject?.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Department: {item.subject?.department} • Semester: {item.semester}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.submittedBy?.name || 'Faculty'}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.submissionTimestamp ? new Date(item.submissionTimestamp).toLocaleDateString() : 'Recent'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">
                    {item.totalStudents} Students
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      item.workflowStatus === 'Approved'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.workflowStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {item.workflowStatus === 'Submitted' && (
                      <button
                        onClick={() => handleApprove(item.subject?._id, item.semester)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[11px] shadow-sm"
                      >
                        Approve Marks
                      </button>
                    )}
                    <button
                      onClick={() => handlePublish(item.subject?._id, item.semester)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] shadow-sm"
                    >
                      Publish to Students
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Dedicated Admin Correction Requests Governance Component
// ----------------------------------------------------------------------
export function AdminCorrections() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getCorrectionRequestsApi(params);
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReview = (req) => {
    setActiveRequest(req);
    setReviewNotes('');
    setReviewModalOpen(true);
  };

  const handleResolve = async (status) => {
    if (!activeRequest) return;
    try {
      const res = await reviewCorrectionRequestApi(activeRequest._id, {
        status,
        reviewNotes,
      });
      if (res.data.success) {
        setStatusMsg(`Request successfully ${status.toLowerCase()}!`);
        setReviewModalOpen(false);
        loadRequests();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update correction request.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#290044]">Student Discrepancy & Correction Requests</h1>
          <p className="text-xs text-slate-500 font-medium">
            Review reported attendance errors, disputed assessment marks, and timetable conflicts
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-purple-200 rounded-xl text-xs font-semibold text-[#290044] outline-none"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#EEE3B0]/60 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{statusMsg}</span>
          <button onClick={() => setStatusMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#290044]/5 border-b border-purple-100 text-[#290044] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Category & Subject</th>
              <th className="px-6 py-4">Issue Description</th>
              <th className="px-6 py-4">Requested Change</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">Loading requests...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">No correction requests found.</td>
              </tr>
            ) : (
              requests.map((item) => (
                <tr key={item._id} className="hover:bg-purple-50/40">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#290044]">{item.student?.name}</div>
                    <div className="text-[10px] text-slate-400">{item.student?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-[#8A2A78]">{item.category}</span>
                    <div className="text-[10px] text-slate-500 font-semibold">{item.subject?.code || 'General'}</div>
                  </td>
                  <td className="px-6 py-4 max-w-xs text-slate-700 truncate" title={item.description}>
                    {item.description}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-600">
                    {item.requestedCorrection || 'Review requested'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenReview(item)}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-[#500071] font-bold rounded-xl text-[11px]"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border border-purple-100 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <h3 className="font-black text-[#290044] text-lg">Review Correction Request</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50/50 rounded-xl space-y-1">
                <div className="text-slate-500 font-bold">Student: <span className="text-[#290044]">{activeRequest.student?.name}</span></div>
                <div className="text-slate-500 font-bold">Category: <span className="text-[#8A2A78]">{activeRequest.category}</span></div>
                <div className="text-slate-500 font-bold">Subject: <span className="text-[#290044]">{activeRequest.subject?.code} - {activeRequest.subject?.name}</span></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Student's Statement & Explanation</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 leading-relaxed">
                  {activeRequest.description}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Requested Correction / Desired Value</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold">
                  {activeRequest.requestedCorrection}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrator Review Remarks</label>
                <textarea
                  rows="3"
                  placeholder="State the resolution reason or notes for the student..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-purple-100">
                <button
                  type="button"
                  onClick={() => handleResolve('REJECTED')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={() => handleResolve('APPROVED')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Approve & Correct Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Dedicated Admin Institutional Settings Component
// ----------------------------------------------------------------------
export function AdminSettings() {
  const [settings, setSettings] = useState({
    academicYear: '2025-2026',
    currentSemester: 5,
    attendanceThreshold: 75,
    institutionName: 'Central Institute of Technology',
    institutionCode: 'CIT-CSMS',
    contactEmail: 'academics@cit.edu',
    allowedSemesters: [1, 2, 3, 4, 5, 6, 7, 8],
  });
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await getAdminSettingsApi();
      if (res.data.success) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');
    try {
      const res = await updateAdminSettingsApi(settings);
      if (res.data.success) {
        setStatusMsg('Institutional settings updated successfully!');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update settings.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#290044]">Institutional Settings & Academic Parameters</h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure default active academic periods, semester assumptions, and regulatory thresholds
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#EEE3B0]/60 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl">
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-6 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Active Academic Year</label>
            <input
              type="text"
              required
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              className="w-full p-2.5 border border-purple-200 rounded-xl outline-none font-bold text-[#290044]"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Current Active Semester</label>
            <select
              value={settings.currentSemester}
              onChange={(e) => setSettings({ ...settings, currentSemester: Number(e.target.value) })}
              className="w-full p-2.5 border border-purple-200 rounded-xl outline-none font-bold text-[#290044]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mandatory Attendance Threshold (%)</label>
            <input
              type="number"
              min="50"
              max="100"
              required
              value={settings.attendanceThreshold}
              onChange={(e) => setSettings({ ...settings, attendanceThreshold: Number(e.target.value) })}
              className="w-full p-2.5 border border-purple-200 rounded-xl outline-none font-bold"
            />
            <p className="text-[10px] text-slate-400 mt-1">Students below this percentage receive automated shortage alerts.</p>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Institutional Code</label>
            <input
              type="text"
              value={settings.institutionCode}
              onChange={(e) => setSettings({ ...settings, institutionCode: e.target.value })}
              className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Institution Legal Name</label>
            <input
              type="text"
              value={settings.institutionName}
              onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
              className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Academic Affairs Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full p-2.5 border border-purple-200 rounded-xl outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl shadow-md hover:opacity-95"
        >
          Save Institutional Configuration
        </button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// Dedicated Admin Audit Log Viewer Component
// ----------------------------------------------------------------------
export function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = actionFilter ? { action: actionFilter } : {};
      const res = await getAdminAuditLogsApi(params);
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#290044]">Institutional Governance & Audit Logs</h1>
          <p className="text-xs text-slate-500 font-medium">
            Immutable chronological audit trail of all attendance locks, assessment changes, and admin overrides
          </p>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 border border-purple-200 rounded-xl text-xs font-semibold text-[#290044] outline-none"
        >
          <option value="">All Logged Actions</option>
          <option value="RECORD_BULK_ATTENDANCE">Bulk Attendance</option>
          <option value="PUBLISH_MARKS">Publish Marks</option>
          <option value="CORRECTION_REVIEW">Correction Review</option>
          <option value="UPDATE_INSTITUTIONAL_SETTINGS">Settings Update</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#290044]/5 border-b border-purple-100 text-[#290044] uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Target Entity</th>
              <th className="px-6 py-4">Event Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">Loading audit records...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-400">No audit records found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-purple-50/40">
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#290044]">{log.user?.name || 'System User'}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{log.user?.role}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-black bg-purple-100 text-[#500071]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{log.targetEntity || 'System'}</td>
                  <td className="px-6 py-4 text-slate-600 max-w-md">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Existing Promotion Rules Component (Preserved)
// ----------------------------------------------------------------------
export function AdminPromotionRules() {
  const [rules, setRules] = useState([]);
  const [batch, setBatch] = useState('2023-2027');
  const [dept, setDept] = useState('CSE');
  const [minRatio, setMinRatio] = useState(0.75);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const res = await getPromotionRulesApi();
    if (res.data.success) setRules(res.data.rules);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    const res = await createPromotionRuleApi({
      batch,
      department: dept,
      fromYear: 3,
      toYear: 4,
      minPassedSubjectsRatio: minRatio,
      minEarnedCredits: 60,
      maxPermittedBacklogs: 2,
    });
    if (res.data.success) {
      setMsg('Promotion Rule configured successfully!');
      fetchRules();
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-black text-[#290044]">Configure Academic Promotion Rules</h1>

      {msg && <div className="p-3 bg-[#EEE3B0]/50 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl">{msg}</div>}

      <form onSubmit={handleSaveRule} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Batch</label>
            <input type="text" value={batch} onChange={e=>setBatch(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Department</label>
            <input type="text" value={dept} onChange={e=>setDept(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Min Passed Ratio (0.75 = 75%)</label>
            <input type="number" step="0.05" value={minRatio} onChange={e=>setMinRatio(Number(e.target.value))} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
          </div>
        </div>
        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl shadow-md shadow-[#500071]/25 border border-[#EEE3B0]/30 hover:opacity-95">
          Save Promotion Rule
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-sm p-6 space-y-3">
        <h3 className="font-bold text-[#290044] text-sm">Active Rules</h3>
        {rules.map(r => (
          <div key={r._id} className="p-3.5 bg-purple-50/40 rounded-xl text-xs flex justify-between border border-purple-100">
            <span>Batch {r.batch} ({r.department}) Year {r.fromYear} → {r.toYear}</span>
            <span className="font-bold text-[#500071]">Min Pass: {(r.minPassedSubjectsRatio*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Existing Announcements Component (Preserved)
// ----------------------------------------------------------------------
export function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState('');

  const handlePublish = async (e) => {
    e.preventDefault();
    const res = await publishAnnouncementApi({ title, message });
    if (res.data.success) {
      setMsg(res.data.message);
      setTitle('');
      setMessage('');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-[#290044]">Publish Official Announcement</h1>
      {msg && <div className="p-3 bg-[#EEE3B0]/50 text-[#290044] border border-[#cbaf6a] text-xs font-bold rounded-xl">{msg}</div>}
      <form onSubmit={handlePublish} className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Notice Title</label>
          <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Message Content</label>
          <textarea rows="4" required value={message} onChange={e=>setMessage(e.target.value)} className="w-full p-2.5 border border-purple-200 rounded-xl text-xs outline-none focus:border-[#8A2A78]" />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-[#500071] to-[#8A2A78] text-[#EEE3B0] font-bold text-xs rounded-xl shadow-md shadow-[#500071]/25 border border-[#EEE3B0]/30 hover:opacity-95">
          Publish to All Users
        </button>
      </form>
    </div>
  );
}
