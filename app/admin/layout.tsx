'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Mail,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname() || '/admin/dashboard';
  const router = useRouter();

  useEffect(() => {
    // If on login page, skip auth check
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    fetch('/api/auth/admin/me')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setAdmin(data.admin);
        } else {
          router.push('/admin/login');
        }
      })
      .catch(() => {
        router.push('/admin/login');
      })
      .finally(() => setLoading(false));
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#E83E8C] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verifying Admin Access...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Teams & Students', href: '/admin/teams', icon: Users },
    { label: 'Conference Regs', href: '/admin/conference', icon: UserCheck },
    { label: 'College Partners', href: '/admin/colleges', icon: Building2 },
    { label: 'Payment Logs', href: '/admin/payments', icon: CreditCard },
    { label: 'Mail Dispatch', href: '/admin/mail', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-[#1e0d2e] text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C3B8F] to-[#E83E8C] flex items-center justify-center font-bold text-xs">
            SP
          </div>
          <span className="font-extrabold text-base tracking-tight">ShePitch Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-gray-300 hover:text-white">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 w-64 bg-[#1a0b28] text-white flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } h-screen shrink-0 overflow-y-auto border-r border-white/10`}
      >
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C3B8F] to-[#E83E8C] flex items-center justify-center font-extrabold text-sm shadow-lg">
              SP
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight leading-none text-white">ShePitch</h2>
              <span className="text-[11px] text-[#E83E8C] font-semibold tracking-wider uppercase">Super Admin Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] text-white shadow-lg shadow-[#6C3B8F]/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Jury & Mentors Placeholder Banner */}
          <div className="mx-4 mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#E83E8C] font-bold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Coming Soon</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Jury & Mentor login portals will be launched in the next module release.
            </p>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#E83E8C]">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{admin?.name || 'Administrator'}</p>
              <p className="text-[10px] text-gray-400 truncate">{admin?.email || 'admin@shepitch.com'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 capitalize">
              {pathname.replace('/admin/', '').replace('-', ' ') || 'Dashboard'}
            </h1>
            <p className="text-xs text-gray-500">Live Database Overview & Control</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> MySQL Live Connected
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
