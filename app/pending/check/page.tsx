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
  category: string;
  projectTitle?: string;
  domain?: string;
  projectDescription?: string;
  previousStatus: string;
  newStatus: string;
  paymentId: string;
  amount: number;
  membersCount: number;
  members: TeamMember[];
  emailSent: boolean;
  fixedAt: string;
}

export default function PendingCheckPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<ProcessedTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [resendingEmailId, setResendingEmailId] = useState<number | null>(null);
  const [emailStatusMsg, setEmailStatusMsg] = useState<{ [key: number]: { success: boolean; message: string } }>({});
  
  // Custom manual search/fix controls
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customPaymentId, setCustomPaymentId] = useState('TZ2tdG3KO0GX0D');
  const [customAmount, setCustomAmount] = useState('796');

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Execute verification on mount
  useEffect(() => {
    runVerification();
  }, []);

  const runVerification = async (isCustom = false) => {
    setIsLoading(true);
    setEmailStatusMsg({});
    try {
      let url = '/api/pending/check';
      if (isCustom && searchQuery.trim()) {
        const params = new URLSearchParams({
          search: searchQuery.trim(),
          paymentId: customPaymentId.trim(),
          amount: customAmount.trim(),
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
          message: `Network or Server Request Failed: ${err.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendMail = async (team: ProcessedTeam) => {
    setResendingEmailId(team.teamId);
    setEmailStatusMsg((prev) => ({ ...prev, [team.teamId]: { success: false, message: 'Sending email...' } }));

    // Append log
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setLogs((prev) => [
      ...prev,
      {
        timestamp: now,
        level: 'info',
        message: `Triggered Resend Confirmation Email for "${team.teamName}" (ID #${team.teamId}) to ${team.leaderEmail}...`,
      },
    ]);

    try {
      const res = await fetch('/api/pending/check', {
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
          [team.teamId]: { success: true, message: `Email successfully sent to ${team.leaderEmail}!` },
        }));
        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            level: 'success',
            message: `Confirmation email delivered successfully to ${team.leaderEmail}.`,
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
            message: `Email dispatch failed: ${data.error || 'Unknown error'}`,
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
              <ShieldCheck className="w-4 h-4 text-[#6C3B8F]" />
              ShePitch Payment Auditor & Resolver
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Pending Team Payment Resolution
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-2xl">
              Automated fixer for teams whose payment succeeded on Razorpay but remained marked as pending in the database. Updates status to <span className="font-bold text-emerald-600">Success</span>, registers payment ID, and dispatches confirmation receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => runVerification(false)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] hover:opacity-90 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Running Check...' : 'Re-Run Default Check'}
            </button>
            <button
              onClick={() => setShowManualSearch(!showManualSearch)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200 cursor-pointer"
            >
              <Search className="w-4 h-4 text-gray-500" />
              Custom Search
              {showManualSearch ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Custom Search Form Dropdown */}
        {showManualSearch && (
          <div className="mt-6 pt-6 border-t border-gray-200/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Team Name or Leader Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nextgen minds or divyasankar.in7@gmail.com"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C3B8F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Payment ID
                </label>
                <input
                  type="text"
                  placeholder="TZ2tdG3KO0GX0D"
                  value={customPaymentId}
                  onChange={(e) => setCustomPaymentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C3B8F]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="796"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#6C3B8F]"
                  />
                  <button
                    onClick={() => runVerification(true)}
                    disabled={isLoading || !searchQuery.trim()}
                    className="px-4 py-2.5 bg-[#6C3B8F] text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-[#582e75] disabled:opacity-50 cursor-pointer"
                  >
                    Verify & Fix
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Target Pending Team Notice / Overview */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl p-5 border border-purple-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#6C3B8F] uppercase tracking-wider">Target Team Configured</div>
            <div className="text-sm font-extrabold text-gray-900">
              Nextgen minds • KINGS ENGINEERING COLLEGE (Idea Pitch)
            </div>
            <div className="text-xs text-gray-600">
              Leader: <span className="font-semibold text-gray-800">T.S.Divya</span> (divyasankar.in7@gmail.com) • Payment ID: <span className="font-mono font-semibold text-purple-700">pay_TZ2tdG3KO0GX0D</span> (₹796.00)
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 rounded-full text-xs font-bold">
            Pending ➔ Success
          </span>
          <span className="px-3 py-1 bg-purple-100 border border-purple-300 text-[#6C3B8F] rounded-full text-xs font-bold">
            4 Members
          </span>
        </div>
      </div>

      {/* Results Section (If Team is Found & Fixed) */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Verified & Updated Team ({results.length})
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {results.map((team) => (
              <div
                key={team.teamId}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-2xl font-black text-gray-900">{team.teamName}</h3>
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Payment: {team.newStatus}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#6C3B8F]">
                          {team.category}
                        </span>
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
                            Resend Confirmation Mail
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

                  {/* Financial & Status Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payment Status</div>
                      <div className="text-sm font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <Check className="w-4 h-4" /> SUCCESS
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount Paid</div>
                      <div className="text-sm font-extrabold text-gray-900 mt-0.5">
                        ₹{team.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Razorpay Payment ID</div>
                      <div className="text-xs font-mono font-bold text-purple-700 mt-0.5 break-all">
                        {team.paymentId}
                      </div>
                    </div>
                  </div>

                  {/* Project Details (if present) */}
                  {team.projectTitle && (
                    <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
                      <div className="text-xs font-bold text-[#6C3B8F] uppercase tracking-wider">
                        Pitch Proposal • {team.domain || 'General'}
                      </div>
                      <div className="text-sm font-bold text-gray-900">{team.projectTitle}</div>
                      {team.projectDescription && (
                        <div className="text-xs text-gray-600 line-clamp-2">{team.projectDescription}</div>
                      )}
                    </div>
                  )}

                  {/* Team Members Roster */}
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      Team Roster ({team.members?.length || 0} Registered Members)
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {team.members && team.members.length > 0 ? (
                        team.members.map((member, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                {member.student_name}
                                {idx === 0 && (
                                  <span className="text-[10px] bg-purple-100 text-[#6C3B8F] font-bold px-1.5 py-0.5 rounded">
                                    Leader
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-500 text-[11px]">{member.email}</div>
                              {member.department && (
                                <div className="text-gray-400 text-[10px]">{member.department}</div>
                              )}
                            </div>
                            <div className="font-mono text-gray-600 text-[11px]">{member.phone}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400 italic">No member rows retrieved.</div>
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
            <div className="text-slate-500 italic">No execution logs captured yet. Click "Re-Run Default Check" above.</div>
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
          <span>Target Payment ID: pay_TZ2tdG3KO0GX0D</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            API Route: /api/pending/check
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
            Commit and push these files to your GitHub repository:
            <code className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-purple-700 font-bold">
              app/pending/check/page.tsx
            </code>
            and
            <code className="mx-1 px-2 py-0.5 bg-gray-100 rounded text-purple-700 font-bold">
              app/api/pending/check/route.ts
            </code>
          </li>
          <li>
            Deploy or pull to your production server hosting <span className="font-semibold text-gray-800">shepitch.com</span>.
          </li>
          <li>
            Navigate to{' '}
            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              https://shepitch.com/pending/check
            </span>
            .
          </li>
          <li>
            The page will automatically load, connect to your production MySQL database, find team{' '}
            <span className="font-bold text-gray-800">Nextgen minds</span>, update their payment status from{' '}
            <span className="text-amber-600 font-bold">pending</span> to{' '}
            <span className="text-emerald-600 font-bold">success</span>, link payment ID{' '}
            <span className="font-mono text-purple-700 font-bold">pay_TZ2tdG3KO0GX0D</span>, and send the official confirmation email to{' '}
            <span className="font-semibold text-gray-800">divyasankar.in7@gmail.com</span>.
          </li>
          <li>
            You can verify every step live right here in the terminal logs, and click the{' '}
            <span className="font-bold text-purple-700">"Resend Confirmation Mail"</span> button anytime!
          </li>
        </ol>
      </div>
    </div>
  );
}
