'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Terminal,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  CreditCard,
  Users,
  Building,
  Mail,
  Phone,
  FileText,
} from 'lucide-react';

export default function PendingCheckPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultTeam, setResultTeam] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-run once on page mount
  useEffect(() => {
    runCheck();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runCheck = async () => {
    setLoading(true);
    setStatus('running');
    setErrorMessage(null);
    setLogs(['[System] Initializing request to /api/pending/check...']);

    try {
      const res = await fetch('/api/pending/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }

      if (data.success) {
        setStatus('success');
        setResultTeam(data.team);
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Payment check encountered an issue.');
      }
    } catch (err: any) {
      setStatus('error');
      const errLine = `[System Error] Network or server error: ${err.message || err}`;
      setLogs((prev) => [...prev, errLine]);
      setErrorMessage(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0d0c13] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Navigation / Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-xs font-mono text-purple-400">shepitch.com/pending/check</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <ShieldCheck className="w-3.5 h-3.5" /> Manual Payment Resolver
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-300 via-pink-300 to-purple-200 bg-clip-text text-transparent">
            Pending Payment Verification & Resolution
          </h1>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Resolves pending payment status, assigns Razorpay payment ID, updates team records, and dispatches official confirmation emails.
          </p>
        </div>

        {/* Target Team Card */}
        <div className="bg-[#161423] border border-purple-500/20 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold">
                SH
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">SHETECHX</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Idea Pitch
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-purple-400" /> SRI SAI RANGANATHAN COLLEGE OF ENGINEERING
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400">Target Payment ID</div>
              <div className="text-sm font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg mt-0.5 inline-block">
                pay_TZuA4TSm1JUfVQ
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Leader Contact
              </span>
              <p className="font-semibold text-white">K.NEHA</p>
              <p className="text-gray-300 text-[11px] flex items-center gap-1">
                <Mail className="w-3 h-3 text-gray-400" /> ns1922396@gmail.com
              </p>
              <p className="text-gray-300 text-[11px] flex items-center gap-1">
                <Phone className="w-3 h-3 text-gray-400" /> 6385420852
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-gray-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-400" /> Team Members (3)
              </span>
              <p className="font-semibold text-white">A.Asmitha Sri & S.Roshni</p>
              <p className="text-gray-300 text-[11px] flex items-center gap-1">
                <Mail className="w-3 h-3 text-gray-400" /> asmithaa309@gmail.com
              </p>
              <p className="text-gray-300 text-[11px] flex items-center gap-1">
                <Mail className="w-3 h-3 text-gray-400" /> roshni.army.1028@gmail.com
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-gray-400 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Fee Summary
              </span>
              <p className="font-semibold text-white text-base text-emerald-400">₹597.00</p>
              <p className="text-[11px] text-gray-400">3 Members (Idea Pitch)</p>
              <p className="text-[11px] text-purple-300">Status: Pending ➔ Paid</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-gray-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-purple-400" /> Pitch Proposal
              </span>
              <p className="font-semibold text-white truncate" title="AI-BASED SMART LOGISTICS AND ACCESSBILITY INTELLIGENCE PLATFORM FOR NORTH EASTERN REGION(NER))">
                AI-BASED SMART LOGISTICS...
              </p>
              <p className="text-[11px] text-pink-300">Transportation & Logistics</p>
              <p className="text-[11px] text-gray-400">B.E [CSE (Cyber Security)] - 2nd Yr</p>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={runCheck}
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Executing Fix & Updates...' : 'Run Payment Check & Update Now'}
              </button>

              <button
                onClick={copyLogs}
                disabled={logs.length === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Logs'}
              </button>
            </div>

            {status === 'success' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> SUCCESS: Payment Resolved & Marked as Paid!
              </div>
            )}

            {status === 'error' && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-4 h-4" /> Issue: {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Live Logs Terminal Console */}
        <div className="bg-[#12111a] border border-purple-500/30 rounded-2xl overflow-hidden shadow-2xl">
          {/* Terminal Window Header */}
          <div className="bg-[#1a1827] px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-xs font-mono text-gray-400 ml-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                terminal: shepitch.com/pending/check
              </span>
            </div>

            <div className="text-[11px] font-mono text-gray-400">
              {loading ? (
                <span className="text-yellow-400 animate-pulse">Running execution...</span>
              ) : status === 'success' ? (
                <span className="text-emerald-400">Process Completed [Exit 0]</span>
              ) : (
                <span>Ready</span>
              )}
            </div>
          </div>

          {/* Terminal Body */}
          <div className="p-4 sm:p-5 font-mono text-xs leading-relaxed max-h-[420px] overflow-y-auto space-y-1 bg-[#0b0a10]">
            {logs.length === 0 && (
              <div className="text-gray-500 italic">No logs available. Click &quot;Run Payment Check & Update Now&quot;.</div>
            )}
            {logs.map((logLine, index) => {
              const isSuccess = logLine.includes('✅') || logLine.includes('🎉') || logLine.includes('SUCCESS');
              const isWarn = logLine.includes('⚠️');
              const isError = logLine.includes('❌') || logLine.includes('Error');
              const isHeader = logLine.includes('===');
              const isHighlight = logLine.includes('🎯') || logLine.includes('🚀');

              return (
                <div
                  key={index}
                  className={`py-0.5 break-words ${
                    isHeader
                      ? 'text-purple-400 font-bold'
                      : isSuccess
                      ? 'text-emerald-400 font-medium'
                      : isWarn
                      ? 'text-yellow-300'
                      : isError
                      ? 'text-rose-400 font-bold'
                      : isHighlight
                      ? 'text-cyan-300 font-medium'
                      : 'text-gray-300'
                  }`}
                >
                  {logLine}
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Final Verified Record Card (When Successful) */}
        {resultTeam && (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              Verified Team Record in Database:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-black/30 p-2.5 rounded-lg border border-emerald-500/20">
                <span className="text-gray-400 block">Team ID</span>
                <span className="font-mono font-bold text-white">#{resultTeam.id}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-emerald-500/20">
                <span className="text-gray-400 block">Payment Status</span>
                <span className="font-bold text-emerald-400 uppercase">{resultTeam.payment_status}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-emerald-500/20">
                <span className="text-gray-400 block">Razorpay Payment ID</span>
                <span className="font-mono text-purple-300">{resultTeam.razorpay_payment_id}</span>
              </div>
              <div className="bg-black/30 p-2.5 rounded-lg border border-emerald-500/20">
                <span className="text-gray-400 block">Amount Paid</span>
                <span className="font-bold text-white">₹{resultTeam.amount_paid}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
