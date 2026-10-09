import React, { useState, useEffect } from 'react';
import { getProgressionEligibilityApi } from '../services/api';
import { TrendingUp, CheckCircle2, XCircle, AlertCircle, Info, ShieldCheck } from 'lucide-react';

export default function ProgressionPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgression();
  }, []);

  const fetchProgression = async () => {
    try {
      const res = await getProgressionEligibilityApi();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch progression eligibility:', err);
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

  const evaluation = data?.evaluation || {};
  const student = data?.student || {};
  const conditions = evaluation.conditions || [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Progression & Promotion Eligibility</h1>
        <p className="text-xs text-slate-500 mt-1">Official institutional evaluation for promotion from Academic Year {student.academicYear || 3} to Year {(student.academicYear || 3) + 1}.</p>
      </div>

      {/* Promotion Decision Hero Banner */}
      <div className={`rounded-3xl p-8 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
        evaluation.status === 'ELIGIBLE' 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : evaluation.status === 'CONDITIONALLY_ELIGIBLE'
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : 'bg-rose-50 border-rose-200 text-rose-950'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-2xl ${
            evaluation.status === 'ELIGIBLE' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 shadow-sm">
                Status: {evaluation.status?.replace('_', ' ')}
              </span>
              <span className="text-xs font-semibold text-slate-600">Batch {student.batch}</span>
            </div>
            <h2 className="text-2xl font-black mt-2">
              {evaluation.eligible ? 'Promotion Eligibility Confirmed!' : 'Promotion Pending Requirements'}
            </h2>
            <p className="text-xs mt-1 leading-relaxed opacity-90 max-w-2xl">{evaluation.summary}</p>
          </div>
        </div>

        <div className="text-right shrink-0 bg-white/70 p-4 rounded-2xl border border-slate-200/50">
          <p className="text-xs text-slate-500 font-medium">Passed Subjects</p>
          <p className="text-2xl font-extrabold text-slate-900">{evaluation.passedSubjectsCount} / {evaluation.totalSubjectsCount}</p>
          {evaluation.additionalSubjectsNeeded > 0 && (
            <p className="text-xs text-rose-600 font-bold mt-1">Need {evaluation.additionalSubjectsNeeded} more subjects</p>
          )}
        </div>
      </div>

      {/* Promotion Regulations Conditions Checklist */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-bold text-slate-900 text-lg">Institutional Promotion Rules & Condition Verification</h2>

        <div className="space-y-4">
          {conditions.map((cond, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {cond.satisfied ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{cond.name}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Required: <span className="font-semibold text-slate-700">{cond.required}</span> | Actual: <span className="font-semibold text-slate-900">{cond.actual}</span>
                  </p>
                  <p className={`text-xs font-medium mt-1 ${cond.satisfied ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {cond.details}
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                cond.satisfied ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {cond.satisfied ? 'PASSED' : 'NOT SATISFIED'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
