'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, RefreshCw, CheckCircle, AlertCircle, Users, FileText } from 'lucide-react';

export default function AdminMailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    target_type: 'single', // 'single', 'all_leaders'
    target_email: '',
    subject: 'ShePitch Chennai Important Announcement',
    message_body: '',
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/mail');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/admin/mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send mail');

      alert(data.message || 'Email dispatched successfully');
      setForm({ target_type: 'single', target_email: '', subject: 'ShePitch Chennai Announcement', message_body: '' });
      fetchLogs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Email Composer */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5 h-fit">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Email Dispatcher</h2>
          <p className="text-xs text-gray-500">Send custom messages or broadcast emails via Nodemailer SMTP</p>
        </div>

        <form onSubmit={handleSendMail} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Target Recipient</label>
            <select
              value={form.target_type}
              onChange={(e) => setForm({ ...form, target_type: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
            >
              <option value="single">Single Recipient Email</option>
              <option value="all_leaders">Broadcast to All Confirmed Team Leaders</option>
            </select>
          </div>

          {form.target_type === 'single' && (
            <div>
              <label className="block font-bold text-gray-700 mb-1">Recipient Email</label>
              <input
                type="email"
                required
                value={form.target_email}
                onChange={(e) => setForm({ ...form, target_email: e.target.value })}
                placeholder="student@gmail.com"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 mb-1">Email Subject</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Message Body</label>
            <textarea
              required
              rows={6}
              value={form.message_body}
              onChange={(e) => setForm({ ...form, message_body: e.target.value })}
              placeholder="Type email announcement content here..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#6C3B8F]"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full she-btn-primary justify-center py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            {sending ? 'Dispatching...' : 'Send Email Now'} <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right Column: Email Logs Table */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Email Audit History</h2>
            <p className="text-xs text-gray-500">Log of sent confirmation, credentials, and broadcast emails</p>
          </div>
          <button onClick={fetchLogs} className="p-2 text-gray-500 hover:text-gray-900 rounded-xl bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">Loading email logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Recipient</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">
                      No emails sent yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50/60 transition-all">
                      <td className="p-3.5 font-bold text-gray-900">{l.recipient_email}</td>
                      <td className="p-3.5 text-gray-700 max-w-[200px] truncate">{l.subject}</td>
                      <td className="p-3.5 text-gray-500 font-mono text-[11px]">{l.email_type}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          l.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
