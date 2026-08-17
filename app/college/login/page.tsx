'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function CollegeLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/college/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/college/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12071f] via-[#240e38] to-[#12071f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#6C3B8F]/30 to-[#E83E8C]/30 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-[#6C3B8F] mb-2 shadow-xl">
            <Building2 className="w-9 h-9 text-[#E83E8C]" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">College Partner Portal</h1>
          <p className="text-gray-400 text-sm">ShePitch 2026 Institutional Representative Login</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-8 rounded-3xl shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">College Username</label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter college username"
                  className="w-full bg-black/30 border border-white/15 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#E83E8C] focus:ring-1 focus:ring-[#E83E8C] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter college password"
                  className="w-full bg-black/30 border border-white/15 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#E83E8C] focus:ring-1 focus:ring-[#E83E8C] transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full she-btn-primary justify-center py-3.5 text-sm font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-[#E83E8C]/30 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to College Dashboard'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
