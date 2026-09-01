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
  X,
  Search,
  Download,
  GraduationCap,
  ListFilter,
  BarChart2,
  DollarSign,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // College Report Popup Modal State
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');

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

  const exportCollegeReportCSV = () => {
    if (!stats?.collegeStats || stats.collegeStats.length === 0) return;

    const headers = [
      '#',
      'College / Institution Name',
      'Total Teams Registered',
      'Total Students Registered',
      'Amount Received (INR)',
    ];
    const rows = stats.collegeStats.map((c: any, index: number) => [
      index + 1,
      `"${(c.college_name || '').replace(/"/g, '""')}"`,
      c.total_teams,
      c.total_students,
      c.total_revenue || 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShePitch_Colleges_Revenue_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredColleges = (stats?.collegeStats || []).filter((c: any) =>
    (c.college_name || '').toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const totalReportRevenue = filteredColleges.reduce(
    (sum: number, c: any) => sum + Number(c.total_revenue || 0),
    0
  );

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

        {/* Card 3: Registered Colleges (Clickable to open College Report) */}
        <div
          onClick={() => setIsCollegeModalOpen(true)}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 cursor-pointer hover:border-pink-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">College Partners</span>
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#E83E8C] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold text-gray-900">{stats?.totalColleges || 0}</span>
            <span className="block text-xs text-[#E83E8C] font-bold mt-1 flex items-center gap-1 group-hover:underline">
              <span>View College Revenue Report</span> &rarr;
            </span>
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
          <h3 className="font-extrabold text-base text-gray-900">Quick Operations & Reports</h3>
          <p className="text-xs text-gray-500">Manage registrations, colleges, reports, and notifications</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsCollegeModalOpen(true)}
            className="bg-purple-100 text-[#6C3B8F] hover:bg-purple-200 font-extrabold text-xs py-2.5 px-4 rounded-full flex items-center gap-2 transition-all"
          >
            <BarChart2 className="w-4 h-4" /> College Participation & Revenue Report
          </button>
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

      {/* POPUP MODAL: COLLEGE PARTICIPATION & REVENUE REPORT */}
      {isCollegeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[85vh] flex flex-col border border-purple-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-purple-100 text-[#6C3B8F] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    MOST TEAMS FIRST (DESCENDING)
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                    CONFIRMED PAID TEAMS & STUDENTS ONLY
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                  College Participation & Revenue Report
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Breakdown of confirmed paid teams, participating students, and revenue generated per institution
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCollegeModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Toolbar (Search & CSV Export) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search college name..."
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                />
              </div>
            </div>

            {/* Modal Table Body */}
            <div className="overflow-y-auto flex-1 border border-gray-100 rounded-2xl">
              {filteredColleges.length === 0 ? (
                <div className="p-10 text-center text-gray-400 space-y-2">
                  <Building2 className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-sm font-bold text-gray-600">No college data available.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs sm:text-sm text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 font-extrabold uppercase text-[11px] tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-4">College / Institution Name</th>
                      <th className="py-3.5 px-4 text-center">Total Teams</th>
                      <th className="py-3.5 px-4 text-center">Total Students</th>
                      <th className="py-3.5 px-4 text-right">Amount Received (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredColleges.map((c: any, index: number) => (
                      <tr key={index} className="hover:bg-purple-50/40 transition-all">
                        <td className="py-3.5 px-4 text-center font-bold text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-gray-900">
                          {c.college_name}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block bg-purple-100 text-[#6C3B8F] font-black px-3 py-1 rounded-full text-xs">
                            {c.total_teams} {c.total_teams === 1 ? 'Team' : 'Teams'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-block bg-pink-100 text-[#E83E8C] font-black px-3 py-1 rounded-full text-xs">
                            {c.total_students} {c.total_students === 1 ? 'Student' : 'Students'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black">
                          <span className="inline-block bg-emerald-100 text-emerald-800 font-black px-3 py-1 rounded-full text-xs">
                            ₹{Number(c.total_revenue || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600 font-semibold">
              <div className="flex items-center gap-4">
                <span>Colleges Listed: <strong>{filteredColleges.length}</strong></span>
                <span>Combined Revenue: <strong className="text-emerald-700">₹{totalReportRevenue.toLocaleString('en-IN')}</strong></span>
              </div>
              <button
                onClick={() => setIsCollegeModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
