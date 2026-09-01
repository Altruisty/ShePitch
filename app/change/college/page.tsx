'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Terminal,
  ArrowLeft,
  Search,
  Users,
  ShieldAlert,
  Play,
} from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function ChangeCollegePage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [removedTeams, setRemovedTeams] = useState<any[]>([]);
  const [stats, setStats] = useState({ teamsRemoved: 0, studentsRemoved: 0 });
  const [customCollege, setCustomCollege] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);

  const runCollegeCleanup = async (queryParam?: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const url = queryParam
        ? `/api/change/college?query=${encodeURIComponent(queryParam)}`
        : '/api/change/college';

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (data.logs) {
        setLogs(data.logs);
      }

      if (data.removedTeamsList) {
        setRemovedTeams(data.removedTeamsList);
      }

      setStats({
        teamsRemoved: data.teamsRemoved || 0,
        studentsRemoved: data.studentsRemoved || 0,
      });

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete college teams cleanup.');
      }

      setLastExecuted(new Date().toLocaleTimeString());
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during execution.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCollegeCleanup();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-8">
      {/* Back & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-[#6C3B8F] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
        <span className="she-category-tag bg-red-50 text-red-700 border-red-200 text-xs">
          DATABASE CLEANUP UTILITY
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                TEAM REMOVAL
              </span>
              <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                SIVA & MATHIYAS COLLEGES
              </span>
            </div>
            <AnimatedTitle
              text="College Teams Removal & Cleanup Utility"
              gradientWords={['Removal', 'Cleanup', 'Utility']}
              mobileBreakWords={['College', 'Cleanup']}
              className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight"
            />
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Remove all registered teams and student members from <strong className="text-gray-900">Siva Engineering College</strong> and <strong className="text-gray-900">Mathiyas Engineering College</strong> with real-time audit logging.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => runCollegeCleanup()}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white py-3.5 px-6 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Removing Teams...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Remove Siva & Mathiyas Teams</span>
                </>
              )}
            </button>
            {lastExecuted && (
              <span className="text-[10px] text-center text-gray-500 font-semibold">
                Last executed at {lastExecuted}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TARGET COLLEGES SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-gray-900">Siva Engineering College</h4>
              <span className="text-xs text-gray-500">Matching keyword: &quot;siva&quot;</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            All teams registered under Siva Engineering College will have their team records, student roster, and payment logs removed.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-gray-900">Mathiyas Engineering College</h4>
              <span className="text-xs text-gray-500">Matching keywords: &quot;mathiyas&quot; / &quot;mathias&quot;</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            All teams registered under Mathiyas Engineering College will have their team records, student roster, and payment logs removed.
          </p>
        </div>
      </div>

      {/* CUSTOM COLLEGE CLEANUP SEARCH BAR */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#6C3B8F]" />
          Custom College Keyword Cleanup (Optional)
        </h4>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            placeholder="Enter college name keyword (e.g. Siva, Mathiyas)..."
            value={customCollege}
            onChange={(e) => setCustomCollege(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-gray-900"
          />
          <button
            onClick={() => customCollege.trim() && runCollegeCleanup(customCollege.trim())}
            disabled={loading || !customCollege.trim()}
            className="w-full sm:w-auto bg-[#6C3B8F] hover:bg-[#5a2e7a] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Custom Cleanup</span>
          </button>
        </div>
      </div>

      {/* STATS SUMMARY RESULT */}
      {lastExecuted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-sm font-black text-emerald-900">Cleanup Execution Finished</h4>
              <p className="text-xs text-emerald-700">
                Removed <strong className="font-extrabold text-emerald-900">{stats.teamsRemoved}</strong> team(s) and <strong className="font-extrabold text-emerald-900">{stats.studentsRemoved}</strong> student member record(s).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LIVE LOG CONSOLE / TERMINAL */}
      <div className="bg-[#0c0814] rounded-3xl border border-purple-900/50 shadow-2xl overflow-hidden space-y-0">
        {/* Terminal Header */}
        <div className="bg-[#170e26] px-5 py-3.5 border-b border-purple-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <span className="text-purple-300 font-mono font-bold ml-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-[#E83E8C]" />
              Execution Audit Log Terminal
            </span>
          </div>

          <span className="text-purple-400/70 font-mono text-[11px]">
            {logs.length} Log Entries Recorded
          </span>
        </div>

        {/* Terminal Body */}
        <div className="p-5 font-mono text-xs max-h-[420px] overflow-y-auto space-y-2.5 leading-relaxed text-gray-200">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-mono space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
              <p>Executing college teams removal & retrieving logs...</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 hover:bg-white/5 p-1 rounded transition-all">
                <span className="text-gray-500 shrink-0 text-[11px] font-mono select-none">
                  [{log.timestamp}]
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 font-sans tracking-wide ${
                    log.level === 'success'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : log.level === 'warn'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : log.level === 'error'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {log.level}
                </span>

                <span
                  className={`flex-1 break-words font-mono ${
                    log.level === 'success'
                      ? 'text-green-300 font-semibold'
                      : log.level === 'warn'
                      ? 'text-yellow-200'
                      : log.level === 'error'
                      ? 'text-red-300 font-bold'
                      : 'text-gray-300'
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
