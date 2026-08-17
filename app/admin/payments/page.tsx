'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, RefreshCw, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ status: statusFilter, search }).toString();
      const res = await fetch(`/api/admin/payments?${query}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Payment Audit Logs</h2>
          <p className="text-xs text-gray-500">Real-time Razorpay transaction logs (Success, Pending, Failed)</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, Payment ID, or Team..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-800 focus:outline-none focus:border-[#6C3B8F]"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {['all', 'success', 'pending', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#6C3B8F]" />
            <span>Loading payment records...</span>
          </div>
        ) : payments.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            No payment transaction logs match the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Team & Leader</th>
                  <th className="p-3.5">Razorpay Order ID</th>
                  <th className="p-3.5">Razorpay Payment ID</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-all">
                    <td className="p-3.5 font-bold text-gray-900">
                      <div>
                        <span>{p.team_name || 'N/A'}</span>
                        <span className="block text-xs font-normal text-gray-500">{p.leader_name} ({p.leader_email})</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-gray-700">{p.razorpay_order_id}</td>
                    <td className="p-3.5 font-mono text-xs text-gray-700">{p.razorpay_payment_id || 'N/A'}</td>
                    <td className="p-3.5 font-bold text-gray-900">₹{p.amount}</td>
                    <td className="p-3.5 text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        p.status === 'success' ? 'bg-green-100 text-green-700' : p.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
