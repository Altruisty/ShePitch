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
} from 'lucide-react';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('success');

  // Selected Team for View/Edit modal
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Team
  const [newTeam, setNewTeam] = useState({
    team_name: '',
    category: 'Idea Pitch',
    college_name: '',
    leader_name: '',
    leader_email: '',
    leader_phone: '',
    amount_paid: 598,
    payment_status: 'success',
    members: [
      { student_name: '', email: '', phone: '', department: 'CSE', year_of_study: '3rd Year', is_leader: true },
      { student_name: '', email: '', phone: '', department: 'ECE', year_of_study: '3rd Year', is_leader: false },
    ],
  });

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
      console.error('Error fetching teams:', err);
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
      console.error('Error fetching colleges:', err);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [collegeFilter, categoryFilter, statusFilter, search]);

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

  const handleAddMemberRow = () => {
    if (newTeam.members.length >= 4) {
      alert('Maximum 4 members allowed per team.');
      return;
    }
    setNewTeam({
      ...newTeam,
      members: [
        ...newTeam.members,
        { student_name: '', email: '', phone: '', department: 'CSE', year_of_study: '2nd Year', is_leader: false },
      ],
    });
  };

  const handleSaveNewTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create team');

      setIsAddModalOpen(false);
      fetchTeams();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Teams & Student Roster</h2>
          <p className="text-xs text-gray-500">Manage participant details, college links, and registration status</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="she-btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Team Manually
        </button>
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
              {colleges.map((c) => (
                <option key={c.id} value={c.college_name}>
                  {c.college_name}
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
                        {m.is_leader && <span className="ml-2 bg-purple-100 text-[#6C3B8F] px-2 py-0.5 rounded font-bold">Team Leader</span>}
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

      {/* Modal: Add Team Manually */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-extrabold text-gray-900">Add Team Manually</h3>

            <form onSubmit={handleSaveNewTeam} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    value={newTeam.team_name}
                    onChange={(e) => setNewTeam({ ...newTeam, team_name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newTeam.category}
                    onChange={(e) => setNewTeam({ ...newTeam, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                  >
                    <option value="Idea Pitch">Idea Pitch</option>
                    <option value="Project Pitch">Project Pitch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">College Name</label>
                  <input
                    type="text"
                    required
                    value={newTeam.college_name}
                    onChange={(e) => setNewTeam({ ...newTeam, college_name: e.target.value })}
                    placeholder="e.g. Jeppiaar University"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Fee Amount (₹)</label>
                  <input
                    type="number"
                    value={newTeam.amount_paid}
                    onChange={(e) => setNewTeam({ ...newTeam, amount_paid: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Leader Name</label>
                  <input
                    type="text"
                    required
                    value={newTeam.leader_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updatedMembers = [...newTeam.members];
                      updatedMembers[0].student_name = val;
                      setNewTeam({ ...newTeam, leader_name: val, members: updatedMembers });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Leader Email</label>
                  <input
                    type="email"
                    required
                    value={newTeam.leader_email}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updatedMembers = [...newTeam.members];
                      updatedMembers[0].email = val;
                      setNewTeam({ ...newTeam, leader_email: val, members: updatedMembers });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Leader Phone</label>
                  <input
                    type="text"
                    required
                    value={newTeam.leader_phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      const updatedMembers = [...newTeam.members];
                      updatedMembers[0].phone = val;
                      setNewTeam({ ...newTeam, leader_phone: val, members: updatedMembers });
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="she-btn-outline text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="she-btn-primary text-xs py-2 px-4">
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
