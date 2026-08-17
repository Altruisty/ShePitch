'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Award,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  Mail,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-gray-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-[#6C3B8F]" />
        <span>Loading Admin Analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Jury & Mentor Placeholder Banner */}
      <div className="bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] text-white p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg">Jury & Mentor Access Portals</h3>
            <p className="text-white/90 text-xs sm:text-sm">
              Dedicated evaluation dashboards for competition judges and startup mentors coming soon.
            </p>
          </div>
        </div>
        <button disabled className="bg-white/20 border border-white/30 text-white font-bold text-xs px-5 py-2.5 rounded-full uppercase tracking-wider cursor-not-allowed shrink-0">
          Coming Soon
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900">
              ₹{Number(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="block text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Verified Razorpay Payments
            </span>
          </div>
        </div>

        {/* Card 2: Total Teams */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Teams</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#6C3B8F] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900">{stats?.totalTeams || 0}</span>
            <span className="block text-xs text-gray-500 font-medium mt-1">
              {stats?.totalStudents || 0} Participating Students
            </span>
          </div>
        </div>

        {/* Card 3: Registered Colleges */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">College Partners</span>
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#E83E8C] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900">{stats?.totalColleges || 0}</span>
            <span className="block text-xs text-gray-500 font-medium mt-1">Institutions Collaborated</span>
          </div>
        </div>

        {/* Card 4: Category Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tracks</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            {stats?.categoryBreakdown?.map((c: any) => (
              <div key={c.category} className="flex justify-between text-xs font-bold text-gray-700">
                <span>{c.category}:</span>
                <span className="text-[#6C3B8F]">{c.count} teams</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="font-extrabold text-base text-gray-900">Quick Operations</h3>
          <p className="text-xs text-gray-500">Manage registrations, colleges, and notifications</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/teams" className="she-btn-primary text-xs py-2.5 px-4 flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Manage Teams
          </Link>
          <Link href="/admin/colleges" className="she-btn-outline text-xs py-2.5 px-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Add College
          </Link>
          <Link href="/admin/mail" className="bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-2.5 px-4 rounded-full flex items-center gap-2 transition-all">
            <Mail className="w-4 h-4" /> Send Email Broadcast
          </Link>
        </div>
      </div>

      {/* Recent Teams Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Recent Registrations</h3>
            <p className="text-xs text-gray-500">Latest 5 team entries submitted to ShePitch</p>
          </div>
          <Link href="/admin/teams" className="text-xs font-bold text-[#6C3B8F] hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Team Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">College</th>
                <th className="p-3.5">Leader</th>
                <th className="p-3.5">Fee Paid</th>
                <th className="p-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.recentTeams?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                    No teams registered yet. Submit a test registration from the register page.
                  </td>
                </tr>
              ) : (
                stats?.recentTeams?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-all">
                    <td className="p-3.5 font-bold text-gray-900">{t.team_name}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.category === 'Project Pitch' ? 'bg-pink-50 text-[#E83E8C]' : 'bg-purple-50 text-[#6C3B8F]'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-700">{t.college_name}</td>
                    <td className="p-3.5 text-gray-700">{t.leader_name}</td>
                    <td className="p-3.5 font-bold text-gray-900">₹{t.amount_paid}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        t.payment_status === 'success' ? 'bg-green-100 text-green-700' : t.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
