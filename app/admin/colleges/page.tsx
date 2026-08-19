'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Mail, Lock, User, Key, RefreshCw, X, CheckCircle, Shield } from 'lucide-react';

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);

  const [form, setForm] = useState({
    college_name: '',
    rep_name: '',
    username: '',
    email: '',
    password: '',
    status: 'active',
  });

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/colleges');
      const data = await res.json();
      if (data.success) {
        setColleges(data.colleges || []);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCollege ? `/api/colleges/${editingCollege.id}` : '/api/colleges';
      const method = editingCollege ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');

      alert(editingCollege ? 'College updated successfully' : 'College registered successfully. Welcome email with credentials dispatched.');
      setIsAddModalOpen(false);
      setEditingCollege(null);
      setForm({ college_name: '', rep_name: '', username: '', email: '', password: '', status: 'active' });
      fetchColleges();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCollege = async (id: number) => {
    if (!confirm('Are you sure you want to delete this college partner account?')) return;
    try {
      const res = await fetch(`/api/colleges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchColleges();
      }
    } catch (err) {
      alert('Failed to delete college');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">College Management</h2>
          <p className="text-xs text-gray-500">Register institutions, manage login credentials & representative profiles</p>
        </div>
        <button
          onClick={() => {
            setEditingCollege(null);
            setForm({ college_name: '', rep_name: '', username: '', email: '', password: '', status: 'active' });
            setIsAddModalOpen(true);
          }}
          className="she-btn-primary text-xs py-2.5 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add College Partner
        </button>
      </div>

      {/* College List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-4">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#6C3B8F]" />
            <span>Loading colleges...</span>
          </div>
        ) : colleges.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            No college partner accounts registered yet. Click "Add College Partner" to register one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {colleges.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-lg transition-all space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6C3B8F] flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 leading-snug">{c.college_name}</h3>
                    <p className="text-xs text-gray-500">Rep: {c.rep_name}</p>
                  </div>

                  <div className="pt-2 space-y-1 text-xs text-gray-600 border-t border-gray-100">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-bold text-gray-800">Username: {c.username}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setEditingCollege(c);
                      setForm({
                        college_name: c.college_name,
                        rep_name: c.rep_name,
                        username: c.username,
                        email: c.email,
                        password: '',
                        status: c.status || 'active',
                      });
                      setIsAddModalOpen(true);
                    }}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-all text-xs font-bold flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCollege(c.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all text-xs font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Add/Edit College */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <h3 className="text-xl font-extrabold text-gray-900">
                {editingCollege ? 'Edit College Partner' : 'Add College Partner'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {editingCollege ? 'Update details or reset login password' : 'Register college & dispatch email credentials'}
              </p>
            </div>

            <form onSubmit={handleSaveCollege} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">College Name</label>
                <input
                  type="text"
                  required
                  value={form.college_name}
                  onChange={(e) => setForm({ ...form, college_name: e.target.value })}
                  placeholder="e.g. Jeppiaar University"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Representative Name</label>
                <input
                  type="text"
                  required
                  value={form.rep_name}
                  onChange={(e) => setForm({ ...form, rep_name: e.target.value })}
                  placeholder="e.g. Dr. S. Meenakshi"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Login Username</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. jeppiaar"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="rep@college.ac.in"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {editingCollege ? 'New Password (Leave blank to keep unchanged)' : 'Login Password'}
                </label>
                <input
                  type="password"
                  required={!editingCollege}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter login password"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="she-btn-outline text-xs py-2 px-4">
                  Cancel
                </button>
                <button type="submit" className="she-btn-primary text-xs py-2 px-4">
                  {editingCollege ? 'Update College' : 'Save & Dispatch Credentials Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
