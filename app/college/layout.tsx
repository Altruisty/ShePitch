'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, Users, Key, LogOut, ShieldCheck } from 'lucide-react';

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname() || '/college/dashboard';
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/college/login') {
      setLoading(false);
      return;
    }

    fetch('/api/auth/college/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setCollege(data.college);
        } else {
          router.push('/college/login');
        }
      })
      .catch(() => {
        router.push('/college/login');
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/college/logout', { method: 'POST' });
    router.push('/college/login');
  };

  if (pathname === '/college/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#E83E8C] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verifying College Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
      {/* Top Header Navbar */}
      <header className="bg-[#1a0b28] text-white sticky top-0 z-40 shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C3B8F] to-[#E83E8C] flex items-center justify-center font-extrabold text-sm shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white">{college?.college_name || 'College Portal'}</h1>
              <span className="text-xs text-gray-400">Representative: {college?.rep_name || 'Partner Account'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/college/dashboard"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                pathname === '/college/dashboard' ? 'bg-[#E83E8C] text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4" /> Registered Teams
            </Link>
            <Link
              href="/college/profile"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                pathname === '/college/profile' ? 'bg-[#E83E8C] text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Key className="w-4 h-4" /> Change Password
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500/20 text-red-300 hover:bg-red-500/30 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">{children}</main>
    </div>
  );
}
