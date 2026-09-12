'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  Table as TableIcon,
  Search,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileJson,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  X,
  Code,
  ArrowRight,
  ShieldCheck,
  Server,
  Sparkles,
} from 'lucide-react';

interface ColumnMeta {
  field: string;
  type: string;
  nullable: boolean;
  key: string;
  default: any;
  extra: string;
}

interface TableData {
  name: string;
  columns: ColumnMeta[];
  rowCount: number;
  rows: Record<string, any>[];
  error?: string;
}

interface DBFullResponse {
  success: boolean;
  database: string;
  host: string;
  totalTables: number;
  totalRows: number;
  timestamp: string;
  tables: TableData[];
}

export default function DatabaseFullShowPage() {
  const [data, setData] = useState<DBFullResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Navigation Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTableTab, setSelectedTableTab] = useState<string>('all');
  const [tableSearchMap, setTableSearchMap] = useState<Record<string, string>>({});
  const [collapsedTables, setCollapsedTables] = useState<Record<string, boolean>>({});
  const [activeSchemaModal, setActiveSchemaModal] = useState<TableData | null>(null);

  // Cell Detail Inspector Modal
  const [cellModal, setCellModal] = useState<{
    tableName: string;
    colName: string;
    value: any;
    rowIndex: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch Database tables and records
  const fetchDatabaseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/db/full');
      const json: DBFullResponse = await res.json();
      if (!res.ok || !json.success) {
        throw new Error((json as any).error || 'Failed to fetch database content');
      }
      setData(json);
    } catch (err: any) {
      console.error('Failed to load database:', err);
      setError(err.message || 'An unexpected error occurred while querying the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  // Filter tables based on global search or selected tab
  const visibleTables = useMemo(() => {
    if (!data?.tables) return [];
    let list = data.tables;

    // Filter by single tab selection if not 'all'
    if (selectedTableTab !== 'all') {
      list = list.filter((t) => t.name === selectedTableTab);
    }

    // Filter by global search (matches table name or column name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.columns.some((c) => c.field.toLowerCase().includes(q))
      );
    }

    return list;
  }, [data, selectedTableTab, searchQuery]);

  // Export a single table to CSV
  const exportTableCSV = (table: TableData) => {
    if (!table.rows || table.rows.length === 0) {
      alert(`Table "${table.name}" has no rows to export.`);
      return;
    }

    const headers = table.columns.map((c) => c.field);
    const rows = table.rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val === null || val === undefined) return '""';
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return `"${str.replace(/"/g, '""').replace(/[\r\n]+/g, ' ').trim()}"`;
        })
        .join(',')
    );

    const csvContent =
      '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${table.name}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export a single table to JSON
  const exportTableJSON = (table: TableData) => {
    const jsonStr = JSON.stringify(table.rows, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${table.name}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export entire Database to JSON Dump
  const exportFullDatabaseJSON = () => {
    if (!data) return;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShePitch_Database_${data.database}_Dump_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleTableCollapse = (tableName: string) => {
    setCollapsedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  const formatCellValue = (val: any) => {
    if (val === null || val === undefined) {
      return (
        <span className="text-gray-400 italic text-[11px] font-mono bg-gray-100/70 px-1.5 py-0.5 rounded">
          NULL
        </span>
      );
    }
    if (typeof val === 'boolean') {
      return val ? (
        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
          TRUE
        </span>
      ) : (
        <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md font-semibold text-[11px]">
          FALSE
        </span>
      );
    }
    if (typeof val === 'object') {
      const str = JSON.stringify(val);
      return (
        <span className="font-mono text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 inline-block max-w-[220px] truncate">
          {str}
        </span>
      );
    }

    const str = String(val);

    // Status pill
    const lower = str.toLowerCase();
    if (lower === 'success' || lower === 'active' || lower === 'sent') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {str}
        </span>
      );
    }
    if (lower === 'pending') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          {str}
        </span>
      );
    }
    if (lower === 'failed' || lower === 'inactive') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {str}
        </span>
      );
    }

    // Timestamps
    if (str.includes('T') && str.endsWith('Z') && !isNaN(Date.parse(str))) {
      try {
        const d = new Date(str);
        return (
          <span className="text-gray-700 text-xs font-mono whitespace-nowrap" title={str}>
            {d.toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        );
      } catch {
        return str;
      }
    }

    // Truncate long strings for compact display
    if (str.length > 65) {
      return (
        <span className="text-gray-800 text-xs truncate max-w-[260px] inline-block" title={str}>
          {str.slice(0, 65)}...
        </span>
      );
    }

    return <span className="text-gray-800 text-xs font-medium">{str}</span>;
  };

  return (
    <div className="min-h-screen bg-[#FDFBFD] text-gray-900 pb-20 selection:bg-purple-100">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-purple-100 shadow-xs">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C3B8F] to-[#E83E8C] flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  ShePitch Database Viewer
                </h1>
                <span className="bg-purple-100 text-[#6C3B8F] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  LIVE INSPECT
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                All MySQL tables & records at <code className="text-[#6C3B8F] font-semibold">/db/full/show</code>
              </p>
            </div>
          </div>

          {/* Quick links & Refresh */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/teams"
              className="text-xs font-semibold text-gray-600 hover:text-[#6C3B8F] px-3 py-2 rounded-xl hover:bg-purple-50 transition-colors hidden md:inline-flex items-center gap-1.5"
            >
              <span>Admin Teams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={exportFullDatabaseJSON}
              disabled={loading || !data}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 hover:border-purple-300 text-gray-700 hover:text-[#6C3B8F] shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              title="Download full database as JSON"
            >
              <FileJson className="w-4 h-4 text-[#6C3B8F]" />
              <span className="hidden sm:inline">Export Entire DB</span>
            </button>

            <button
              onClick={fetchDatabaseData}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C3B8F] to-[#8E44AD] hover:opacity-95 shadow-md shadow-purple-300/40 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <X className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900">Database Connection Error</h3>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
              <button
                onClick={fetchDatabaseData}
                className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Try Reconnecting
              </button>
            </div>
          </div>
        )}

        {/* Database Overview Banner */}
        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-gradient-to-br from-pink-100/50 to-purple-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5" />
                  Database: <b className="font-mono">{data?.database || 'Loading...'}</b>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                  Host: {data?.host || 'localhost'}
                </span>
                {data?.timestamp && (
                  <span className="text-[11px] text-gray-400">
                    Last updated: {new Date(data.timestamp).toLocaleTimeString('en-IN')}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                All Database Tables & Values
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Explore every relational table, inspect exact column definitions, query live records, and export to CSV or JSON.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-gradient-to-b from-purple-50 to-pink-50/30 border border-purple-100/80 p-4 rounded-2xl min-w-[120px] text-center">
                <div className="text-2xl font-black text-[#6C3B8F]">
                  {loading ? '...' : data?.totalTables ?? 0}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                  Total Tables
                </div>
              </div>

              <div className="bg-gradient-to-b from-pink-50 to-purple-50/30 border border-pink-100/80 p-4 rounded-2xl min-w-[140px] text-center">
                <div className="text-2xl font-black text-[#E83E8C]">
                  {loading ? '...' : data?.totalRows?.toLocaleString('en-IN') ?? 0}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                  Total Records
                </div>
              </div>
            </div>
          </div>

          {/* Search & Navigation Bar */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search across tables or columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6C3B8F] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const allCollapsed: Record<string, boolean> = {};
                  data?.tables.forEach((t) => (allCollapsed[t.name] = true));
                  setCollapsedTables(allCollapsed);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Collapse All
              </button>
              <button
                onClick={() => setCollapsedTables({})}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Expand All
              </button>
            </div>
          </div>
        </div>

        {/* Table Selector Pills */}
        {data?.tables && data.tables.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedTableTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedTableTab === 'all'
                  ? 'bg-[#6C3B8F] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Tables ({data.tables.length})</span>
            </button>

            {data.tables.map((t) => (
              <button
                key={t.name}
                onClick={() => setSelectedTableTab(t.name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedTableTab === t.name
                    ? 'bg-[#6C3B8F] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-purple-200'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 opacity-70" />
                <span>{t.name}</span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded-md ${
                    selectedTableTab === t.name
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-50 text-[#6C3B8F]'
                  }`}
                >
                  {t.rowCount}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-[#6C3B8F] animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-gray-800">Inspecting Database Tables...</h3>
              <p className="text-xs text-gray-400 mt-1">
                Reading schemas, columns, and live records from MySQL
              </p>
            </div>
          </div>
        )}

        {/* Tables Section */}
        {!loading && visibleTables.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center text-gray-400 space-y-2">
            <TableIcon className="w-8 h-8 mx-auto text-gray-300" />
            <div className="text-sm font-bold text-gray-600">No matching tables found</div>
            <div className="text-xs text-gray-400">
              Try adjusting your search query or reset table filters.
            </div>
          </div>
        )}

        {!loading &&
          visibleTables.map((table) => {
            const isCollapsed = collapsedTables[table.name];
            const tableSearch = (tableSearchMap[table.name] || '').toLowerCase().trim();

            // Filter rows based on in-table search
            const filteredRows = table.rows.filter((row) => {
              if (!tableSearch) return true;
              return Object.values(row).some((val) => {
                if (val === null || val === undefined) return false;
                const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
                return str.toLowerCase().includes(tableSearch);
              });
            });

            return (
              <div
                key={table.name}
                id={`table-${table.name}`}
                className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden transition-all"
              >
                {/* Table Header & Controls */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-gray-50/80 via-white to-purple-50/20 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-[#6C3B8F] flex items-center justify-center shrink-0">
                      <TableIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-gray-900 font-mono tracking-tight">
                          {table.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6C3B8F]/10 text-[#6C3B8F] border border-[#6C3B8F]/20">
                          {table.rowCount} {table.rowCount === 1 ? 'row' : 'rows'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                          {table.columns.length} columns
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Base table in <code className="font-mono text-gray-600">{data?.database}</code>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Table Search */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search inside this table */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={`Filter in ${table.name}...`}
                        value={tableSearchMap[table.name] || ''}
                        onChange={(e) =>
                          setTableSearchMap({
                            ...tableSearchMap,
                            [table.name]: e.target.value,
                          })
                        }
                        className="bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6C3B8F] w-44 sm:w-56"
                      />
                    </div>

                    {/* View Schema Button */}
                    <button
                      onClick={() => setActiveSchemaModal(table)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="View columns, data types & keys"
                    >
                      <Code className="w-3.5 h-3.5 text-[#6C3B8F]" />
                      <span>Schema</span>
                    </button>

                    {/* Export CSV */}
                    <button
                      onClick={() => exportTableCSV(table)}
                      disabled={table.rows.length === 0}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-purple-50 text-gray-700 hover:text-[#6C3B8F] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                      title="Export this table to CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>CSV</span>
                    </button>

                    {/* Export JSON */}
                    <button
                      onClick={() => exportTableJSON(table)}
                      disabled={table.rows.length === 0}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-purple-50 text-gray-700 hover:text-[#6C3B8F] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                      title="Export this table to JSON"
                    >
                      <FileJson className="w-3.5 h-3.5 text-amber-600" />
                      <span>JSON</span>
                    </button>

                    {/* Collapse / Expand Toggle */}
                    <button
                      onClick={() => toggleTableCollapse(table.name)}
                      className="p-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                      title={isCollapsed ? 'Expand Table' : 'Collapse Table'}
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Table Content */}
                {!isCollapsed && (
                  <div>
                    {table.error && (
                      <div className="p-4 bg-rose-50 text-rose-700 text-xs">
                        Error querying table: {table.error}
                      </div>
                    )}

                    {table.rows.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 bg-gray-50/50">
                        <p className="text-xs font-medium">Table is currently empty (0 records).</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Click &quot;Schema&quot; above to view column definitions.
                        </p>
                      </div>
                    ) : filteredRows.length === 0 ? (
                      <div className="py-12 text-center text-gray-400 bg-gray-50/50">
                        <p className="text-xs font-medium">
                          No records match filter &ldquo;{tableSearch}&rdquo;
                        </p>
                        <button
                          onClick={() =>
                            setTableSearchMap({ ...tableSearchMap, [table.name]: '' })
                          }
                          className="mt-2 text-xs text-[#6C3B8F] underline"
                        >
                          Clear table search
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto max-h-[600px] scrollbar-thin">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-gray-50/95 sticky top-0 z-20 backdrop-blur-xs border-b border-gray-200">
                            <tr>
                              <th className="py-2.5 px-3 font-mono font-bold text-gray-400 text-[11px] text-center w-12 border-r border-gray-200 bg-gray-100/60">
                                #
                              </th>
                              {table.columns.map((col) => (
                                <th
                                  key={col.field}
                                  className="py-2.5 px-3.5 font-bold text-gray-700 whitespace-nowrap border-r border-gray-100 last:border-r-0"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-gray-900">{col.field}</span>
                                    {col.key === 'PRI' && (
                                      <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1 rounded">
                                        PK
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-normal font-mono text-gray-400">
                                    {col.type}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredRows.map((row, rowIdx) => (
                              <tr
                                key={rowIdx}
                                className="hover:bg-purple-50/30 transition-colors group"
                              >
                                <td className="py-2.5 px-3 font-mono text-gray-400 text-[11px] text-center bg-gray-50/50 border-r border-gray-100">
                                  {rowIdx + 1}
                                </td>
                                {table.columns.map((col) => {
                                  const rawVal = row[col.field];
                                  return (
                                    <td
                                      key={col.field}
                                      onClick={() =>
                                        setCellModal({
                                          tableName: table.name,
                                          colName: col.field,
                                          value: rawVal,
                                          rowIndex: rowIdx + 1,
                                        })
                                      }
                                      className="py-2.5 px-3.5 border-r border-gray-100 last:border-r-0 cursor-pointer group-hover:border-purple-100/50 max-w-[320px]"
                                      title="Click to inspect full cell value"
                                    >
                                      {formatCellValue(rawVal)}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Table Footer with Record Count */}
                    <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                      <span>
                        Showing {filteredRows.length} of {table.rowCount} records
                        {tableSearch && ` (filtered)`}
                      </span>
                      <span className="text-gray-400 italic">
                        Tip: Click any cell to inspect full value
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </main>

      {/* Cell Detail Modal */}
      {cellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-pink-50/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#6C3B8F] font-mono">
                    {cellModal.tableName}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-semibold text-gray-500">
                    Row #{cellModal.rowIndex}
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-900 font-mono mt-0.5">
                  {cellModal.colName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      typeof cellModal.value === 'object'
                        ? JSON.stringify(cellModal.value, null, 2)
                        : String(cellModal.value ?? '')
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setCellModal(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50/40">
              {cellModal.value === null || cellModal.value === undefined ? (
                <div className="text-gray-400 italic text-sm font-mono p-4 bg-white rounded-xl border border-gray-200">
                  NULL
                </div>
              ) : typeof cellModal.value === 'object' ? (
                <pre className="text-xs font-mono bg-gray-900 text-purple-200 p-4 rounded-2xl overflow-x-auto selection:bg-purple-800">
                  {JSON.stringify(cellModal.value, null, 2)}
                </pre>
              ) : (
                <div className="bg-white p-4 rounded-2xl border border-gray-200 text-sm text-gray-900 whitespace-pre-wrap break-all font-mono leading-relaxed">
                  {String(cellModal.value)}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-white text-right">
              <button
                onClick={() => setCellModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Schema Modal */}
      {activeSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-purple-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-pink-50/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6C3B8F]/10 text-[#6C3B8F] flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 font-mono">
                    {activeSchemaModal.name} Schema
                  </h3>
                  <p className="text-xs text-gray-500">
                    {activeSchemaModal.columns.length} columns defined in MySQL
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSchemaModal(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Schema Table */}
            <div className="p-5 overflow-y-auto flex-1">
              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3.5 font-bold text-gray-700">Column Name</th>
                      <th className="py-2.5 px-3.5 font-bold text-gray-700">Data Type</th>
                      <th className="py-2.5 px-3.5 font-bold text-gray-700">Nullable</th>
                      <th className="py-2.5 px-3.5 font-bold text-gray-700">Key</th>
                      <th className="py-2.5 px-3.5 font-bold text-gray-700">Default</th>
                      <th className="py-2.5 px-3.5 font-bold text-gray-700">Extra</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-mono">
                    {activeSchemaModal.columns.map((c) => (
                      <tr key={c.field} className="hover:bg-purple-50/40">
                        <td className="py-2.5 px-3.5 font-bold text-gray-900">{c.field}</td>
                        <td className="py-2.5 px-3.5 text-purple-700 font-semibold">{c.type}</td>
                        <td className="py-2.5 px-3.5 text-gray-600">
                          {c.nullable ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              YES
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">NO</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5">
                          {c.key ? (
                            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-extrabold text-[10px]">
                              {c.key}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-gray-600">
                          {c.default !== null ? String(c.default) : <span className="text-gray-400 italic">NULL</span>}
                        </td>
                        <td className="py-2.5 px-3.5 text-gray-500">{c.extra || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-white text-right">
              <button
                onClick={() => setActiveSchemaModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Close Schema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
