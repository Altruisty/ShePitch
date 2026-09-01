'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Mail,
  CreditCard,
  Building2,
  Users,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Play,
  Check,
} from 'lucide-react';
import AnimatedTitle from '@/components/AnimatedTitle';

export default function PendingPaymentCheckPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);

  const runPaymentCheck = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/pending/check', { cache: 'no-store' });
      const data = await res.json();

      if (data.logs) {
        setLogs(data.logs);
      }

      if (data.results) {
        setResults(data.results);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete payment check.');
      }

      setLastExecuted(new Date().toLocaleTimeString());
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during execution.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPaymentCheck();
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
        <span className="she-category-tag bg-purple-50 text-purple-800 border-purple-200 text-xs">
          ADMIN UTILITY & LOG AUDITOR
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                PAYMENT RECOVERY
              </span>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                LIVE AUDIT LOGS
              </span>
            </div>
            <AnimatedTitle
              text="Pending Payment Status Fix & Verification"
              gradientWords={['Status', 'Fix', 'Verification']}
              mobileBreakWords={['Payment', 'Fix']}
              className="text-2xl sm:text-4xl font-black text-gray-900 leading-tight"
            />
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Verify Razorpay receipts, update database records to <strong className="text-gray-900">SUCCESS</strong>, and dispatch automated confirmation emails for pending teams.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={runPaymentCheck}
              disabled={loading}
              className="she-btn-primary py-3.5 px-6 text-xs sm:text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Check...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Fix & Sync Now</span>
                </>
              )}
            </button>
            {lastExecuted && (
              <span className="text-[10px] text-center text-gray-500 font-semibold">
                Last checked at {lastExecuted}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TARGET TEAMS OVERVIEW CARDS */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#6C3B8F]" />
          Target Pending Payment Teams
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team 1 Card: Techtonic */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
                  TEAM 01
                </span>
                <h4 className="text-xl font-black text-gray-900">Techtonic</h4>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> ₹398.00 Paid
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Leader:</span>
                <span className="font-extrabold text-gray-900">Kavyashree.P</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Leader Email:</span>
                <span className="font-bold text-[#6C3B8F]">kavyashree0521@gmail.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">College:</span>
                <span className="font-medium text-gray-800">ST JOSEPH COLLEGE OF ENGINEERING</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Razorpay Payment ID:</span>
                <span className="font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-900">
                  pay_TWHhyYyzsBmOIc
                </span>
              </div>
            </div>
          </div>

          {/* Team 2 Card: Infinite loop */}
          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider block">
                  TEAM 02
                </span>
                <h4 className="text-xl font-black text-gray-900">Infinite loop</h4>
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> ₹398.00 Paid
              </span>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Leader:</span>
                <span className="font-extrabold text-gray-900">Vaishnavi s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Leader Email:</span>
                <span className="font-bold text-[#6C3B8F]">vaishnavishanumgam@gmail.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">College:</span>
                <span className="font-medium text-gray-800">ST JOSEPH COLLEGE OF ENGINEERING</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-semibold">Razorpay Payment ID:</span>
                <span className="font-mono font-bold bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-900">
                  pay_TWHTZ4VVCPB0Hn
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <p>Executing payment check & retrieving logs...</p>
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
