'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Terminal,
  ShieldCheck,
  CreditCard,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Users,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface LogItem {
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export default function PendingCheckPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogItem[]>([]);

  const runVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pending/check', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Update process failed');
      }
      setResult(data);
      if (Array.isArray(data.logs)) {
        setLogs(data.logs);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      if (err.logs) {
        setLogs(err.logs);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runVerification();
  }, []);

  const team = result?.team || {
    team_name: 'Bytestrom',
    college_name: 'Sri Venkateshwaraa College of Engineering and Technology',
    category: 'Project Pitch',
    leader_name: 'Vaishali I',
    leader_email: 'vaishali24td0852@svcet.ac.in',
    leader_phone: '9600805734',
    amount_paid: 796.0,
    razorpay_payment_id: 'pay_TXaiDvC9m9PsEa',
    payment_status: 'success',
    project_title: 'VOICE4HEALTH : AI-Powered Voice Healthcare for Every Phone — Enable From the First Call',
    domain: 'Health care',
    project_description:
      'AI-Powered Voice Healthcare for Every Phone — Enable From the First Call Voice4Health is an AI-powered, voice-first healthcare system designed to provide accessible preliminary healthcare screening through a basic phone by calling 103, without requiring a smartphone, continuous internet access, or advanced digital literacy.',
    members: [
      { student_name: 'Vaishali I', email: 'vaishali24td0852@svcet.ac.in', phone: '9600805734', department: 'B.Tech CSE', year_of_study: '3rd Year', is_leader: true },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FDFBFD] text-gray-900 pb-20 selection:bg-purple-100">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C3B8F] to-[#E83E8C] flex items-center justify-center text-white shadow-md shadow-purple-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  ShePitch College Name Update
                </h1>
                <span className="bg-purple-100 text-[#6C3B8F] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  MANUAL SYNC
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Target: Bytestrom (Leader: vaishali24td0852@svcet.ac.in)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/teams"
              className="text-xs font-semibold text-gray-600 hover:text-[#6C3B8F] px-3 py-2 rounded-xl hover:bg-purple-50 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Admin Teams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={runVerification}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C3B8F] to-[#8E44AD] hover:opacity-95 shadow-md shadow-purple-300/40 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Updating...' : 'Re-run Sync'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Status Alert Banner */}
        {loading ? (
          <div className="bg-purple-50/80 border border-purple-200 p-5 rounded-3xl flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-[#6C3B8F] animate-spin shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-purple-900">Updating College Name...</h3>
              <p className="text-xs text-purple-700 mt-0.5">
                Updating college name to <strong>Sri Venkateshwaraa College of Engineering and Technology</strong> for team <strong>Bytestrom</strong> in MySQL.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900">College Name Update Failed</h3>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
              <button
                onClick={runVerification}
                className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Retry Update
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                College Name Successfully Updated!
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Team <strong>Bytestrom</strong> is now linked to <strong>Sri Venkateshwaraa College of Engineering and Technology</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Live Execution Logs Window */}
        <div className="bg-gray-950 text-gray-100 rounded-3xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="px-5 py-3.5 bg-gray-900/90 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono font-bold text-gray-300">
                Execution Logs & Audit Trail
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-gray-400">Live Process</span>
            </div>
          </div>

          <div className="p-5 font-mono text-xs space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">Waiting for update output...</div>
            ) : (
              logs.map((log, idx) => {
                const badgeColor =
                  log.level === 'success'
                    ? 'text-emerald-400 bg-emerald-950/70 border-emerald-800'
                    : log.level === 'error'
                    ? 'text-rose-400 bg-rose-950/70 border-rose-800'
                    : log.level === 'warn'
                    ? 'text-amber-400 bg-amber-950/70 border-amber-800'
                    : 'text-purple-300 bg-purple-950/70 border-purple-800';

                return (
                  <div key={idx} className="flex items-start gap-3 py-1 leading-relaxed">
                    <span className="text-gray-500 shrink-0 select-none">[{log.timestamp}]</span>
                    <span
                      className={`uppercase text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${badgeColor} shrink-0`}
                    >
                      {log.level}
                    </span>
                    <span
                      className={`break-words ${
                        log.level === 'success'
                          ? 'text-emerald-300 font-semibold'
                          : log.level === 'error'
                          ? 'text-rose-300'
                          : log.level === 'warn'
                          ? 'text-amber-200'
                          : 'text-gray-200'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Updated Team Overview Card */}
        <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
          {/* Card Top */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#6C3B8F]/10 text-[#6C3B8F] uppercase tracking-wider">
                {team.category || 'PROJECT PITCH'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                {team.team_name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-700 font-semibold mt-1">
                <Building2 className="w-4 h-4 text-[#6C3B8F]" />
                <span className="text-[#6C3B8F] bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">
                  {team.college_name}
                </span>
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 min-w-[220px]">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Payment Summary
              </div>
              <div className="text-2xl font-black text-gray-900 mt-0.5">
                ₹{Number(team.amount_paid).toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Success
                </span>
                <span className="text-[11px] font-mono text-gray-600 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {team.razorpay_payment_id || 'pay_TXaiDvC9m9PsEa'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Pitch Proposal Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leader Contact */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Leader Contact
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#6C3B8F]" />
                  <span>{team.leader_name}</span>
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <a href={`mailto:${team.leader_email}`} className="hover:text-[#6C3B8F] underline">
                    {team.leader_email}
                  </a>
                </div>
                <div className="text-xs text-gray-600 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{team.leader_phone}</span>
                </div>
              </div>
            </div>

            {/* Pitch Domain */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Domain & Category
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-[#6C3B8F] border border-purple-100">
                  {team.domain || 'Health care'}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                {team.project_title}
              </p>
            </div>
          </div>

          {/* Pitch Proposal Details */}
          <div className="bg-purple-50/30 rounded-2xl p-5 border border-purple-100 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6C3B8F]">
              Pitch Proposal
            </div>
            <h4 className="text-sm font-black text-gray-900">{team.project_title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {team.project_description}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
