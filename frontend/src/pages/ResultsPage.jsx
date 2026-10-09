import React, { useState, useEffect } from 'react';
import { getMyResultsApi } from '../services/api';
import { Award, BookOpen, CheckCircle2, AlertCircle, Info, ChevronRight } from 'lucide-react';

export default function ResultsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await getMyResultsApi();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const scorecard = data?.scorecard || [];
  const semestersSgpaList = data?.semestersSgpaList || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Scorecard & Performance Tracker</h1>
        <p className="text-xs text-slate-500 mt-1">Official examination results, SGPA/CGPA evaluation, and subject pass threshold requirements.</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Cumulative GPA (CGPA)</p>
          <h2 className="text-3xl font-extrabold text-blue-600 mt-1">{summary.cgpa}</h2>
          <p className="text-xs text-slate-400 mt-1">Overall 10-Point Academic Scale</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Current Semester SGPA</p>
          <h2 className="text-3xl font-extrabold text-indigo-600 mt-1">{summary.sgpa}</h2>
          <p className="text-xs text-slate-400 mt-1">Semester 5 Performance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Earned Credits</p>
          <h2 className="text-3xl font-extrabold text-emerald-600 mt-1">{summary.earnedCredits}</h2>
          <p className="text-xs text-slate-400 mt-1">Degree Total Requirement: 160</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Passed / Backlogs</p>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">{summary.passedSubjects} / {summary.failedSubjects}</h2>
          <p className="text-xs text-slate-400 mt-1">Pending: {summary.pendingResults}</p>
        </div>
      </div>

      {/* Subject Scorecard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Semester 5 Published Scorecard</h2>
          <span className="text-xs text-slate-500 font-medium">Internal Min: 12 | End-Sem Min: 28 | Total Min: 40</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Internal (Max 30)</th>
                <th className="px-6 py-4">Midterm / Practical</th>
                <th className="px-6 py-4">End-Sem (Max 70)</th>
                <th className="px-6 py-4">Total Obtained</th>
                <th className="px-6 py-4">Grade</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Remaining Marks to Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scorecard.map((item) => {
                const evalData = item.evaluation || {};
                return (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.subject?.name}</div>
                      <div className="text-[11px] text-slate-400">{item.subject?.code} • {item.subject?.credits} Credits</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {item.internalMarks} <span className="text-[10px] text-slate-400">(min {item.subject?.internalMinPassingMarks || 12})</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {item.midtermMarks || 0} / {item.practicalMarks || 0}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {item.endSemMarks} <span className="text-[10px] text-slate-400">(min {item.subject?.endSemMinPassingMarks || 28})</span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 text-sm">
                      {item.totalMarks} / {item.maxMarks}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {item.grade} ({item.gradePoints} Points)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {evalData.marksNeededForTotal === 0 ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold">
                          Need {evalData.marksNeededForTotal} more marks
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
