'use client';

import React, { useState, useEffect } from 'react';
import {
  Ticket,
  Search,
  Filter,
  Download,
  Trash2,
  Building2,
  Calendar,
  Users,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  GraduationCap,
} from 'lucide-react';

export default function AdminConferencePage() {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalColleges: 0,
    todayRegistrations: 0,
  });

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedYear) queryParams.append('year', selectedYear);

      const res = await fetch(`/api/admin/conference?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch conference registrations.');
      const data = await res.json();

      if (data.success) {
        setStats(data.stats);
        setRegistrations(data.registrations || []);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [selectedYear]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistrations();
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedYear('');
    fetchRegistrations();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/conference?id=${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRegistrations(registrations.filter((r) => r.id !== deleteId));
        setStats({ ...stats, totalRegistrations: Math.max(0, stats.totalRegistrations - 1) });
        setDeleteId(null);
      } else {
        alert(data.error || 'Failed to delete entry');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting entry');
    } finally {
      setDeleting(false);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      'ID',
      'Full Name',
      'Email',
      'Phone',
      'College Name',
      'Department',
      'Year of Study',
      'Registration Date',
    ];

    const rows = registrations.map((r) => [
      r.id,
      `"${(r.full_name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.college_name || '').replace(/"/g, '""')}"`,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      `"${(r.year_of_study || '').replace(/"/g, '""')}"`,
      `"${new Date(r.created_at).toLocaleString()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShePitch_Conference_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              FREE REGISTRATION PORTAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Conference Registrations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            ShePitch Conference Chennai Edition — Registration details & filter analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRegistrations}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:text-[#6C3B8F] rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={exportToCSV}
            disabled={registrations.length === 0}
            className="she-btn-primary py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Total Registrations */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6C3B8F] flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Total Registrations
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {stats.totalRegistrations}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Registrations */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Registered Today
            </span>
            <span className="text-2xl sm:text-3xl font-black text-gray-900">
              {stats.todayRegistrations}
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, college, dept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
            />
          </div>

          {/* Year Filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#6C3B8F] text-gray-700 cursor-pointer"
            >
              <option value="">All Years of Study</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Post Graduate (PG)">Post Graduate (PG)</option>
              <option value="Faculty / Educator">Faculty / Educator</option>
              <option value="Industry Professional / Other">Industry Professional / Other</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-1 flex gap-2">
            <button
              type="submit"
              className="w-full bg-[#6C3B8F] hover:bg-[#5a2e7a] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
              title="Filter Results"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {(search || selectedYear) && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>
              Showing filtered results ({registrations.length} delegates)
            </span>
            <button
              onClick={resetFilters}
              className="text-[#6C3B8F] font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <div className="w-8 h-8 border-3 border-[#6C3B8F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold">Loading Conference Registrations...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Ticket className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-700">No Registrations Found</h3>
            <p className="text-xs text-gray-400">
              No registration records match your current search and filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 font-extrabold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4"># ID</th>
                  <th className="py-3.5 px-4">Attendee Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">College / Institution</th>
                  <th className="py-3.5 px-4">Department & Year</th>
                  <th className="py-3.5 px-4">Date Registered</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {registrations.map((row) => (
                  <tr key={row.id} className="hover:bg-purple-50/30 transition-all">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-500">
                      #CONF-{String(row.id).padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-gray-900 text-sm">{row.full_name}</div>
                      <span className="inline-block bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5">
                        Free Pass
                      </span>
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="text-gray-900 font-semibold">{row.email}</div>
                      <div className="text-gray-500 text-xs">{row.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-800 block">{row.college_name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-purple-900 block">{row.department}</span>
                      <span className="text-xs text-gray-500">{row.year_of_study}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      {new Date(row.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      <span className="block text-[10px] text-gray-400">
                        {new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setDeleteId(row.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Registration"
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

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-extrabold text-gray-900">Delete Conference Registration?</h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to remove registration #CONF-{String(deleteId).padStart(4, '0')}? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
