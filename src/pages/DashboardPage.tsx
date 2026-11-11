import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  TrendingUp,
  FilePlus,
  PlayCircle,
  ArrowRight,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface DashboardStats {
  totalContracts: number;
  highRiskContracts: number;
  mediumRiskContracts: number;
  lowRiskContracts: number;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
  categoryBreakdown: Array<{ name: string; count: number }>;
  recentAnalyses: Array<{
    id: string;
    contractId: string;
    contractName: string;
    contractType: string;
    riskScore: number;
    riskLevel: string;
    totalIssues: number;
    createdAt: string;
  }>;
  activityTimeline: Array<{ date: string; analyses: number }>;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/analysis/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to fetch dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLaunchSample = async () => {
    try {
      setLoadingDemo(true);
      const res = await api.post('/contracts/sample');
      if (res.data.success && res.data.analysis) {
        navigate(`/report/${res.data.analysis._id}`);
      }
    } catch (e) {
      navigate('/analyze');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleDeleteContract = async (contractId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this contract and its risk analysis record?')) {
      return;
    }
    try {
      await api.delete(`/contracts/${contractId}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getRiskBadge = (score: number, level: string) => {
    if (score >= 75) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800">
          <AlertOctagon className="w-3 h-3 text-red-600" />
          {score}/100 {level}
        </span>
      );
    }
    if (score >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          {score}/100 {level}
        </span>
      );
    }
    if (score >= 25) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {score}/100 {level}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        {score}/100 {level}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading your contract intelligence...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Hello, {user?.name || 'Contract Reviewer'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated screening overview of your analyzed agreements and risk distributions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchSample}
              disabled={loadingDemo}
              className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 flex items-center gap-2 transition-colors shadow-2xs"
            >
              <PlayCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{loadingDemo ? 'Processing...' : 'Load Sample Contract'}</span>
            </button>

            <Link
              to="/analyze"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-102"
            >
              <FilePlus className="w-4 h-4" />
              <span>Analyze New Contract</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Contracts */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Analyzed
              </p>
              <h3 className="text-3xl font-extrabold text-slate-950 dark:text-white mt-1">
                {stats?.totalContracts ?? 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Uploaded or pasted</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          {/* High Risk */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                High / Very High
              </p>
              <h3 className="text-3xl font-extrabold text-red-600 dark:text-red-400 mt-1">
                {stats?.highRiskContracts ?? 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Score ≥ 50/100</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>

          {/* Medium Risk */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Moderate Risk
              </p>
              <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {stats?.mediumRiskContracts ?? 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Score 25–49/100</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          {/* Low Risk */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Low Risk
              </p>
              <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats?.lowRiskContracts ?? 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Score &lt; 25/100</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Risk Distribution Chart */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Risk Tier Distribution</h3>
                <p className="text-xs text-slate-500">Proportion of contracts across risk tiers</p>
              </div>
            </div>

            {stats && stats.totalContracts > 0 ? (
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.riskDistribution.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} contracts`, name]}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <FileText className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No contracts analyzed yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Upload an agreement or launch our demo sample to see automated risk charts.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {stats?.riskDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity / Category Overview */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Analysis Timeline</h3>
                <p className="text-xs text-slate-500">Document screening volume over recent period</p>
              </div>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>

            {stats && stats.activityTimeline.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.activityTimeline}>
                    <defs>
                      <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="analyses"
                      stroke="#2563eb"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAnalyses)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Activity chart ready</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                  Your contract evaluation frequency will automatically plot here.
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Rule Engine Evaluates: 10 Standardized Categories</span>
              <Link to="/compare" className="text-blue-600 font-semibold hover:underline">
                Compare Multiple Contracts →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Contracts Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950 dark:text-white">Recent Analyses</h2>
              <p className="text-xs text-slate-500">Latest agreements evaluated for risk</p>
            </div>
            <Link
              to="/history"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats && stats.recentAnalyses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Contract Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Risk Rating</th>
                    <th className="py-3 px-4">Issues Found</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recentAnalyses.map(item => (
                    <tr
                      key={item.id}
                      onClick={() => navigate(`/report/${item.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate max-w-xs">{item.contractName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {item.contractType}
                      </td>
                      <td className="py-3.5 px-4">
                        {getRiskBadge(item.riskScore, item.riskLevel)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {item.totalIssues} clause{item.totalIssues === 1 ? '' : 's'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/report/${item.id}`);
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100"
                        >
                          View Report
                        </button>
                        <button
                          onClick={e => handleDeleteContract(item.contractId, e)}
                          title="Delete contract"
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
            <div className="p-10 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FilePlus className="w-10 h-10 text-blue-600 mx-auto opacity-70" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                You haven't analyzed any contracts yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your first employment, internship, or rental contract, or run our sample internship agreement to test the risk highlighter.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  to="/analyze"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  Upload Contract
                </Link>
                <button
                  onClick={handleLaunchSample}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Test Sample Agreement
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
