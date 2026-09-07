'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Terminal,
  RefreshCw,
  Mail,
  Send,
  Copy,
  Check,
  ShieldCheck,
  Users,
  CreditCard,
  Building2,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

interface TeamMember {
  student_name: string;
  email: string;
  phone: string;
  department?: string;
  is_leader?: boolean | number;
}

interface ProcessedTeam {
  teamId: number;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  collegeName: string;
  previousCategory: string;
  newCategory: string;
  isChanged: boolean;
  paymentStatus: string;
  paymentId?: string;
  amountPaid: number;
  projectTitle?: string;
  domain?: string;
  projectDescription?: string;
  membersCount: number;
  members: TeamMember[];
  emailSent: boolean;
  updatedAt: string;
}

export default function CategoryChangeCheckPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<ProcessedTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [resendingEmailId, setResendingEmailId] = useState<number | null>(null);
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ [key: number]: { success: boolean; message: string } }>({});

  // Custom search/modify controls
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customCategory, setCustomCategory] = useState<'Idea Pitch' | 'Project Pitch'>('Project Pitch');

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    runCategoryCheck();
  }, []);

  const runCategoryCheck = async (isCustom = false) => {
    setIsLoading(true);
    setEmailStatusMsg({});
    try {
      let url = '/api/change/check';
      if (isCustom && searchQuery.trim()) {
        const params = new URLSearchParams({
          search: searchQuery.trim(),
          category: customCategory,
        });
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (data.logs && Array.isArray(data.logs)) {
        setLogs((prev) => [...prev, ...data.logs]);
      }

      if (data.success && data.results) {
        setResults(data.results.filter((r: any) => r.teamId));
      }
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          level: 'error',
          message: `Request Error: ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendMail = async (team: ProcessedTeam) => {
    setResendingEmailId(team.teamId);
    setEmailStatusMsg((prev) => ({ ...prev, [team.teamId]: { success: false, message: 'Sending updated email...' } }));

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLogs((prev) => [
      ...prev,
      {
        timestamp: now,
        level: 'info',
        message: `Triggered Updated Confirmation Mail for "${team.teamName}" with category "${team.newCategory}" to ${team.leaderEmail}...`,
      },
    ]);

    try {
      const res = await fetch('/api/change/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resend_email',
          team_id: team.teamId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setEmailStatusMsg((prev) => ({
          ...prev,
          [team.teamId]: { success: true, message: `Email delivered to ${team.leaderEmail}!` },
        }));
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            level: 'success',
            message: `Updated confirmation email delivered successfully to ${team.leaderEmail}.`,
          },
        ]);
      } else {
        setEmailStatusMsg((prev) => ({
          ...prev,
          [team.teamId]: { success: false, message: data.error || 'Failed to dispatch email.' },
        }));
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            level: 'error',
            message: `Failed to dispatch email: ${data.error || 'Unknown error'}`,
          },
        ]);
      }
    } catch (err: any) {
      setEmailStatusMsg((prev) => ({
        ...prev,
        [team.teamId]: { success: false, message: `Error: ${err.message}` },
      }));
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          level: 'error',
          message: `Network error resending email: ${err.message}`,
        },
      ]);
    } finally {
      setResendingEmailId(null);
    }
  };

  const copyLogsToClipboard = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-gradient-to-br from-[#E83E8C]/20 to-[#6C3B8F]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-[#6C3B8F] text-xs font-bold mb-3">
              <ArrowLeftRight className="w-4 h-4 text-[#6C3B8F]" />
              ShePitch Category Resolver & Auditor
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Team Category Swap & Update
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Automated category updater for registered ShePitch teams. Updates track category in the database, preserves all payment and registration details, and sends updated confirmation receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => runCategoryCheck(false)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] hover:opacity-90 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Processing Swap...' : 'Run Category Swap'}
            </button>
            <button
              onClick={() => setShowManualSearch(!showManualSearch)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200 cursor-pointer"
            >
              <Search className="w-4 h-4 text-gray-500" />
              Custom Change
              {showManualSearch ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Custom Change Accordion */}
        {showManualSearch && (
          <div className="mt-6 pt-6 border-t border-gray-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Team Name or Leader Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. HerKnee IQ or akshayaakiruba96@gmail.com"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C3B8F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Target Category
                </label>
                <div className="flex gap-2">
                  <select
                    value={customCategory}
                    onChange={(e: any) => setCustomCategory(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C3B8F]"
                  >
                    <option value="Idea Pitch">Idea Pitch</option>
                    <option value="Project Pitch">Project Pitch</option>
                  </select>
                  <button
                    onClick={() => runCategoryCheck(true)}
                    disabled={isLoading || !searchQuery.trim()}
                    className="px-4 py-2.5 bg-[#6C3B8F] text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-[#582e75] disabled:opacity-50 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Category Modifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1: HerKnee IQ */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 rounded-3xl border border-purple-200 shadow-sm relative overflow-hidden space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#6C3B8F] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#6C3B8F]" /> Target Team 1
              </div>
              <h3 className="text-xl font-black text-gray-900 mt-1">HerKnee IQ</h3>
              <p className="text-xs text-gray-500">SRM Institute of Science and Technology</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Paid ₹897.00
            </span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-purple-100 flex items-center justify-between">
            <div className="text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <div className="text-xs font-bold text-gray-500 line-through">Idea Pitch</div>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-600 animate-pulse" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-[#6C3B8F] uppercase">To (New Category)</span>
              <div className="text-xs font-extrabold text-[#6C3B8F] bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
                Project Pitch
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <div>Leader: <span className="font-semibold text-gray-800">Akshayaa K V</span> (akshayaakiruba96@gmail.com)</div>
            <div className="font-mono text-[11px] text-gray-500">Razorpay ID: pay_TZA4kewwRzNsZ8</div>
          </div>
        </div>

        {/* Team 2: She Builds */}
        <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6 rounded-3xl border border-pink-200 shadow-sm relative overflow-hidden space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#E83E8C] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E83E8C]" /> Target Team 2
              </div>
              <h3 className="text-xl font-black text-gray-900 mt-1">She Builds</h3>
              <p className="text-xs text-gray-500">SRI VENKATESHWARA COLLEGE OF ENGINEERING</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Paid ₹398.00
            </span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-pink-100 flex items-center justify-between">
            <div className="text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <div className="text-xs font-bold text-gray-500 line-through">Project Pitch</div>
            </div>
            <ArrowRight className="w-5 h-5 text-pink-600 animate-pulse" />
            <div className="text-center">
              <span className="text-[10px] font-bold text-[#E83E8C] uppercase">To (New Category)</span>
              <div className="text-xs font-extrabold text-[#E83E8C] bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-300">
                Idea Pitch
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <div>Leader: <span className="font-semibold text-gray-800">S.SWATHY</span> (swathy25tp0444@svcet.ac.in)</div>
            <div className="font-mono text-[11px] text-gray-500">Razorpay ID: pay_TXc8rBRAUUeV6z</div>
          </div>
        </div>
      </div>

      {/* Results Section (When Live Teams are Updated) */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Live Updated Teams ({results.length})
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {results.map((team) => (
              <div
                key={team.teamId}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-lg relative overflow-hidden"
              >
                <div className="relative z-10 space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                        <h3 className="text-2xl font-black text-gray-900">{team.teamName}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Category: {team.newCategory}
                        </span>
                        {team.isChanged && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            Swapped from {team.previousCategory}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {team.collegeName} • Team ID #{team.teamId}
                      </div>
                    </div>

                    {/* Resend Email Button */}
                    <div className="flex flex-col sm:items-end gap-2">
                      <button
                        onClick={() => handleResendMail(team)}
                        disabled={resendingEmailId === team.teamId}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] hover:opacity-90 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                      >
                        {resendingEmailId === team.teamId ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Dispatching Email...
                          </>
                        ) : (
                          <>
                            <Mail className="w-3.5 h-3.5" />
                            Resend Updated Mail
                          </>
                        )}
                      </button>

                      {emailStatusMsg[team.teamId] && (
                        <div
                          className={`text-xs font-semibold ${
                            emailStatusMsg[team.teamId].success ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {emailStatusMsg[team.teamId].message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">New Category</div>
                      <div className="text-sm font-extrabold text-[#6C3B8F] mt-0.5">
                        {team.newCategory}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment Status</div>
                      <div className="text-sm font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Check className="w-4 h-4" /> {team.paymentStatus.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount Paid</div>
                      <div className="text-sm font-extrabold text-gray-900 mt-0.5">
                        ₹{team.amountPaid?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Leader Contact</div>
                      <div className="text-xs font-semibold text-gray-800 mt-0.5 truncate" title={team.leaderEmail}>
                        {team.leaderName}
                      </div>
                    </div>
                  </div>

                  {/* Team Members Roster */}
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      Team Members ({team.members?.length || 0})
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {team.members && team.members.length > 0 ? (
                        team.members.map((member, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-gray-200 rounded-xl flex flex-col justify-between text-xs space-y-1"
                          >
                            <div className="font-bold text-gray-900 flex items-center justify-between">
                              <span>{member.student_name}</span>
                              {idx === 0 && (
                                <span className="text-[10px] bg-purple-100 text-[#6C3B8F] font-bold px-1.5 py-0.5 rounded">
                                  Leader
                                </span>
                              )}
                            </div>
                            <div className="text-gray-500 text-[11px] truncate" title={member.email}>
                              {member.email}
                            </div>
                            <div className="font-mono text-gray-600 text-[11px]">{member.phone}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400 italic">No member rows found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Terminal Console */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="bg-[#1e293b] px-4 py-3 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>
            <div className="text-slate-300 font-bold ml-2 flex items-center gap-2 text-xs">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Real-time Audit Execution Console
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLogsToClipboard}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              {copiedLogs ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedLogs ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={clearLogs}
              className="text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-4 sm:p-6 max-h-[420px] overflow-y-auto space-y-2 leading-relaxed select-text">
          {logs.length === 0 ? (
            <div className="text-slate-500 italic">No execution logs captured yet. Click "Run Category Swap" above.</div>
          ) : (
            logs.map((log, index) => {
              let levelColor = 'text-sky-400';
              let badgeBg = 'bg-sky-950 text-sky-400 border-sky-800';

              if (log.level === 'success') {
                levelColor = 'text-emerald-400';
                badgeBg = 'bg-emerald-950 text-emerald-400 border-emerald-800';
              } else if (log.level === 'warn') {
                levelColor = 'text-amber-400';
                badgeBg = 'bg-amber-950 text-amber-400 border-amber-800';
              } else if (log.level === 'error') {
                levelColor = 'text-rose-400';
                badgeBg = 'bg-rose-950 text-rose-400 border-rose-800';
              }

              return (
                <div key={index} className="flex items-start gap-2.5 hover:bg-slate-800/40 p-1 rounded transition-colors">
                  <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border shrink-0 select-none ${badgeBg}`}
                  >
                    {log.level}
                  </span>
                  <span className={`break-all ${levelColor}`}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Footer */}
        <div className="bg-[#1e293b]/60 px-4 py-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Targets: HerKnee IQ ➔ Project Pitch | She Builds ➔ Idea Pitch</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            API Route: /api/change/check
          </span>
        </div>
      </div>

      {/* Deployment & Execution Guide for User */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#6C3B8F]" />
          Production Deployment Instructions
        </h3>
        <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1.5 leading-relaxed">
          <li>
            Commit and push these 2 new files to your GitHub repository:
            <code className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-purple-700 font-bold">
              app/change/check/page.tsx
            </code>
            and
            <code className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-purple-700 font-bold">
              app/api/change/check/route.ts
            </code>
          </li>
          <li>
            Deploy or pull to your production server hosting <span className="font-semibold text-gray-800">shepitch.com</span>.
          </li>
          <li>
            Open{' '}
            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              https://shepitch.com/change/check
            </span>
            .
          </li>
          <li>
            The page will automatically connect to your production database, update{' '}
            <span className="font-bold text-gray-800">HerKnee IQ</span> from{' '}
            <span className="text-purple-700 font-bold">Idea Pitch</span> ➔{' '}
            <span className="text-purple-700 font-bold">Project Pitch</span>, and update{' '}
            <span className="font-bold text-gray-800">She Builds</span> from{' '}
            <span className="text-pink-700 font-bold">Project Pitch</span> ➔{' '}
            <span className="text-pink-700 font-bold">Idea Pitch</span>.
          </li>
          <li>
            You can verify every step live right here in the terminal logs, and click the{' '}
            <span className="font-bold text-purple-700">"Resend Updated Mail"</span> button anytime!
          </li>
        </ol>
      </div>
    </div>
  );
}
