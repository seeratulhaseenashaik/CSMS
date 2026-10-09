import React, { useState } from 'react';
import { calculateAttendanceApi } from '../services/api';
import { Calculator, X, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function AttendanceCalculatorModal({ isOpen, onClose, initialAttended = 42, initialTotal = 60 }) {
  const [attended, setAttended] = useState(initialAttended);
  const [total, setTotal] = useState(initialTotal);
  const [futureAttended, setFutureAttended] = useState(10);
  const [targetPct, setTargetPct] = useState(75);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await calculateAttendanceApi({
        attended,
        total,
        futureAttended,
        targetThreshold: targetPct / 100,
      });
      if (res.data.success) {
        setResult(res.data.calculation);
      }
    } catch (err) {
      console.error('Calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Smart Attendance Calculator</h3>
              <p className="text-xs text-blue-100">Institutional recovery & bunk allowance engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleCalculate} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classes Attended (A)</label>
              <input
                type="number"
                min="0"
                value={attended}
                onChange={(e) => setAttended(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Conducted (T)</label>
              <input
                type="number"
                min="0"
                value={total}
                onChange={(e) => setTotal(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Threshold (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={targetPct}
                onChange={(e) => setTargetPct(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Future Classes to Attend (F)</label>
              <input
                type="number"
                min="0"
                value={futureAttended}
                onChange={(e) => setFutureAttended(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? 'Calculating...' : 'Run Calculations'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Calculation Output Cards */}
        {result && (
          <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-600">Current Attendance %</span>
              <span className={`text-base font-bold ${result.percentage >= targetPct ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.percentage}%
              </span>
            </div>

            {result.percentage < targetPct ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-bold text-amber-800">Attendance Recovery Notice</p>
                  <p className="mt-0.5">
                    Your current attendance is <span className="font-bold">{result.percentage}%</span>. You must attend the next{' '}
                    <span className="font-bold text-rose-700 text-sm underline">{result.classesNeededToReachTarget} consecutive classes</span> without missing any to reach {targetPct}%.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <p className="font-bold text-emerald-800">Threshold Satisfied!</p>
                  <p className="mt-0.5">
                    Maximum Bunk Allowance: You can miss up to{' '}
                    <span className="font-bold text-emerald-800 text-sm underline">{result.bunkAllowance} additional classes</span> while remaining at or above {targetPct}%.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Future Projection ({futureAttended} classes)</span>
              <span className="font-bold text-blue-600">{result.futurePrediction.projectedPercentage}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
