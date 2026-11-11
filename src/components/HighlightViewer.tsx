import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Copy, Check, FileText } from 'lucide-react';

export interface ClauseMatch {
  id: string;
  ruleId: string;
  category: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  pageNumber: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface HighlightViewerProps {
  documentText: string;
  clauses: ClauseMatch[];
  selectedClauseId?: string | null;
  onSelectClause: (clauseId: string) => void;
  documentTitle?: string;
}

interface TextSegment {
  text: string;
  clause?: ClauseMatch;
}

export const HighlightViewer: React.FC<HighlightViewerProps> = ({
  documentText,
  clauses,
  selectedClauseId,
  onSelectClause,
  documentTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Auto-scroll to selected clause element
  useEffect(() => {
    if (selectedClauseId && containerRef.current) {
      const el = containerRef.current.querySelector(`[data-clause-id="${selectedClauseId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedClauseId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(documentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build segments from text and detected clauses
  const segments = useMemo(() => {
    if (!documentText) return [];

    // Filter clauses that actually exist in the text
    const validClauses = clauses
      .map(c => {
        let start = c.startIndex;
        let end = c.endIndex;

        // If indices are out of range or misaligned, search for matchedText in document
        if (start < 0 || end > documentText.length || documentText.substring(start, end) !== c.matchedText) {
          const found = documentText.indexOf(c.matchedText);
          if (found !== -1) {
            start = found;
            end = found + c.matchedText.length;
          }
        }
        return { ...c, start, end };
      })
      .filter(c => c.start >= 0 && c.end <= documentText.length && c.start < c.end)
      .sort((a, b) => a.start - b.start);

    // Merge/dedupe overlapping intervals
    const nonOverlapping: Array<ClauseMatch & { start: number; end: number }> = [];
    for (const c of validClauses) {
      const last = nonOverlapping[nonOverlapping.length - 1];
      if (!last || c.start >= last.end) {
        nonOverlapping.push(c);
      }
    }

    const segs: TextSegment[] = [];
    let currentIdx = 0;

    for (const c of nonOverlapping) {
      if (c.start > currentIdx) {
        segs.push({ text: documentText.substring(currentIdx, c.start) });
      }
      segs.push({
        text: documentText.substring(c.start, c.end),
        clause: c,
      });
      currentIdx = c.end;
    }

    if (currentIdx < documentText.length) {
      segs.push({ text: documentText.substring(currentIdx) });
    }

    return segs;
  }, [documentText, clauses]);

  // Color classes for highlights
  const getHighlightClass = (severity?: string, isSelected?: boolean) => {
    const base = 'inline rounded px-1 py-0.5 font-medium transition-all duration-200 cursor-pointer';
    switch (severity) {
      case 'critical':
        return `${base} bg-red-100 text-red-950 border-b-2 border-red-600 dark:bg-red-950/70 dark:text-red-200 dark:border-red-500 ${
          isSelected ? 'ring-2 ring-red-500 shadow-md font-semibold' : 'hover:bg-red-200 dark:hover:bg-red-900/80'
        }`;
      case 'high':
        return `${base} bg-orange-100 text-orange-950 border-b-2 border-orange-500 dark:bg-orange-950/70 dark:text-orange-200 dark:border-orange-500 ${
          isSelected ? 'ring-2 ring-orange-500 shadow-md font-semibold' : 'hover:bg-orange-200 dark:hover:bg-orange-900/80'
        }`;
      case 'medium':
        return `${base} bg-amber-100 text-amber-950 border-b-2 border-amber-500 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-500 ${
          isSelected ? 'ring-2 ring-amber-500 shadow-md font-semibold' : 'hover:bg-amber-200 dark:hover:bg-amber-900/80'
        }`;
      case 'low':
      default:
        return `${base} bg-blue-100 text-blue-950 border-b-2 border-blue-500 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-500 ${
          isSelected ? 'ring-2 ring-blue-500 shadow-md font-semibold' : 'hover:bg-blue-200 dark:hover:bg-blue-900/80'
        }`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Top Bar */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate max-w-xs md:max-w-md">
            {documentTitle || 'Original Document Viewer'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            {clauses.length} flagged {clauses.length === 1 ? 'clause' : 'clauses'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Find text..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-32 md:w-44"
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy contract text"
            className="flex items-center gap-1 text-xs px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-5 py-2 bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Highlight Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Low Risk
        </span>
      </div>

      {/* Text Area */}
      <div
        ref={containerRef}
        className="flex-1 p-6 md:p-8 overflow-y-auto leading-relaxed text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap font-sans selection:bg-blue-200 dark:selection:bg-blue-900/60"
        style={{ maxHeight: '72vh' }}
      >
        {segments.map((segment, idx) => {
          if (!segment.clause) {
            // Check if search matches plain segment
            if (searchTerm && searchTerm.trim().length > 1) {
              const parts = segment.text.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
              return (
                <span key={idx}>
                  {parts.map((p, pIdx) =>
                    p.toLowerCase() === searchTerm.toLowerCase() ? (
                      <mark key={pIdx} className="bg-yellow-200 dark:bg-yellow-900/80 text-black dark:text-white px-0.5 rounded">
                        {p}
                      </mark>
                    ) : (
                      p
                    )
                  )}
                </span>
              );
            }
            return <span key={idx}>{segment.text}</span>;
          }

          const isSelected = selectedClauseId === segment.clause.id;
          return (
            <mark
              key={idx}
              data-clause-id={segment.clause.id}
              onClick={() => onSelectClause(segment.clause!.id)}
              className={getHighlightClass(segment.clause.severity, isSelected)}
              title={`${segment.clause.category} (${segment.clause.severity.toUpperCase()} RISK) - Click to inspect`}
            >
              {segment.text}
            </mark>
          );
        })}
      </div>
    </div>
  );
};
