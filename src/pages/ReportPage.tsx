import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  Download,
  GitCompare,
  RotateCw,
  Share2,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  MessageSquare,
  Sparkles,
  FileText,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { RiskGauge } from '../components/RiskGauge';
import { HighlightViewer, ClauseMatch } from '../components/HighlightViewer';
import api from '../services/api';

interface DetailedAnalysis {
  _id: string;
  contractId: string;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  totalIssues: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  detectedClauses: Array<{
    id: string;
    ruleId: string;
    category: string;
    matchedText: string;
    startIndex: number;
    endIndex: number;
    pageNumber: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    explanation: string;
    whyItMatters: string;
    suggestedQuestions: string[];
    suggestedNegotiation: string;
  }>;
  analysisSummary: string;
  generalQuestions: string[];
  negotiationPoints: string[];
  createdAt: string;
}

interface DetailedContract {
  _id: string;
  contractName: string;
  contractType: string;
  originalFileName?: string;
  extractedText: string;
  pageCount: number;
  uploadDate: string;
  isSample?: boolean;
}

export const ReportPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<DetailedAnalysis | null>(null);
  const [contract, setContract] = useState<DetailedContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchAnalysisDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/analysis/details/${analysisId}`);
      if (res.data.success) {
        setAnalysis(res.data.analysis);
        setContract(res.data.contract);
        if (res.data.analysis.detectedClauses?.length > 0) {
          setSelectedClauseId(res.data.analysis.detectedClauses[0].id);
        }
      }
    } catch (err: any) {
      console.error('Fetch analysis error:', err);
      setError(err.response?.data?.message || 'Failed to retrieve analysis report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisDetails();
    }
  }, [analysisId]);

  const handleReanalyze = async () => {
    if (!contract) return;
    try {
      setReanalyzing(true);
      const res = await api.post(`/analysis/${contract._id}`);
      if (res.data.success && res.data.analysis) {
        setAnalysis(res.data.analysis);
      }
    } catch (err) {
      console.error('Reanalyze error:', err);
    } finally {
      setReanalyzing(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadPdfReport = () => {
    if (!analysis || !contract) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;

    // Header Branding
    doc.setFillColor(17, 24, 39); // Deep Navy
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ClauseRadar – Contract Risk Assessment Report', 14, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(209, 213, 219);
    doc.text(`Generated: ${new Date(analysis.createdAt).toLocaleString()} | www.clauseradar.app`, 14, 22);

    y = 38;

    // Document Meta
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Document: ${contract.contractName}`, 14, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Type: ${contract.contractType} | Evaluated Rules: 10 Categories`, 14, y);
    y += 10;

    // Risk Score Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`Overall Risk Rating: ${analysis.riskScore}/100 (${analysis.riskLevel.toUpperCase()})`, 20, y + 10);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Detected Restrictive Clauses: ${analysis.totalIssues} (Critical: ${analysis.severityBreakdown.critical}, High: ${analysis.severityBreakdown.high}, Med: ${analysis.severityBreakdown.medium}, Low: ${analysis.severityBreakdown.low})`,
      20,
      y + 19
    );
    y += 34;

    // Executive Summary
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('Executive Plain-English Summary:', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    const splitSummary = doc.splitTextToSize(analysis.analysisSummary, pageWidth - 28);
    doc.text(splitSummary, 14, y);
    y += splitSummary.length * 4.5 + 8;

    // Flagged Clauses Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(`Flagged High-Risk Terms (${analysis.detectedClauses.length}):`, 14, y);
    y += 7;

    analysis.detectedClauses.forEach((clause, idx) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text(`${idx + 1}. [${clause.severity.toUpperCase()}] ${clause.category}`, 14, y);
      y += 5;

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(75, 85, 99);
      const splitExcerpt = doc.splitTextToSize(`Clause: "${clause.matchedText.substring(0, 200)}..."`, pageWidth - 28);
      doc.text(splitExcerpt, 14, y);
      y += splitExcerpt.length * 4 + 3;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      const splitExp = doc.splitTextToSize(`Plain English: ${clause.explanation}`, pageWidth - 28);
      doc.text(splitExp, 14, y);
      y += splitExp.length * 4 + 2;

      const splitNeg = doc.splitTextToSize(`Negotiation Point: ${clause.suggestedNegotiation}`, pageWidth - 28);
      doc.text(splitNeg, 14, y);
      y += splitNeg.length * 4 + 6;
    });

    // Disclaimer
    if (y > 255) {
      doc.addPage();
      y = 20;
    }
    y += 5;
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    const disclaimer =
      'DISCLAIMER: ClauseRadar provides automated rule-based contract pre-screening and educational awareness. It does not constitute formal legal counsel or create an attorney-client relationship.';
    const splitDisc = doc.splitTextToSize(disclaimer, pageWidth - 28);
    doc.text(splitDisc, 14, y);

    doc.save(`${contract.contractName.replace(/[^a-z0-9]/gi, '_')}_Risk_Report.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Generating detailed risk assessment...</p>
      </div>
    );
  }

  if (error || !analysis || !contract) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Report Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md">{error || 'Unable to locate this document analysis.'}</p>
        <Link to="/analyze" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Analyze Another Contract
        </Link>
      </div>
    );
  }

  // Filter clauses by severity
  const filteredClauses = analysis.detectedClauses.filter(c => {
    if (filterSeverity === 'all') return true;
    return c.severity === filterSeverity;
  });

  const selectedClause = analysis.detectedClauses.find(c => c.id === selectedClauseId) || analysis.detectedClauses[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Navigation & Action Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                  {contract.contractName}
                </h1>
                {contract.isSample && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    Sample Demo Data
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {contract.contractType} • Evaluated {new Date(analysis.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              title="Re-run rule analysis"
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <RotateCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{reanalyzing ? 'Refreshing...' : 'Re-Analyze'}</span>
            </button>

            <Link
              to="/compare"
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-600" />
              <span>Compare</span>
            </Link>

            <button
              onClick={handleShare}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleDownloadPdfReport}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* 2-Column Main Layout: Left Document Viewer, Right Risk Intelligence Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Document Viewer with In-Line Highlights */}
          <div className="lg:col-span-7 h-[78vh] flex flex-col">
            <HighlightViewer
              documentText={contract.extractedText}
              clauses={analysis.detectedClauses}
              selectedClauseId={selectedClauseId}
              onSelectClause={id => setSelectedClauseId(id)}
              documentTitle={contract.originalFileName || contract.contractName}
            />
          </div>

          {/* Right Panel: Risk Breakdown & Plain-Language Negotiation */}
          <div className="lg:col-span-5 space-y-6 h-[78vh] overflow-y-auto pr-1">
            {/* Executive Risk Score Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Risk Score</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {analysis.riskLevel} Risk Profile
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Normalized from 10 legal categories (Total: {analysis.totalIssues} flagged issues)
                  </p>
                </div>

                <RiskGauge score={analysis.riskScore} size={90} strokeWidth={9} />
              </div>

              {/* Severity Pills */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60">
                  <p className="text-lg font-black text-red-600 dark:text-red-400">{analysis.severityBreakdown.critical}</p>
                  <p className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase">Critical</p>
                </div>
                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60">
                  <p className="text-lg font-black text-orange-600 dark:text-orange-400">{analysis.severityBreakdown.high}</p>
                  <p className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase">High</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                  <p className="text-lg font-black text-amber-600 dark:text-amber-400">{analysis.severityBreakdown.medium}</p>
                  <p className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Medium</p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                  <p className="text-lg font-black text-blue-600 dark:text-blue-400">{analysis.severityBreakdown.low}</p>
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">Low</p>
                </div>
              </div>

              {/* Plain-Language Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Executive Plain-English Summary</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {analysis.analysisSummary}
                </p>
              </div>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-semibold px-1">Filter:</span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                    filterSeverity === sev
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Selected Clause Detailed Inspector */}
            {selectedClause && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500/50 dark:border-blue-600/50 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md ${
                        selectedClause.severity === 'critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : selectedClause.severity === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                          : selectedClause.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {selectedClause.severity} risk
                    </span>
                    <span className="text-xs font-mono text-slate-400">{selectedClause.ruleId}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Page {selectedClause.pageNumber}</span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {selectedClause.category}
                </h3>

                {/* Excerpt quote */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{selectedClause.matchedText}"
                </div>

                {/* Plain language explanation */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Simple Explanation
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedClause.explanation}
                  </p>
                </div>

                {/* Why it matters */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Why This Matters
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedClause.whyItMatters}
                  </p>
                </div>

                {/* Suggested Questions */}
                {selectedClause.suggestedQuestions?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Questions to Ask Before Signing</span>
                    </h4>
                    <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                      {selectedClause.suggestedQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>"{q}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Negotiation Compromise */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Suggested Negotiation Counter-Offer</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-200 bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 leading-relaxed">
                    {selectedClause.suggestedNegotiation}
                  </p>
                </div>
              </div>
            )}

            {/* List of other flagged clauses */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                All Detected Clauses ({filteredClauses.length})
              </h4>

              {filteredClauses.map(clause => {
                const isSelected = selectedClause?.id === clause.id;
                return (
                  <div
                    key={clause.id}
                    onClick={() => setSelectedClauseId(clause.id)}
                    className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-blue-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            clause.severity === 'critical'
                              ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                              : clause.severity === 'high'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                              : clause.severity === 'medium'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {clause.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {clause.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {clause.explanation}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
