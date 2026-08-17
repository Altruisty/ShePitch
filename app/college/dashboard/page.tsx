'use client';

import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, RefreshCw, Eye, X, Award, CheckCircle } from 'lucide-react';

export default function CollegeDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCollegeTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/college/teams');
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error('Error fetching college teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollegeTeams();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-gray-500 gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-[#6C3B8F]" />
        <span>Loading Institutional Dashboard...</span>
      </div>
    );
  }

  const teams = data?.teams || [];
  const totalStudents = teams.reduce((acc: number, t: any) => acc + Number(t.member_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-gradient-to-r from-[#6C3B8F] to-[#E83E8C] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="bg-white/20 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {data?.college_name}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">Institutional Registration Roster</h2>
          <p className="text-white/90 text-xs sm:text-sm mt-1">
            Tracking all teams and women innovators registered from your college for ShePitch 2026.
          </p>
        </div>

        <div className="flex gap-4 shrink-0">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[110px]">
            <span className="block text-2xl sm:text-3xl font-extrabold">{teams.length}</span>
            <span className="text-[11px] text-white/80 uppercase font-semibold">Teams</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[110px]">
            <span className="block text-2xl sm:text-3xl font-extrabold">{totalStudents}</span>
            <span className="text-[11px] text-white/80 uppercase font-semibold">Students</span>
          </div>
        </div>
      </div>

      {/* Teams Roster Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Registered Teams</h3>
            <p className="text-xs text-gray-500">Live roster of student participants</p>
          </div>
          <button onClick={fetchCollegeTeams} className="p-2 text-gray-500 hover:text-gray-900 rounded-xl bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            No student teams registered from your college yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Team Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Leader Name</th>
                  <th className="p-3.5">Leader Contact</th>
                  <th className="p-3.5">Members</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teams.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50/60 transition-all">
                    <td className="p-3.5 font-bold text-gray-900">{t.team_name}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.category === 'Project Pitch' ? 'bg-pink-50 text-[#E83E8C]' : 'bg-purple-50 text-[#6C3B8F]'}`}>
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-900 font-medium">{t.leader_name}</td>
                    <td className="p-3.5 text-xs text-gray-500">
                      <span className="block text-gray-900 font-medium">{t.leader_email}</span>
                      <span className="block">{t.leader_phone}</span>
                    </td>
                    <td className="p-3.5 font-bold text-gray-800">{t.member_count} Members</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        t.payment_status === 'success' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedTeam(t);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                        title="View Team Roster"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View Team Roster Details */}
      {isModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>

            <div className="border-b border-gray-100 pb-4">
              <span className="she-category-tag text-xs">{selectedTeam.category}</span>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{selectedTeam.team_name}</h3>
              <p className="text-xs text-gray-500 mt-1">Leader: {selectedTeam.leader_name} ({selectedTeam.leader_phone})</p>
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
              <h4 className="font-bold text-sm text-gray-900 mb-3">Student Members</h4>
              <div className="space-y-2.5">
                {Array.isArray(selectedTeam.members) &&
                  selectedTeam.members.map((m: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{m.student_name}</span>
                        {Boolean(m.is_leader) ? (
                          <span className="ml-2 bg-purple-100 text-[#6C3B8F] px-2 py-0.5 rounded font-bold">Team Leader</span>
                        ) : null}
                        <div className="text-gray-500 mt-0.5">{m.email} &bull; {m.phone}</div>
                      </div>
                      <div className="text-right text-gray-600">
                        <span className="block font-semibold">{m.department || 'N/A'}</span>
                        <span className="block text-gray-400">{m.year_of_study || ''}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
