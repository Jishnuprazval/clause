import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Eye,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  FilePlus,
  PlayCircle,
  Calendar,
} from 'lucide-react';
import api from '../services/api';

interface HistoryItem {
  _id: string;
  contractId: string;
  contractName: string;
  contractType: string;
  pageCount: number;
  uploadDate: string;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  totalIssues: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  analysisSummary: string;
  createdAt: string;
  isSample?: boolean;
}

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'score-desc' | 'score-asc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analysis/history');
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (contractId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this contract analysis?')) {
      return;
    }
    try {
      setDeletingId(contractId);
      await api.delete(`/contracts/${contractId}`);
      setHistory(prev => prev.filter(item => item.contractId !== contractId));
    } catch (err) {
      console.error('Failed to delete contract:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and sort
  const filteredItems = history
    .filter(item => {
      const matchesSearch =
        item.contractName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contractType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.contractType === categoryFilter;
      const matchesRisk = riskFilter === 'All' || item.riskLevel === riskFilter;
      return matchesSearch && matchesCategory && matchesRisk;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'score-desc') {
        return b.riskScore - a.riskScore;
      }
      if (sortBy === 'score-asc') {
        return a.riskScore - b.riskScore;
      }
      return 0;
    });

  const categories = ['All', ...Array.from(new Set(history.map(h => h.contractType)))];

  const getRiskBadge = (score: number, level: string) => {
    if (score >= 75) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300">
          <AlertOctagon className="w-3 h-3 text-red-600" />
          {score}/100 {level}
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          {score}/100 {level}
        </span>
      );
    }
    if (score >= 25) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {score}/100 {level}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        {score}/100 {level}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Analysis History
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Search, filter, and review historical screening records across all your contracts.
            </p>
          </div>

          <Link
            to="/analyze"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 self-start sm:self-auto"
          >
            <FilePlus className="w-4 h-4" />
            <span>Analyze New Contract</span>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by document name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold">Type:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Tier Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold">Risk:</span>
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="All">All Risk Tiers</option>
                <option value="Very High">Very High (75-100)</option>
                <option value="High">High (50-74)</option>
                <option value="Moderate">Moderate (25-49)</option>
                <option value="Low">Low (0-24)</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Risk First</option>
                <option value="score-asc">Lowest Risk First</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-3 text-xs text-slate-500">Loading history records...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Document Name</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Risk Rating</th>
                    <th className="py-3.5 px-6">Clauses Flagged</th>
                    <th className="py-3.5 px-6">Date Analyzed</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredItems.map(item => (
                    <tr
                      key={item._id}
                      onClick={() => navigate(`/report/${item._id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <span className="block truncate max-w-xs">{item.contractName}</span>
                            {item.isSample && (
                              <span className="inline-block text-[9px] font-bold text-amber-600 uppercase bg-amber-50 dark:bg-amber-950/50 px-1.5 rounded">
                                Demo Sample
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                        {item.contractType}
                      </td>
                      <td className="py-4 px-6">
                        {getRiskBadge(item.riskScore, item.riskLevel)}
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.totalIssues} restrictive clause{item.totalIssues === 1 ? '' : 's'}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/report/${item._id}`);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100"
                        >
                          View Report
                        </button>
                        <button
                          onClick={e => handleDelete(item.contractId, e)}
                          disabled={deletingId === item.contractId}
                          title="Delete contract"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No matching contract analyses found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || categoryFilter !== 'All' || riskFilter !== 'All'
                  ? 'Try clearing your filters or search terms.'
                  : 'Start by uploading your first PDF agreement or testing our demo sample.'}
              </p>
              <div className="pt-2">
                <Link
                  to="/analyze"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  Analyze Contract
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
