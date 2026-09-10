'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  MessageCircle,
  Building2,
  Sparkles,
  AlertCircle,
  CreditCard,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  ArrowUpDown,
  FileSpreadsheet,
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
  attemptCount?: number;
  members: TeamMember[];
}

interface Stats {
  totalUnpaidTeams: number;
  totalRawAttempts: number;
  totalPendingRevenue: number;
  ideaCount: number;
  projectCount: number;
  totalMembers: number;
}

export default function PendingTeamsPage() {
  const [teams, setTeams] = useState<PendingTeam[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [deduplicate, setDeduplicate] = useState(true);
  const [expandedTeamIds, setExpandedTeamIds] = useState<Record<number, boolean>>({});

  const fetchPendingTeams = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        category: categoryFilter,
        college: collegeFilter,
        search: search.trim(),
        deduplicate: deduplicate ? 'true' : 'false',
      });

      const res = await fetch(`/api/pending/teams?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();

      if (data.success) {
        setTeams(data.teams || []);
        setStats(data.stats || null);
      } else {
        setError(data.error || 'Failed to load pending teams.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching pending teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeams();
  }, [categoryFilter, collegeFilter, deduplicate]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPendingTeams();
  };

  // Distinct college list for filter
  const uniqueColleges = useMemo(() => {
    const set = new Set<string>();
    teams.forEach((t) => {
      if (t.college_name) set.add(t.college_name.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [teams]);

  const toggleExpand = (teamId: number) => {
    setExpandedTeamIds((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (teams.length === 0) {
      alert('No teams available to export.');
      return;
    }

    const headers = [
      'Team ID',
      'Team Name',
      'Category',
      'College Name',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'Member Count',
      'Amount Pending (INR)',
      'Coupon Code',
      'Pitch Title',
      'Domain',
      'Attempt Count',
      'Created At',
      'Members (Name - Email - Phone)',
    ];

    const rows = teams.map((t) => {
      const membersStr = (t.members || [])
        .map((m) => `${m.student_name} (${m.email} / ${m.phone})`)
        .join('; ');

      return [
        t.id,
        `"${(t.team_name || '').replace(/"/g, '""')}"`,
        `"${t.category || ''}"`,
        `"${(t.college_name || '').replace(/"/g, '""')}"`,
        `"${(t.leader_name || '').replace(/"/g, '""')}"`,
        `"${t.leader_email || ''}"`,
        `"${t.leader_phone || ''}"`,
        t.members?.length || t.member_count || 2,
        t.amount_paid || 0,
        `"${t.coupon_code || ''}"`,
        `"${(t.project_title || '').replace(/"/g, '""')}"`,
        `"${(t.domain || '').replace(/"/g, '""')}"`,
        t.attemptCount || 1,
        `"${t.created_at || ''}"`,
        `"${membersStr.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shepitch_unpaid_teams_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-rose-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Strictly Unpaid Registrations Tracker
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Unpaid & Pending Teams
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Teams that attempted registration but have <strong className="text-rose-600">NOT paid at all</strong>. Anyone who later registered and successfully paid is automatically filtered out.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              disabled={teams.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200 shadow-xs disabled:opacity-50 cursor-pointer"
              title="Download CSV for WhatsApp and phone follow-up"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export CSV ({teams.length})
            </button>

            <button
              onClick={fetchPendingTeams}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] hover:opacity-90 transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh List'}
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100">
              <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Unpaid Teams</div>
              <div className="text-2xl font-black text-rose-800 mt-0.5">{stats.totalUnpaidTeams}</div>
              <div className="text-[10px] text-rose-600 mt-0.5">
                {deduplicate ? `From ${stats.totalRawAttempts} raw attempts` : 'All raw entries'}
              </div>
            </div>

            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100">
              <div className="text-[11px] font-bold text-[#6C3B8F] uppercase tracking-wider">Unpaid Students</div>
              <div className="text-2xl font-black text-[#6C3B8F] mt-0.5">{stats.totalMembers}</div>
              <div className="text-[10px] text-purple-600 mt-0.5">Registered members waiting</div>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Potential Fee</div>
              <div className="text-2xl font-black text-amber-900 mt-0.5">₹{stats.totalPendingRevenue.toLocaleString()}</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Unrealized revenue</div>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
              <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Track Split</div>
              <div className="text-sm font-extrabold text-blue-900 mt-1">
                <span className="text-[#6C3B8F]">{stats.ideaCount} Idea</span> • <span className="text-rose-600">{stats.projectCount} Project</span>
              </div>
              <div className="text-[10px] text-blue-600 mt-0.5">Category breakdown</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by team, leader, email, phone, or college..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#6C3B8F]"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#6C3B8F] font-medium"
            >
              <option value="all">All Categories</option>
              <option value="Idea Pitch">Idea Pitch</option>
              <option value="Project Pitch">Project Pitch</option>
            </select>

            {/* College Filter */}
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#6C3B8F] font-medium max-w-xs truncate"
            >
              <option value="all">All Colleges ({uniqueColleges.length})</option>
              {uniqueColleges.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

            {/* Deduplicate Toggle */}
            <label className="inline-flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl border border-purple-200 cursor-pointer text-xs font-bold text-[#6C3B8F] select-none">
              <input
                type="checkbox"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="w-4 h-4 text-[#6C3B8F] rounded accent-[#6C3B8F] cursor-pointer"
              />
              Unique Leads Only
            </label>

            <button
              type="submit"
              className="px-4 py-2.5 bg-[#6C3B8F] text-white rounded-xl text-xs font-bold hover:bg-[#582e75] transition-all cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse space-y-4">
              <div className="h-6 bg-gray-100 rounded-lg w-1/3" />
              <div className="h-4 bg-gray-100 rounded-lg w-1/2" />
              <div className="h-16 bg-gray-50 rounded-xl w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Unpaid Teams List */}
      {!loading && teams.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Unpaid Teams ({teams.length})
            </h2>
            <span className="text-xs text-gray-500">
              Showing strictly teams with 0 confirmed payments
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {teams.map((team) => {
              const isExpanded = expandedTeamIds[team.id];
              const phoneClean = (team.leader_phone || '').replace(/\D/g, '');
              const waLink = phoneClean
                ? `https://wa.me/${phoneClean.length === 10 ? '91' + phoneClean : phoneClean}?text=${encodeURIComponent(
                    `Hi ${team.leader_name}, this is from ShePitch! We noticed your team "${team.team_name}" started registration for ${team.category} but the payment didn't go through. Do you need any assistance completing it?`
                  )}`
                : null;

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all relative overflow-hidden space-y-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center flex-wrap gap-2.5 mb-1.5">
                        <h3 className="text-xl font-black text-gray-900">{team.team_name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Unpaid Attempt
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#6C3B8F]">
                          {team.category}
                        </span>
                        {team.attemptCount && team.attemptCount > 1 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            {team.attemptCount} Attempts
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-700">{team.college_name || 'College Not Specified'}</span>
                        <span>•</span>
                        <span>Attempted on {new Date(team.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Quick Follow-up Actions */}
                    <div className="flex items-center flex-wrap gap-2">
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs"
                          title="Chat with Leader on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          WhatsApp
                        </a>
                      )}

                      {team.leader_phone && (
                        <a
                          href={`tel:${team.leader_phone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200"
                        >
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                          Call
                        </a>
                      )}

                      {team.leader_email && (
                        <a
                          href={`mailto:${team.leader_email}?subject=${encodeURIComponent(`ShePitch Registration Follow-up: Team ${team.team_name}`)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#6C3B8F] bg-purple-50 hover:bg-purple-100 transition-all border border-purple-200"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Details Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Team Leader</span>
                      <span className="font-extrabold text-gray-900 mt-0.5 block">{team.leader_name}</span>
                      <span className="text-gray-500 text-[11px] truncate block">{team.leader_email}</span>
                      <span className="text-gray-600 font-mono text-[11px] block">{team.leader_phone}</span>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Pending Amount</span>
                      <span className="text-base font-black text-rose-600 mt-0.5 block">
                        ₹{(Number(team.amount_paid) || 0).toFixed(2)}
                      </span>
                      {team.coupon_code ? (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                          Coupon: {team.coupon_code}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">No coupon applied</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Members Count</span>
                      <span className="font-extrabold text-gray-900 mt-0.5 block">
                        {team.members?.length || team.member_count || 2} Students
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleExpand(team.id)}
                        className="text-[11px] font-bold text-[#6C3B8F] hover:underline inline-flex items-center gap-1 mt-0.5 cursor-pointer"
                      >
                        {isExpanded ? 'Hide Roster' : 'View Roster'}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Razorpay Order ID</span>
                      <span className="font-mono text-[11px] text-gray-600 mt-0.5 block truncate">
                        {team.razorpay_order_id || 'Not generated'}
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded inline-block mt-0.5 font-bold">
                        Unpaid Lead
                      </span>
                    </div>
                  </div>

                  {/* Pitch Proposal (if submitted) */}
                  {team.project_title && (
                    <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-[#6C3B8F] uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Pitch Proposal • {team.domain || 'General'}
                        </span>
                      </div>
                      <div className="font-bold text-gray-900">{team.project_title}</div>
                      {team.project_description && (
                        <p className="text-gray-600 text-[11px] line-clamp-2 leading-relaxed">
                          {team.project_description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Expandable Members Roster */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        All Registered Team Members ({team.members?.length || 0})
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {team.members && team.members.length > 0 ? (
                          team.members.map((member, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                  {member.student_name}
                                  {Boolean(member.is_leader) && (
                                    <span className="text-[9px] bg-purple-100 text-[#6C3B8F] font-black px-1.5 py-0.5 rounded uppercase">
                                      Leader
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[11px] text-gray-600">{member.phone}</span>
                              </div>
                              <div className="text-gray-500 text-[11px]">{member.email}</div>
                              {(member.department || member.year_of_study) && (
                                <div className="text-gray-400 text-[10px]">
                                  {member.department} {member.year_of_study ? `• ${member.year_of_study}` : ''}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 italic">No member records attached to this attempt.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && teams.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-gray-900">No Strictly Unpaid Teams Found</h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Great news! Every team that attempted registration has either completed their payment or there are no pending attempts matching the current filter.
          </p>
        </div>
      )}
    </div>
  );
}
