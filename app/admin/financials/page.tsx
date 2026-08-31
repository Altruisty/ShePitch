'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  PlusCircle,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  X,
  Plus,
  CheckCircle2,
  Building2,
  Users,
  CreditCard,
  FileText,
  Calendar,
  Wallet,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function AdminFinancialsPage() {
  const [summary, setSummary] = useState({
    teamRevenue: 0,
    paidTeamCount: 0,
    sponsorshipIncome: 0,
    totalGrossIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  });

  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter & Search
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [form, setForm] = useState({
    title: '',
    type: 'cash_out',
    category: 'Event Venue & Campus',
    amount: '',
    transaction_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchFinancials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/financials');
      if (!res.ok) throw new Error('Failed to fetch financial records.');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setCategoryBreakdown(data.categoryBreakdown || []);
        setTransactions(data.transactions || []);
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
    fetchFinancials();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    if (!form.title || !form.title.trim()) {
      setModalError('Description / Title is required.');
      setSubmitting(false);
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setModalError('Valid positive amount is required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/financials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add financial record.');
      }

      setIsModalOpen(false);
      setForm({
        title: '',
        type: 'cash_out',
        category: 'Event Venue & Campus',
        amount: '',
        transaction_date: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      fetchFinancials();
    } catch (err: any) {
      setModalError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/financials?id=${deleteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchFinancials();
      } else {
        alert(data.error || 'Failed to delete transaction');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting entry');
    } finally {
      setDeleting(false);
    }
  };

  // CSV Exports
  const exportFullReportCSV = () => {
    const headers = ['ID / Source', 'Transaction Title', 'Type', 'Category', 'Amount (INR)', 'Date', 'Notes'];

    // Add Live Team Registration Summary Entry
    const teamRow = [
      'AUTO-TEAMS-REVENUE',
      `"Team Registrations Income (${summary.paidTeamCount} Confirmed Paid Teams)"`,
      'Team Registration Income',
      'Team Registration Fees',
      summary.teamRevenue,
      `"${new Date().toISOString().slice(0, 10)}"`,
      '"Live database auto-synchronized total"',
    ];

    const customRows = transactions.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type === 'sponsorship' ? 'Sponsorship Income' : t.type === 'cash_in' ? 'Cash In' : 'Cash Out Expense',
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${new Date(t.transaction_date).toLocaleDateString('en-US')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), teamRow.join(','), ...customRows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShePitch_Financial_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExpensesCSV = () => {
    const expenses = transactions.filter((t) => t.type === 'cash_out');
    if (expenses.length === 0) {
      alert('No cash-out expense records to export.');
      return;
    }

    const headers = ['ID', 'Expense Description', 'Category', 'Amount (INR)', 'Expense Date', 'Notes'];
    const rows = expenses.map((t) => [
      t.id,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${new Date(t.transaction_date).toLocaleDateString('en-US')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ShePitch_Expenses_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered List
  const filteredTransactions = transactions.filter((t) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'income'
        ? t.type === 'sponsorship' || t.type === 'cash_in'
        : t.type === 'cash_out';

    const matchesSearch =
      search === '' ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const grossIncome = summary.totalGrossIncome || 1;
  const cashInRatio = Math.min(100, Math.round((summary.totalGrossIncome / (summary.totalGrossIncome + summary.totalExpenses || 1)) * 100));
  const cashOutRatio = Math.min(100, Math.round((summary.totalExpenses / (summary.totalGrossIncome + summary.totalExpenses || 1)) * 100));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              FINANCIAL MANAGEMENT
            </span>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
              LIVE REVENUE SYNCHRONIZED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            Expense Tracker & Financial Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage team registrations revenue, sponsorship cash-in, and cash-out expenses with real-time audit reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchFinancials}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:text-[#6C3B8F] rounded-xl hover:bg-gray-50 transition-all shadow-sm"
            title="Refresh Financial Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportFullReportCSV}
            className="p-2.5 bg-white border border-gray-200 text-gray-700 hover:text-[#6C3B8F] rounded-xl hover:bg-gray-50 transition-all shadow-sm text-xs font-bold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Full Statement CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="she-btn-primary py-2.5 px-4 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Card 1: Team Registration Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
              Team Reg. Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6C3B8F] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            ₹{summary.teamRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            {summary.paidTeamCount} Paid Registered Teams
          </p>
        </div>

        {/* Card 2: Sponsorship & Cash In */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
              Sponsorships & Cash In
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            ₹{summary.sponsorshipIncome.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Partner & Sponsor Funds
          </p>
        </div>

        {/* Card 3: Total Gross Income */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
              Total Gross Cash In
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            ₹{summary.totalGrossIncome.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 font-medium">
            Teams + Sponsorship Cash In
          </p>
        </div>

        {/* Card 4: Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
              Total Cash Out (Expenses)
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-red-600">
            ₹{summary.totalExpenses.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> Event Costs & Expenses
          </p>
        </div>

        {/* Card 5: Net Balance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
              Net Balance / Surplus
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                summary.netBalance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black ${
              summary.netBalance >= 0 ? 'text-green-700' : 'text-red-600'
            }`}
          >
            ₹{summary.netBalance.toLocaleString('en-IN')}
          </div>
          <span
            className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              summary.netBalance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {summary.netBalance >= 0 ? 'Positive Surplus' : 'Net Deficit'}
          </span>
        </div>
      </div>

      {/* VISUALIZATION CHARTS & BREAKDOWN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Financial Ratio & Income Sources */}
        <div className="lg:col-span-7 space-y-6">
          {/* Income vs Expense Balance Chart */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#6C3B8F]" />
                  Cash In vs Cash Out Financial Ratio
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comparison between total gross cash in and total cash out expenses
                </p>
              </div>
              <span className="text-xs font-black text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                Gross Flow: ₹{(summary.totalGrossIncome + summary.totalExpenses).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Visual Ratio Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Total Cash In ({cashInRatio}%)
                </span>
                <span className="text-red-600 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Cash Out Expenses ({cashOutRatio}%)
                </span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${cashInRatio}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Cash In: ₹${summary.totalGrossIncome.toLocaleString('en-IN')}`}
                />
                <div
                  style={{ width: `${cashOutRatio}%` }}
                  className="bg-red-500 h-full transition-all duration-500"
                  title={`Expenses: ₹${summary.totalExpenses.toLocaleString('en-IN')}`}
                />
              </div>
            </div>

            {/* Revenue Breakdown comparison bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Source 1: Team Registration Revenue */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Team Registrations</span>
                  <span className="text-[#6C3B8F]">
                    {Math.round((summary.teamRevenue / grossIncome) * 100)}% of Revenue
                  </span>
                </div>
                <div className="text-lg font-black text-[#6C3B8F]">
                  ₹{summary.teamRevenue.toLocaleString('en-IN')}
                </div>
                <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.round((summary.teamRevenue / grossIncome) * 100)}%` }}
                    className="bg-[#6C3B8F] h-full"
                  />
                </div>
              </div>

              {/* Source 2: Sponsorship Funds */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Sponsorship & Cash In</span>
                  <span className="text-blue-700">
                    {Math.round((summary.sponsorshipIncome / grossIncome) * 100)}% of Revenue
                  </span>
                </div>
                <div className="text-lg font-black text-blue-700">
                  ₹{summary.sponsorshipIncome.toLocaleString('en-IN')}
                </div>
                <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.round((summary.sponsorshipIncome / grossIncome) * 100)}%` }}
                    className="bg-blue-600 h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Category Expense Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-red-600" />
                Expenses by Category
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Cash out expenditure distribution</p>
            </div>
            <button
              onClick={exportExpensesCSV}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="p-8 text-center text-gray-400 space-y-2">
              <FileText className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-xs font-bold text-gray-500">No cash out expenses recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {categoryBreakdown.map((cat, idx) => {
                const percentage = summary.totalExpenses > 0 ? Math.round((cat.total / summary.totalExpenses) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <span className="truncate max-w-[200px]">{cat.category}</span>
                      <span className="text-gray-900">
                        ₹{cat.total.toLocaleString('en-IN')}{' '}
                        <span className="text-gray-400 font-normal">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TRANSACTION LEDGER TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          {/* Tab Filters */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Records ({transactions.length})
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === 'income'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Income & Sponsorships
            </button>
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                activeTab === 'expense'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Expenses (Cash Out)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search description, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-3 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
            />
          </div>
        </div>

        {/* Live Team Revenue Highlight Card in Ledger */}
        {(activeTab === 'all' || activeTab === 'income') && (
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6C3B8F] text-white flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="bg-purple-200 text-purple-900 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  Auto-Synchronized Database Income
                </span>
                <h4 className="text-sm font-black text-gray-900 mt-0.5">
                  Team Registration Fees ({summary.paidTeamCount} Paid Registered Teams)
                </h4>
                <p className="text-gray-600 text-[11px]">
                  Real-time calculated directly from confirmed team Razorpay payments
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#6C3B8F]">
                + ₹{summary.teamRevenue.toLocaleString('en-IN')}
              </span>
              <span className="block text-[10px] text-gray-500 font-semibold">Live Database Sync</span>
            </div>
          </div>
        )}

        {/* Data Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <div className="w-8 h-8 border-3 border-[#6C3B8F] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold">Loading Financial Ledger...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-gray-400 space-y-2">
            <Wallet className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-sm font-bold text-gray-600">No matching custom financial records found.</p>
            <p className="text-xs text-gray-400">
              Click &quot;Record Transaction&quot; above to add sponsorship cash-in or expenses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-900 font-extrabold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Description / Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Amount (₹)</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredTransactions.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-all">
                    <td className="py-3.5 px-4 text-xs font-bold text-gray-600 whitespace-nowrap">
                      {new Date(row.transaction_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-gray-900">
                      {row.title}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.type === 'sponsorship' ? (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Sponsorship
                        </span>
                      ) : row.type === 'cash_in' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Cash In
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" /> Cash Out
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {row.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black whitespace-nowrap">
                      <span className={row.type === 'cash_out' ? 'text-red-600' : 'text-emerald-700'}>
                        {row.type === 'cash_out' ? '-' : '+'} ₹{Number(row.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500 max-w-xs truncate">
                      {row.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeleteId(row.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Record"
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

      {/* ADD TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-100 pb-3">
              <span className="bg-purple-100 text-[#6C3B8F] text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                NEW FINANCIAL ENTRY
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 mt-1">
                Record Financial Transaction
              </h3>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Type Select */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                  Transaction Type *
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                >
                  <option value="cash_out">Expense (Cash Out)</option>
                  <option value="sponsorship">Sponsorship Income</option>
                  <option value="cash_in">Other Cash In Income</option>
                </select>
              </div>

              {/* Title / Description */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                  Description / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venue Booking Advance, Google Cloud Sponsorship"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                />
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                  >
                    <option value="Event Venue & Campus">Event Venue & Campus</option>
                    <option value="Prizes & Cash Awards">Prizes & Cash Awards</option>
                    <option value="Trophies & Certificates">Trophies & Certificates</option>
                    <option value="Catering & Hospitality">Catering & Hospitality</option>
                    <option value="Marketing & Printing">Marketing & Printing</option>
                    <option value="Logistics & Travel">Logistics & Travel</option>
                    <option value="Sponsorship Funds">Sponsorship Funds</option>
                    <option value="Miscellaneous & Office">Miscellaneous & Office</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                    Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 25000"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                  Transaction Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.transaction_date}
                  onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">
                  Optional Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Receipt number, reference, or invoice details..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6C3B8F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="she-btn-primary py-2.5 px-6 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-extrabold text-gray-900">Delete Financial Entry?</h3>
            <p className="text-xs text-gray-600">
              Are you sure you want to delete this financial entry? This will adjust your total financial balance report.
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
