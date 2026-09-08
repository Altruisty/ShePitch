'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Phone,
  Building2,
  Sparkles,
  RefreshCw,
  Clock,
  AlertCircle,
  MessageSquare,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Layers,
  Eye,
  X,
  CreditCard,
  GraduationCap,
} from 'lucide-react';

interface TeamMember {
  id?: number;
  student_name: string;
  email: string;
  phone: string;
  department?: string;
  year_of_study?: string;
  is_leader?: boolean | number;
}

interface PendingTeam {
  id: number;
  team_name: string;
  category: string;
  project_title?: string;
  domain?: string;
  project_description?: string;
  college_id?: number | null;
  college_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  member_count: number;
  coupon_code?: string | null;
  amount_paid: number;
  payment_status: string;
  razorpay_order_id?: string | null;
  created_at: string;
  attempt_count?: number;
  members: TeamMember[];
}

export default function PendingStudentsPage() {
  const [teams, setTeams] = useState<PendingTeam[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalAttempts: 0,
    uniqueUnpaidTeams: 0,
    ideaPitchCount: 0,
    projectPitchCount: 0,
    totalColleges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [dedup, setDedup] = useState(true);

  // Modals & UI States
  const [selectedTeam, setSelectedTeam] = useState<PendingTeam | null>(null);
  const [copiedType, setCopiedType] = useState<'emails' | 'phones' | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<number>>(new Set());

  const fetchPendingTeams = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        category: categoryFilter,
        college: collegeFilter,
        dedup: dedup ? 'true' : 'false',
      });

      const res = await fetch(`/api/students/pending?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();

      if (data.success) {
        setTeams(data.teams || []);
        if (data.colleges) setColleges(data.colleges);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load pending teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeams();
  }, [categoryFilter, collegeFilter, dedup]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPendingTeams();
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const toggleExpand = (id: number) => {
    setExpandedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(label);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Copy all emails
  const copyAllEmails = () => {
    const emails = Array.from(
      new Set(teams.map((t) => t.leader_email?.trim()).filter(Boolean))
    ).join(', ');
    navigator.clipboard.writeText(emails);
    setCopiedType('emails');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Copy all phones
  const copyAllPhones = () => {
    const phones = Array.from(
      new Set(teams.map((t) => t.leader_phone?.trim()).filter(Boolean))
    ).join(', ');
    navigator.clipboard.writeText(phones);
    setCopiedType('phones');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (teams.length === 0) return;

    const headers = [
      'Team ID',
      'Team Name',
      'Category',
      'College Name',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'Member Count',
      'Amount (INR)',
      'Coupon Code',
      'Order ID',
      'Registration Date',
      'Project Title',
      'Domain',
      'All Members (Name - Email - Phone - Dept - Year)',
    ];

    const rows = teams.map((t) => {
      const membersStr = (t.members || [])
        .map(
          (m) =>
            `${m.student_name} (${m.email}, ${m.phone}, ${m.department || 'N/A'}, ${m.year_of_study || 'N/A'}${m.is_leader ? ' - Leader' : ''})`
        )
        .join('; ');

      return [
        t.id,
        `"${(t.team_name || '').replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${(t.college_name || '').replace(/"/g, '""')}"`,
        `"${(t.leader_name || '').replace(/"/g, '""')}"`,
        `"${t.leader_email || ''}"`,
        `"${t.leader_phone || ''}"`,
        t.member_count || t.members?.length || 0,
        t.amount_paid || 0,
        `"${t.coupon_code || ''}"`,
        `"${t.razorpay_order_id || ''}"`,
        `"${new Date(t.created_at).toLocaleString()}"`,
        `"${(t.project_title || '').replace(/"/g, '""')}"`,
        `"${(t.domain || '').replace(/"/g, '""')}"`,
        `"${membersStr.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shepitch_unpaid_teams_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-gradient-to-br from-[#E83E8C]/20 to-[#6C3B8F]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Unpaid Teams Directory & Recovery
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Pending Registrations (Unpaid Teams)
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
              Complete list of student teams whose registration is pending and who have{' '}
              <span className="font-bold text-gray-900">NOT completed payment</span>. Teams that subsequently paid on another attempt or completed payment are automatically excluded.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchPendingTeams}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200 shadow-sm cursor-pointer disabled:opacity-50"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              onClick={exportToCSV}
              disabled={teams.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] hover:opacity-90 transition-all shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export to CSV
            </button>

            <button
              onClick={copyAllEmails}
              disabled={teams.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs text-gray-700 bg-white hover:bg-purple-50 border border-purple-200 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Copy all leader emails comma-separated"
            >
              {copiedType === 'emails' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Mail className="w-3.5 h-3.5 text-[#6C3B8F]" />}
              {copiedType === 'emails' ? 'Copied Emails!' : 'Copy Emails'}
            </button>

            <button
              onClick={copyAllPhones}
              disabled={teams.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs text-gray-700 bg-white hover:bg-purple-50 border border-purple-200 transition-all shadow-sm cursor-pointer disabled:opacity-50"
              title="Copy all leader phones comma-separated"
            >
              {copiedType === 'phones' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Phone className="w-3.5 h-3.5 text-[#6C3B8F]" />}
              {copiedType === 'phones' ? 'Copied Phones!' : 'Copy Phones'}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Unpaid Teams</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {stats.uniqueUnpaidTeams}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">
            {stats.totalAttempts > stats.uniqueUnpaidTeams
              ? `${stats.totalAttempts} total attempts across ${stats.uniqueUnpaidTeams} teams`
              : 'Distinct unpaid teams'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Idea Pitch</span>
            <span className="p-2 rounded-xl bg-purple-50 text-[#6C3B8F]">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 mt-2">
            {stats.ideaPitchCount}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Pending Idea Pitch registrations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Project Pitch</span>
            <span className="p-2 rounded-xl bg-pink-50 text-[#E83E8C]">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#E83E8C] mt-2">
            {stats.projectPitchCount}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Pending Prototype/Project pitches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Colleges</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
            {stats.totalColleges}
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Institutions with unpaid attempts</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by team, leader, email, phone, college, project title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-[#6C3B8F]"
          />
        </div>

        {/* Category & College Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {['all', 'Idea Pitch', 'Project Pitch'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === cat ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat === 'all' ? 'All Tracks' : cat}
              </button>
            ))}
          </div>

          {/* College select */}
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#6C3B8F] max-w-[200px]"
          >
            <option value="all">All Colleges ({colleges.length})</option>
            {colleges.map((col, idx) => (
              <option key={idx} value={col}>
                {col}
              </option>
            ))}
          </select>

          {/* Deduplication Toggle */}
          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 select-none">
            <input
              type="checkbox"
              checked={dedup}
              onChange={(e) => setDedup(e.target.checked)}
              className="rounded text-[#6C3B8F] focus:ring-[#6C3B8F] cursor-pointer accent-[#6C3B8F]"
            />
            Collapse Duplicates
          </label>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
          <RefreshCw className="w-8 h-8 text-[#6C3B8F] animate-spin mx-auto mb-3" />
          <div className="text-base font-extrabold text-gray-900">Loading pending teams...</div>
          <p className="text-xs text-gray-500 mt-1">Filtering out any teams that subsequently paid.</p>
        </div>
      ) : teams.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm text-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Check className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black text-gray-900">No Unpaid Pending Teams Found!</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            All teams matching your filter have completed payment successfully, or no registrations are currently pending.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold px-1">
            <span>Showing {teams.length} unpaid team{teams.length !== 1 ? 's' : ''}</span>
            <span>Click any card to expand team members</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {teams.map((team) => {
              const isExpanded = expandedTeamIds.has(team.id);
              const hasMultipleAttempts = (team.attempt_count || 1) > 1;

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-3xl border border-gray-200/90 hover:border-purple-300 transition-all shadow-sm hover:shadow-md overflow-hidden"
                >
                  {/* Team Card Header */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Team Name, Category, College */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="text-lg sm:text-xl font-black text-gray-900">{team.team_name}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              team.category === 'Idea Pitch'
                                ? 'bg-purple-100 text-[#6C3B8F]'
                                : 'bg-pink-100 text-[#E83E8C]'
                            }`}
                          >
                            {team.category}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Payment
                          </span>

                          {hasMultipleAttempts && (
                            <span
                              className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-50 text-red-700 border border-red-200"
                              title={`${team.attempt_count} registration attempts without payment`}
                            >
                              {team.attempt_count} Attempts
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {team.college_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {new Date(team.created_at).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {team.members?.length || team.member_count || 2} Members
                          </span>
                          {team.coupon_code && (
                            <span className="text-purple-700 font-bold">
                              Coupon: {team.coupon_code}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Leader Contact & Amount */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                        {/* Financial summary */}
                        <div className="text-left md:text-right">
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Unpaid Amount</div>
                          <div className="text-lg font-black text-gray-900">
                            ₹{Number(team.amount_paid || 598).toFixed(2)}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedTeam(team)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#6C3B8F] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Details
                          </button>

                          <button
                            onClick={() => toggleExpand(team.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {isExpanded ? 'Hide Roster' : 'View Roster'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Leader Quick Contact Info */}
                    <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-gray-50/70 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 rounded-b-2xl">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                          Leader: {team.leader_name}
                        </span>

                        {/* Email */}
                        <a
                          href={`mailto:${team.leader_email}`}
                          className="text-[#6C3B8F] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {team.leader_email}
                        </a>

                        {/* Phone with WhatsApp link */}
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${team.leader_phone}`}
                            className="text-gray-700 hover:text-black flex items-center gap-1 font-mono font-semibold"
                          >
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {team.leader_phone}
                          </a>

                          <a
                            href={`https://wa.me/91${team.leader_phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
                              team.leader_name
                            )},%20we%20noticed%20your%20ShePitch%20registration%20for%20team%20"${encodeURIComponent(
                              team.team_name
                            )}"%20is%20pending.%20Would%20you%20like%20assistance%20to%20complete%20your%20payment?`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-800 font-bold text-[11px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Pitch Proposal snippet */}
                      {team.project_title && (
                        <div className="text-gray-600 italic truncate max-w-md">
                          <span className="font-bold text-gray-700 not-italic">Pitch: </span>
                          "{team.project_title}" {team.domain ? `(${team.domain})` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Members Roster */}
                  {isExpanded && (
                    <div className="bg-purple-50/40 p-5 sm:p-6 border-t border-purple-100 space-y-3">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        Full Team Roster ({team.members?.length || 0} Members)
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {team.members && team.members.length > 0 ? (
                          team.members.map((member, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white border border-purple-100/80 rounded-2xl shadow-xs space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-gray-900 truncate">
                                  {member.student_name}
                                </span>
                                {member.is_leader ? (
                                  <span className="text-[10px] font-extrabold text-[#6C3B8F] bg-purple-100 px-1.5 py-0.5 rounded">
                                    Leader
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-gray-400">Member {idx + 1}</span>
                                )}
                              </div>
                              <div className="text-gray-500 truncate text-[11px]">{member.email}</div>
                              <div className="font-mono text-gray-700 text-[11px]">{member.phone}</div>
                              {(member.department || member.year_of_study) && (
                                <div className="text-[10px] text-gray-400 truncate pt-1 border-t border-gray-100">
                                  {[member.department, member.year_of_study].filter(Boolean).join(' • ')}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 italic">No member records attached.</div>
                        )}
                      </div>

                      {team.project_description && (
                        <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs text-gray-600 mt-2">
                          <span className="font-bold text-gray-800">Proposal Description: </span>
                          {team.project_description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1.5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Pending Payment
                </span>
                <span className="text-xs font-bold text-[#6C3B8F] bg-purple-100 px-2.5 py-0.5 rounded-full">
                  {selectedTeam.category}
                </span>
                {selectedTeam.attempt_count && selectedTeam.attempt_count > 1 && (
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                    {selectedTeam.attempt_count} Attempts Made
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-gray-900">{selectedTeam.team_name}</h2>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                {selectedTeam.college_name} • Team ID #{selectedTeam.id}
              </p>
            </div>

            {/* Content Body */}
            <div className="py-5 space-y-5">
              {/* Financial Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Amount Unpaid</div>
                  <div className="text-base font-black text-gray-900 mt-0.5">
                    ₹{Number(selectedTeam.amount_paid || 598).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Coupon Code</div>
                  <div className="text-sm font-bold text-purple-700 mt-0.5">
                    {selectedTeam.coupon_code || 'None'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Created Date</div>
                  <div className="text-xs font-semibold text-gray-700 mt-0.5">
                    {new Date(selectedTeam.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase">Order ID</div>
                  <div className="text-xs font-mono text-gray-600 mt-0.5 truncate" title={selectedTeam.razorpay_order_id || 'N/A'}>
                    {selectedTeam.razorpay_order_id || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Pitch Information */}
              {(selectedTeam.project_title || selectedTeam.project_description) && (
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2">
                  <div className="text-xs font-bold text-[#6C3B8F] uppercase tracking-wider">
                    Pitch Proposal {selectedTeam.domain ? `• ${selectedTeam.domain}` : ''}
                  </div>
                  {selectedTeam.project_title && (
                    <div className="text-sm font-bold text-gray-900">{selectedTeam.project_title}</div>
                  )}
                  {selectedTeam.project_description && (
                    <div className="text-xs text-gray-600 leading-relaxed">{selectedTeam.project_description}</div>
                  )}
                </div>
              )}

              {/* Full Members Details */}
              <div>
                <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3">
                  Registered Members ({selectedTeam.members?.length || 0})
                </div>
                <div className="space-y-2.5">
                  {selectedTeam.members && selectedTeam.members.length > 0 ? (
                    selectedTeam.members.map((member, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            {member.student_name}
                            {member.is_leader && (
                              <span className="text-[10px] bg-purple-100 text-[#6C3B8F] font-bold px-1.5 py-0.2 rounded">
                                Leader
                              </span>
                            )}
                          </div>
                          <div className="text-gray-500 text-[11px]">
                            {[member.department, member.year_of_study].filter(Boolean).join(' • ')}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <a
                            href={`mailto:${member.email}`}
                            className="text-[#6C3B8F] hover:underline font-semibold"
                          >
                            {member.email}
                          </a>
                          <span className="text-gray-300">|</span>
                          <a
                            href={`tel:${member.phone}`}
                            className="font-mono text-gray-700 hover:text-black font-semibold"
                          >
                            {member.phone}
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 italic">No member records attached.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <a
                  href={`mailto:${selectedTeam.leader_email}?subject=Important%20Update:%20ShePitch%20Registration%20for%20${encodeURIComponent(
                    selectedTeam.team_name
                  )}&body=Dear%20${encodeURIComponent(
                    selectedTeam.leader_name
                  )},%0A%0AWe%20noticed%20that%20your%20registration%20for%20team%20"${encodeURIComponent(
                    selectedTeam.team_name
                  )}"%20is%20currently%20pending%20payment.%0A%0APlease%20let%20us%20know%20if%20you%20need%20any%20assistance%20completing%20your%20registration.%0A%0ABest%20regards,%0AShePitch%20Team`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] hover:opacity-90 transition-all cursor-pointer shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Team Leader
                </a>

                <a
                  href={`https://wa.me/91${selectedTeam.leader_phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(
                    selectedTeam.leader_name
                  )},%20we%20noticed%20your%20ShePitch%20registration%20for%20team%20"${encodeURIComponent(
                    selectedTeam.team_name
                  )}"%20is%20pending.%20Would%20you%20like%20assistance%20to%20complete%20your%20payment?`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>

              <button
                onClick={() => setSelectedTeam(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
