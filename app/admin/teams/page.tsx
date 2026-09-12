'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  GraduationCap,
  X,
  Sparkles,
  Building2,
  CreditCard,
  Check,
  Download,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('success');

  // Export menu dropdown state
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Selected Team for View/Edit modal
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Team (mirrors /register page logic)
  const [newTeam, setNewTeam] = useState({
    team_name: '',
    category: 'Idea Pitch',
    project_title: '',
    domain: 'AI and Machine Learning',
    project_description: '',
    coupon_code: '',
    amount_paid: 598,
    payment_status: 'success',
    razorpay_payment_id: '',
    send_email: true,
    members: [
      { student_name: '', email: '', phone: '', department: '', year_of_study: '3rd Year', is_leader: true },
      { student_name: '', email: '', phone: '', department: '', year_of_study: '3rd Year', is_leader: false },
    ],
  });

  const [selectedCollegeOption, setSelectedCollegeOption] = useState('Others');
  const [customCollegeName, setCustomCollegeName] = useState('');
  const [collegeId, setCollegeId] = useState<number | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        college: collegeFilter,
        category: categoryFilter,
        status: statusFilter,
        search,
      }).toString();

      const res = await fetch(`/api/teams?${query}`);
      const data = await res.json();
      if (data.success) {
        setTeams(data.teams || []);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch('/api/colleges');
      const data = await res.json();
      if (data.success) {
        setColleges(data.colleges || []);
      }
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [collegeFilter, categoryFilter, statusFilter, search]);

  // Merge partner colleges and any custom "Others" colleges from teams
  const allCollegeOptions = React.useMemo(() => {
    const set = new Set<string>();
    colleges.forEach((c) => {
      if (c.college_name) set.add(c.college_name.trim());
    });
    teams.forEach((t) => {
      if (t.college_name) set.add(t.college_name.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [colleges, teams]);

  // --- CSV Export Functions (Respects Active Filters) ---
  const parseMembers = (team: any): any[] => {
    if (!team) return [];
    let membersList = team.members;
    if (typeof membersList === 'string') {
      try {
        membersList = JSON.parse(membersList);
      } catch {
        membersList = [];
      }
    }
    if (!Array.isArray(membersList)) {
      membersList = [];
    }
    // Filter out dummy null entries created by MySQL LEFT JOIN when no student records exist
    const validMembers = membersList.filter(
      (m: any) => m && (m.id || m.student_name || m.email || m.phone)
    );
    return validMembers.sort((a: any, b: any) => (b.is_leader ? 1 : 0) - (a.is_leader ? 1 : 0));
  };

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value)
      .replace(/"/g, '""')
      .replace(/[\r\n]+/g, ' ')
      .trim();
    return `"${str}"`;
  };

  // 1. Comprehensive Export (1 Row per Team with All 4 Members & Pitch Details)
  const exportTeamsFullDetailsCSV = () => {
    if (teams.length === 0) {
      alert('No teams match the selected filter criteria to export.');
      return;
    }

    const headers = [
      'Team ID',
      'Team Name',
      'Category',
      'College Name',
      'Payment Status',
      'Amount Paid (INR)',
      'Discount Amount (INR)',
      'Coupon Code',
      'Razorpay Payment ID',
      'Razorpay Order ID',
      'Registration Date',
      'Project Title',
      'Domain',
      'Project Description',
      'Total Members',
      'Leader Name',
      'Leader Email',
      'Leader Phone',
      'Leader Department',
      'Leader Year of Study',
      'Member 2 Name',
      'Member 2 Email',
      'Member 2 Phone',
      'Member 2 Department',
      'Member 2 Year of Study',
      'Member 3 Name',
      'Member 3 Email',
      'Member 3 Phone',
      'Member 3 Department',
      'Member 3 Year of Study',
      'Member 4 Name',
      'Member 4 Email',
      'Member 4 Phone',
      'Member 4 Department',
      'Member 4 Year of Study',
      'All Members Summary',
    ];

    const rows = teams.map((team) => {
      const members = parseMembers(team);
      const leader = members[0] || {
        student_name: team.leader_name || '',
        email: team.leader_email || '',
        phone: team.leader_phone || '',
        department: '',
        year_of_study: '',
      };
      const m2 = members[1] || {};
      const m3 = members[2] || {};
      const m4 = members[3] || {};

      const membersSummary =
        members.length > 0
          ? members
              .map(
                (m, idx) =>
                  `${idx + 1}. ${m.student_name || 'N/A'} (${m.is_leader ? 'Leader, ' : ''}${m.email || 'N/A'}, ${m.phone || 'N/A'}, ${m.department || 'N/A'}, ${m.year_of_study || 'N/A'})`
              )
              .join(' | ')
          : `${leader.student_name} (${leader.email}, ${leader.phone})`;

      return [
        team.id,
        escapeCSV(team.team_name),
        escapeCSV(team.category),
        escapeCSV(team.college_name),
        escapeCSV(team.payment_status),
        team.amount_paid ?? 0,
        team.discount_amount ?? 0,
        escapeCSV(team.coupon_code || 'None'),
        escapeCSV(team.razorpay_payment_id || 'N/A'),
        escapeCSV(team.razorpay_order_id || 'N/A'),
        escapeCSV(team.created_at ? new Date(team.created_at).toLocaleString('en-IN') : ''),
        escapeCSV(team.project_title || ''),
        escapeCSV(team.domain || ''),
        escapeCSV(team.project_description || ''),
        members.length || team.member_count || 1,
        escapeCSV(leader.student_name || team.leader_name || ''),
        escapeCSV(leader.email || team.leader_email || ''),
        escapeCSV(leader.phone || team.leader_phone || ''),
        escapeCSV(leader.department || ''),
        escapeCSV(leader.year_of_study || ''),
        escapeCSV(m2.student_name || ''),
        escapeCSV(m2.email || ''),
        escapeCSV(m2.phone || ''),
        escapeCSV(m2.department || ''),
        escapeCSV(m2.year_of_study || ''),
        escapeCSV(m3.student_name || ''),
        escapeCSV(m3.email || ''),
        escapeCSV(m3.phone || ''),
        escapeCSV(m3.department || ''),
        escapeCSV(m3.year_of_study || ''),
        escapeCSV(m4.student_name || ''),
        escapeCSV(m4.email || ''),
        escapeCSV(m4.phone || ''),
        escapeCSV(m4.department || ''),
        escapeCSV(m4.year_of_study || ''),
        escapeCSV(membersSummary),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filterTag = statusFilter !== 'all' ? `_${statusFilter}` : '';
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `ShePitch_Teams_Full_Export${filterTag}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 2. Student Roster Export (1 Row per Student Member)
  const exportStudentRosterCSV = () => {
    if (teams.length === 0) {
      alert('No teams match the selected filter criteria to export.');
      return;
    }

    const headers = [
      'Student ID',
      'Student Name',
      'Role in Team',
      'Email',
      'Phone',
      'Department',
      'Year of Study',
      'Team ID',
      'Team Name',
      'Category',
      'College Name',
      'Project Title',
      'Domain',
      'Payment Status',
      'Team Amount Paid (INR)',
      'Razorpay Payment ID',
      'Registration Date',
    ];

    const rows: string[] = [];

    teams.forEach((team) => {
      const members = parseMembers(team);
      if (members.length === 0) {
        rows.push(
          [
            'N/A',
            escapeCSV(team.leader_name),
            escapeCSV('Team Leader'),
            escapeCSV(team.leader_email),
            escapeCSV(team.leader_phone),
            escapeCSV(''),
            escapeCSV(''),
            team.id,
            escapeCSV(team.team_name),
            escapeCSV(team.category),
            escapeCSV(team.college_name),
            escapeCSV(team.project_title || ''),
            escapeCSV(team.domain || ''),
            escapeCSV(team.payment_status),
            team.amount_paid ?? 0,
            escapeCSV(team.razorpay_payment_id || 'N/A'),
            escapeCSV(team.created_at ? new Date(team.created_at).toLocaleString('en-IN') : ''),
          ].join(',')
        );
      } else {
        members.forEach((m, idx) => {
          rows.push(
            [
              m.id || idx + 1,
              escapeCSV(m.student_name),
              escapeCSV(m.is_leader ? 'Team Leader' : `Member ${idx + 1}`),
              escapeCSV(m.email),
              escapeCSV(m.phone),
              escapeCSV(m.department || ''),
              escapeCSV(m.year_of_study || ''),
              team.id,
              escapeCSV(team.team_name),
              escapeCSV(team.category),
              escapeCSV(team.college_name),
              escapeCSV(team.project_title || ''),
              escapeCSV(team.domain || ''),
              escapeCSV(team.payment_status),
              team.amount_paid ?? 0,
              escapeCSV(team.razorpay_payment_id || 'N/A'),
              escapeCSV(team.created_at ? new Date(team.created_at).toLocaleString('en-IN') : ''),
            ].join(',')
          );
        });
      }
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filterTag = statusFilter !== 'all' ? `_${statusFilter}` : '';
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `ShePitch_Students_Roster_Export${filterTag}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteTeam = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTeams();
      }
    } catch (err) {
      alert('Failed to delete team');
    }
  };

  const resetNewTeamForm = () => {
    setSelectedCollegeOption('Others');
    setCustomCollegeName('');
    setCollegeId(null);
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
    setFormError('');
    setNewTeam({
      team_name: '',
      category: 'Idea Pitch',
      project_title: '',
      domain: 'AI and Machine Learning',
      project_description: '',
      coupon_code: '',
      amount_paid: 598,
      payment_status: 'success',
      razorpay_payment_id: '',
      send_email: true,
      members: [
        { student_name: '', email: '', phone: '', department: '', year_of_study: '3rd Year', is_leader: true },
        { student_name: '', email: '', phone: '', department: '', year_of_study: '3rd Year', is_leader: false },
      ],
    });
  };

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedCollegeOption(val);
    if (val === 'Others') {
      setCollegeId(null);
    } else {
      const found = colleges.find((c) => c.college_name === val);
      setCollegeId(found ? found.id : null);
    }
  };

  const handleMemberChange = (index: number, field: string, value: any) => {
    const updated = [...newTeam.members];
    (updated[index] as any)[field] = value;
    setNewTeam({ ...newTeam, members: updated });
  };

  const handleAddMember = () => {
    if (newTeam.members.length >= 4) {
      alert('Maximum 4 members allowed per team.');
      return;
    }
    const updated = [
      ...newTeam.members,
      { student_name: '', email: '', phone: '', department: '', year_of_study: '3rd Year', is_leader: false },
    ];
    const discRate = appliedCoupon === 'SHEPITCH150' ? 150 : appliedCoupon === 'SHEPITCH100' ? 100 : 0;
    const calculatedFee = Math.max(0, updated.length * 299 - updated.length * discRate);
    setNewTeam({ ...newTeam, members: updated, amount_paid: calculatedFee });
  };

  const handleRemoveMember = (index: number) => {
    if (newTeam.members.length <= 2) {
      alert('Minimum 2 members required per team.');
      return;
    }
    const updated = newTeam.members.filter((_, i) => i !== index);
    if (updated.length > 0) {
      updated[0].is_leader = true;
    }
    const discRate = appliedCoupon === 'SHEPITCH150' ? 150 : appliedCoupon === 'SHEPITCH100' ? 100 : 0;
    const calculatedFee = Math.max(0, updated.length * 299 - updated.length * discRate);
    setNewTeam({ ...newTeam, members: updated, amount_paid: calculatedFee });
  };

  const applyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = newTeam.coupon_code.trim().toUpperCase();
    if (!code) return;

    if (code === 'SHEPITCH100') {
      setAppliedCoupon('SHEPITCH100');
      setCouponSuccess(`Coupon SHEPITCH100 Applied! ₹100 off per participant (Total ₹${newTeam.members.length * 100} discount).`);
      const disc = newTeam.members.length * 100;
      const amt = Math.max(0, newTeam.members.length * 299 - disc);
      setNewTeam((prev) => ({ ...prev, amount_paid: amt }));
    } else if (code === 'SHEPITCH150') {
      setAppliedCoupon('SHEPITCH150');
      setCouponSuccess(`Coupon SHEPITCH150 Applied! ₹150 off per participant (Total ₹${newTeam.members.length * 150} discount).`);
      const disc = newTeam.members.length * 150;
      const amt = Math.max(0, newTeam.members.length * 299 - disc);
      setNewTeam((prev) => ({ ...prev, amount_paid: amt }));
    } else {
      setAppliedCoupon(null);
      setCouponError('Invalid coupon code.');
    }
  };

  const handleSaveNewTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const finalCollege = selectedCollegeOption === 'Others' ? customCollegeName.trim() : selectedCollegeOption.trim();
    if (!finalCollege) {
      setFormError('Please select or type a College / Institution Name.');
      return;
    }

    if (!newTeam.team_name.trim()) {
      setFormError('Please enter a Team Name.');
      return;
    }

    if (!newTeam.members[0].student_name.trim() || !newTeam.members[0].email.trim() || !newTeam.members[0].phone.trim()) {
      setFormError('Please fill out the Team Leader (Member 1) details (Name, Email, Phone).');
      return;
    }

    for (let i = 0; i < newTeam.members.length; i++) {
      const m = newTeam.members[i];
      if (!m.student_name.trim()) {
        setFormError(`Please enter the full name for Member ${i + 1}.`);
        return;
      }
      if (!m.email.trim()) {
        setFormError(`Please enter the email address for Member ${i + 1}.`);
        return;
      }
      if (!m.phone.trim()) {
        setFormError(`Please enter the phone number for Member ${i + 1}.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        team_name: newTeam.team_name.trim(),
        category: newTeam.category,
        college_name: finalCollege,
        college_id: collegeId,
        leader_name: newTeam.members[0].student_name.trim(),
        leader_email: newTeam.members[0].email.trim(),
        leader_phone: newTeam.members[0].phone.trim(),
        project_title: newTeam.project_title.trim(),
        domain: newTeam.domain,
        project_description: newTeam.project_description.trim(),
        coupon_code: appliedCoupon || null,
        amount_paid: Number(newTeam.amount_paid) || 0,
        payment_status: newTeam.payment_status,
        razorpay_payment_id: newTeam.razorpay_payment_id.trim() || null,
        send_email: newTeam.send_email,
        members: newTeam.members.map((m, idx) => ({
          ...m,
          is_leader: idx === 0,
        })),
      };

      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team');

      setIsAddModalOpen(false);
      resetNewTeamForm();
      fetchTeams();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create team');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-extrabold text-gray-900">Teams & Student Roster</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#6C3B8F]/10 text-[#6C3B8F] border border-[#6C3B8F]/20">
              {loading ? '...' : `${teams.length} Teams`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Manage participant details, college links, and registration status</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              disabled={loading || teams.length === 0}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
              title="Export filtered teams and student records"
            >
              <Download className="w-4 h-4 text-[#6C3B8F]" />
              <span>Export Data ({teams.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 space-y-1">
                  <div className="px-3 py-1.5 border-b border-gray-100 text-[11px] text-gray-400 font-semibold">
                    Export Filtered Records ({teams.length} teams)
                  </div>
                  <button
                    onClick={() => {
                      exportTeamsFullDetailsCSV();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#6C3B8F] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-gray-900 group-hover:text-[#6C3B8F]">
                        Teams & Students (Full Details)
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">
                        1 row per team with pitch, payment & all 4 members details
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportStudentRosterCSV();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-pink-50 transition-colors flex items-start gap-2.5 group cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-[#E83E8C] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-gray-900 group-hover:text-[#E83E8C]">
                        Student Roster (Per Student View)
                      </span>
                      <span className="block text-[11px] text-gray-500 mt-0.5">
                        Individual row per student with contact, college & team info
                      </span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => {
              resetNewTeamForm();
              setIsAddModalOpen(true);
            }}
            className="she-btn-primary text-xs py-2.5 px-4 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Team Manually
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team or leader..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6C3B8F]"
            />
          </div>

          {/* College Filter */}
          <div className="relative">
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#6C3B8F]"
            >
              <option value="all">All Colleges</option>
              {allCollegeOptions.map((cName) => (
                <option key={cName} value={cName}>
                  {cName}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#6C3B8F]"
            >
              <option value="all">All Categories</option>
              <option value="Idea Pitch">Idea Pitch</option>
              <option value="Project Pitch">Project Pitch</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#6C3B8F]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Indicator */}
        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-gray-500">
            <span className="font-semibold text-gray-700">Active View:</span>
            <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-lg font-semibold">
              Payment: <b className="text-[#6C3B8F]">{statusFilter === 'all' ? 'All' : statusFilter.toUpperCase()}</b>
            </span>
            {collegeFilter !== 'all' && (
              <span className="bg-purple-50 text-[#6C3B8F] px-2.5 py-0.5 rounded-lg font-semibold border border-purple-100">
                College: {collegeFilter}
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="bg-pink-50 text-[#E83E8C] px-2.5 py-0.5 rounded-lg font-semibold border border-pink-100">
                Category: {categoryFilter}
              </span>
            )}
            {search.trim() !== '' && (
              <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-lg font-semibold border border-amber-100">
                Search: &ldquo;{search}&rdquo;
              </span>
            )}
            <span className="text-gray-400 ml-1">
              ({teams.length} {teams.length === 1 ? 'team' : 'teams'} matching)
            </span>
          </div>

          {(search !== '' || collegeFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCollegeFilter('all');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#6C3B8F]" />
            <span>Loading teams database...</span>
          </div>
        ) : teams.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            No teams match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Team Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">College</th>
                  <th className="p-3.5">Leader Contact</th>
                  <th className="p-3.5">Members</th>
                  <th className="p-3.5">Fee</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teams.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => {
                      setSelectedTeam(t);
                      setIsViewModalOpen(true);
                    }}
                    className="hover:bg-purple-50/50 transition-all cursor-pointer"
                  >
                    <td className="p-3.5 font-bold text-gray-900">{t.team_name}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.category === 'Project Pitch' ? 'bg-pink-50 text-[#E83E8C]' : 'bg-purple-50 text-[#6C3B8F]'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-700">{t.college_name}</td>
                    <td className="p-3.5">
                      <div className="text-xs">
                        <span className="font-bold block text-gray-900">{t.leader_name}</span>
                        <span className="text-gray-500">{t.leader_email}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-700">{t.member_count} Students</td>
                    <td className="p-3.5 font-bold text-gray-900">₹{t.amount_paid}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        t.payment_status === 'success' ? 'bg-green-100 text-green-700' : t.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTeam(t);
                          setIsViewModalOpen(true);
                        }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        title="View Team Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(t.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Team"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View Team Details & Student Members */}
      {isViewModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="border-b border-gray-100 pb-4">
              <span className="she-category-tag text-xs">{selectedTeam.category}</span>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{selectedTeam.team_name}</h3>
              <p className="text-xs text-gray-500 mt-1">{selectedTeam.college_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-gray-400 block font-semibold uppercase">Leader Contact</span>
                <span className="font-bold text-gray-900 block">{selectedTeam.leader_name}</span>
                <span className="text-gray-600 block">{selectedTeam.leader_email}</span>
                <span className="text-gray-600 block">{selectedTeam.leader_phone}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-semibold uppercase">Payment Summary</span>
                <span className="font-bold text-gray-900 block">Amount: ₹{selectedTeam.amount_paid}</span>
                <span className="text-green-600 font-bold block capitalize">Status: {selectedTeam.payment_status}</span>
                <span className="text-gray-500 block truncate">Razorpay ID: {selectedTeam.razorpay_payment_id || 'N/A'}</span>
              </div>
            </div>

            {/* Pitch Proposal Details */}
            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 space-y-2 text-xs">
              <span className="font-extrabold text-[#6C3B8F] uppercase tracking-wider block">Pitch Proposal</span>
              <div className="flex justify-between flex-wrap gap-2">
                <div>
                  <span className="text-gray-500 block">Title of Idea / Project:</span>
                  <span className="font-bold text-gray-900 block text-sm">{selectedTeam.project_title || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Domain:</span>
                  <span className="font-bold text-purple-700 block bg-purple-100 px-2.5 py-0.5 rounded-full">{selectedTeam.domain || 'N/A'}</span>
                </div>
              </div>
              {selectedTeam.project_description && (
                <div className="pt-2 border-t border-purple-100">
                  <span className="text-gray-500 block">Brief Description:</span>
                  <p className="text-gray-700 mt-0.5 leading-relaxed">{selectedTeam.project_description}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-sm text-gray-900 mb-3">All Team Members ({selectedTeam.members?.length || 0})</h4>
              <div className="space-y-2.5">
                {Array.isArray(selectedTeam.members) &&
                  selectedTeam.members.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-white shadow-xs flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{m.student_name}</span>
                        {Boolean(m.is_leader) ? (
                          <span className="ml-2 bg-purple-100 text-[#6C3B8F] px-2 py-0.5 rounded font-bold">Team Leader</span>
                        ) : null}
                        <div className="text-gray-500 flex gap-3 mt-1">
                          <span>{m.email}</span>
                          <span>&bull;</span>
                          <span>{m.phone}</span>
                        </div>
                      </div>
                      <div className="text-right text-gray-600">
                        <span className="block font-semibold">{m.department || 'General'}</span>
                        <span className="block text-gray-400">{m.year_of_study || 'Student'}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Team Manually (Mirrors /register page logic) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6C3B8F] flex items-center justify-center font-bold shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">Add Team Manually</h3>
                  <p className="text-xs text-gray-500">Register participant team, members, and pitch details directly into ShePitch</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewTeam} className="space-y-6 text-xs">
              {/* Section 1: Team & College Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#6C3B8F]" />
                  1. Team & College Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Team Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Miss spark"
                      value={newTeam.team_name}
                      onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Participation Category *</label>
                    <select
                      value={newTeam.category}
                      onChange={(e) => setNewTeam({ ...newTeam, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    >
                      <option value="Idea Pitch">Idea Pitch (Early concept)</option>
                      <option value="Project Pitch">Project Pitch (Working prototype)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Select College / Institution *</label>
                    <select
                      value={selectedCollegeOption}
                      onChange={handleCollegeChange}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    >
                      <option value="Others">Others (Type College Manually)</option>
                      {colleges.map((c) => (
                        <option key={c.id} value={c.college_name}>
                          {c.college_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCollegeOption === 'Others' && (
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Type College / Institution Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Prathyusha Engineering College"
                        value={customCollegeName}
                        onChange={(e) => setCustomCollegeName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Team Members Roster */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#6C3B8F]" />
                    2. Team Members Roster ({newTeam.members.length}/4)
                  </h4>
                  {newTeam.members.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="text-xs font-bold text-[#6C3B8F] hover:text-[#582e75] flex items-center gap-1 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Member
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {newTeam.members.map((member, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-gray-900 text-xs">
                            Member {idx + 1}
                          </span>
                          {idx === 0 ? (
                            <span className="bg-purple-100 text-[#6C3B8F] font-bold text-[10px] px-2 py-0.5 rounded-full border border-purple-200">
                              Team Leader
                            </span>
                          ) : null}
                        </div>

                        {idx > 0 && newTeam.members.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="text-gray-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-gray-600 text-[11px] mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Student Name"
                            value={member.student_name}
                            onChange={(e) => handleMemberChange(idx, 'student_name', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-600 text-[11px] mb-1">Email Address *</label>
                          <input
                            type="email"
                            required
                            placeholder="student@example.com"
                            value={member.email}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-600 text-[11px] mb-1">Phone / WhatsApp *</label>
                          <input
                            type="tel"
                            required
                            placeholder="10-digit number"
                            value={member.phone}
                            onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-gray-600 text-[11px] mb-1">Department / Branch</label>
                          <input
                            type="text"
                            placeholder="e.g. B.Tech, AI&DS or CSE"
                            value={member.department}
                            onChange={(e) => handleMemberChange(idx, 'department', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-gray-600 text-[11px] mb-1">Year of Study</label>
                          <select
                            value={member.year_of_study}
                            onChange={(e) => handleMemberChange(idx, 'year_of_study', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                          >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Post Graduate">Post Graduate</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Pitch Proposal */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6C3B8F]" />
                  3. Pitch Proposal
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Title of Idea / Project</label>
                    <input
                      type="text"
                      placeholder="e.g. MISS VOICE"
                      value={newTeam.project_title}
                      onChange={(e) => setNewTeam({ ...newTeam, project_title: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Domain / Track</label>
                    <select
                      value={newTeam.domain}
                      onChange={(e) => setNewTeam({ ...newTeam, domain: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    >
                      <option value="AI and Machine Learning">AI and Machine Learning</option>
                      <option value="AIML">AIML</option>
                      <option value="Healthcare and MedTech">Healthcare and MedTech</option>
                      <option value="CleanTech and Sustainability">CleanTech and Sustainability</option>
                      <option value="FinTech and Banking">FinTech and Banking</option>
                      <option value="Cybersecurity and Privacy">Cybersecurity and Privacy</option>
                      <option value="EdTech and Smart Education">EdTech and Smart Education</option>
                      <option value="Web3 and Blockchain">Web3 and Blockchain</option>
                      <option value="IoT, Hardware and Robotics">IoT, Hardware and Robotics</option>
                      <option value="Social Impact and Governance">Social Impact and Governance</option>
                      <option value="Other / Interdisciplinary">Other / Interdisciplinary</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Brief Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short description of the pitch proposal..."
                    value={newTeam.project_description}
                    onChange={(e) => setNewTeam({ ...newTeam, project_description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                  />
                </div>
              </div>

              {/* Section 4: Fee, Coupon & Payment Setup */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#6C3B8F]" />
                  4. Fee, Coupon & Payment Setup
                </h4>

                {/* Coupon Code Section */}
                <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
                  <label className="block font-bold text-gray-700 text-xs">Coupon Code (Optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SHEPITCH100 or SHEPITCH150"
                      value={newTeam.coupon_code}
                      onChange={(e) => setNewTeam({ ...newTeam, coupon_code: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs uppercase tracking-wider text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="bg-[#6C3B8F] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#582e75] transition-all shrink-0 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] font-semibold text-rose-600">{couponError}</p>}
                  {couponSuccess && <p className="text-[11px] font-bold text-emerald-600">{couponSuccess}</p>}
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Fee Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newTeam.amount_paid}
                      onChange={(e) => setNewTeam({ ...newTeam, amount_paid: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      Base: ₹299 × {newTeam.members.length} members
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Payment Status *</label>
                    <select
                      value={newTeam.payment_status}
                      onChange={(e) => setNewTeam({ ...newTeam, payment_status: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    >
                      <option value="success">Success (Confirmed)</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Razorpay Payment ID</label>
                    <input
                      type="text"
                      placeholder="pay_... (optional)"
                      value={newTeam.razorpay_payment_id}
                      onChange={(e) => setNewTeam({ ...newTeam, razorpay_payment_id: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                    />
                  </div>
                </div>

                {/* Dispatch Email Checkbox */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    id="admin_send_email"
                    checked={newTeam.send_email}
                    onChange={(e) => setNewTeam({ ...newTeam, send_email: e.target.checked })}
                    className="w-4 h-4 text-[#6C3B8F] border-gray-300 rounded focus:ring-[#6C3B8F] cursor-pointer accent-[#6C3B8F]"
                  />
                  <label htmlFor="admin_send_email" className="text-xs font-semibold text-gray-700 cursor-pointer select-none">
                    Dispatch official ShePitch confirmation email to Team Leader upon saving
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="she-btn-outline text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="she-btn-primary text-xs py-2 px-5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {isSaving ? 'Saving Team...' : 'Save Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
