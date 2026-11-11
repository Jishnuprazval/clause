import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import api from '../services/api';

interface ContractSummary {
  _id: string;
  contractName: string;
  contractType: string;
  uploadDate: string;
}

interface ComparisonResult {
  comparison: {
    _id: string;
    contractIds: string[];
    contractNames: string[];
    comparisonSummary: string;
    lowestRiskContractId: string;
    highestRiskContractId: string;
    metrics: Array<{
      category: string;
      description: string;
      contracts: Record<string, { present: boolean; count: number; severity: string; details: string }>;
    }>;
  };
  contracts: Array<{
    id: string;
    name: string;
    type: string;
    riskScore: number;
    riskLevel: string;
    totalIssues: number;
    severityBreakdown: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  }>;
}

export const ComparisonPage: React.FC = () => {
  const [availableContracts, setAvailableContracts] = useState<ContractSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonResult | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = async () => {
    try {
      setLoadingList(true);
      const res = await api.get('/contracts');
      if (res.data.success) {
        setAvailableContracts(res.data.contracts);
        // Pre-select first 2 contracts if available
        if (res.data.contracts.length >= 2) {
          setSelectedIds([res.data.contracts[0]._id, res.data.contracts[1]._id]);
        } else if (res.data.contracts.length === 1) {
          setSelectedIds([res.data.contracts[0]._id]);
        }
      }
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const handleToggleContract = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddSampleContract = async () => {
    try {
      const res = await api.post('/contracts/sample');
      if (res.data.success) {
        await fetchContracts();
        setSelectedIds(prev => [...new Set([...prev, res.data.contract._id])]);
      }
    } catch (err) {
      console.error('Failed to load sample:', err);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      setError('Please select at least 2 contracts to compare.');
      return;
    }
    try {
      setComparing(true);
      setError(null);
      const res = await api.post('/comparison', { contractIds: selectedIds });
      if (res.data.success) {
        setComparisonData(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate contract comparison.');
    } finally {
      setComparing(false);
    }
  };

  // Auto trigger comparison if 2 contracts selected and none loaded yet
  useEffect(() => {
    if (selectedIds.length >= 2 && !comparisonData) {
      handleCompare();
    }
  }, [selectedIds.length]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Side-by-Side Contract Comparison
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select multiple offers or agreements to evaluate relative risk scores, restrictive terms, and key divergences.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSampleContract}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors shadow-2xs"
            >
              + Add Sample Tech Bond
            </button>
            <Link
              to="/analyze"
              className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors"
            >
              + Analyze New Document
            </Link>
          </div>
        </div>

        {/* Contract Selector Bar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Choose Contracts to Compare ({selectedIds.length} Selected)
            </span>
            <button
              onClick={handleCompare}
              disabled={selectedIds.length < 2 || comparing}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{comparing ? 'Comparing...' : 'Run Side-by-Side Comparison'}</span>
            </button>
          </div>

          {availableContracts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableContracts.map(c => {
                const isSelected = selectedIds.includes(c._id);
                return (
                  <div
                    key={c._id}
                    onClick={() => handleToggleContract(c._id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {c.contractName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {c.contractType} • {new Date(c.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No contracts available yet</p>
              <p className="text-[11px] text-slate-400">
                Upload at least two contracts or add our sample demo documents to see the comparison table.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Comparison Output Matrix */}
        {comparisonData && (
          <div className="space-y-6">
            {/* Header Difference Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Comparative Executive Summary</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {comparisonData.comparison.comparisonSummary}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Info className="w-3.5 h-3.5" />
                <span>
                  Indicative comparative metrics. Contracts should be judged according to individual career needs and compensation tradeoffs.
                </span>
              </div>
            </div>

            {/* Score Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisonData.contracts.map(c => {
                const isLowest = c.id === comparisonData.comparison.lowestRiskContractId;
                const isHighest = c.id === comparisonData.comparison.highestRiskContractId;

                return (
                  <div
                    key={c.id}
                    className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border relative shadow-xs space-y-4 ${
                      isLowest
                        ? 'border-emerald-400 dark:border-emerald-700/60'
                        : isHighest
                        ? 'border-red-400 dark:border-red-700/60'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {isLowest && (
                      <span className="absolute -top-3 left-6 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                        Lowest Risk Profile
                      </span>
                    )}
                    {isHighest && (
                      <span className="absolute -top-3 left-6 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-red-600 text-white shadow-xs">
                        Highest Risk Profile
                      </span>
                    )}

                    <div className="flex items-start justify-between pt-1">
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                          {c.name}
                        </h3>
                        <p className="text-xs text-slate-500">{c.type}</p>
                      </div>
                      <RiskGauge score={c.riskScore} size={70} strokeWidth={7} />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Flagged Issues:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {c.totalIssues} restrictive clause{c.totalIssues === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold">
                      <div className="p-1 rounded bg-red-50 dark:bg-red-950 text-red-600">
                        {c.severityBreakdown.critical} Crit
                      </div>
                      <div className="p-1 rounded bg-orange-50 dark:bg-orange-950 text-orange-600">
                        {c.severityBreakdown.high} High
                      </div>
                      <div className="p-1 rounded bg-amber-50 dark:bg-amber-950 text-amber-600">
                        {c.severityBreakdown.medium} Med
                      </div>
                      <div className="p-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600">
                        {c.severityBreakdown.low} Low
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Category Comparison Table */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Category-by-Category Risk Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Comprehensive breakdown across all 10 core detection categories
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-6 min-w-[200px]">Risk Category</th>
                      {comparisonData.contracts.map(c => (
                        <th key={c.id} className="py-3.5 px-6 min-w-[220px]">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {comparisonData.comparison.metrics.map((metric, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 align-top">
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{metric.category}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{metric.description}</p>
                        </td>

                        {comparisonData.contracts.map(c => {
                          const data = metric.contracts[c.id];
                          const isPresent = data?.present;

                          return (
                            <td key={c.id} className="py-4 px-6 align-top">
                              {isPresent ? (
                                <div className="space-y-1.5">
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                      data.severity === 'critical'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                        : data.severity === 'high'
                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    }`}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    {data.severity} risk detected
                                  </span>
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug line-clamp-3">
                                    "{data.details}"
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                  <span>Clean (No restrictive terms flagged)</span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
