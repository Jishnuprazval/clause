import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  FileCode,
  X,
  Sparkles,
  ArrowRight,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  'Internship Offer Letter',
  'Employment Agreement',
  'Rental Agreement',
  'Freelance Contract',
  'Service Agreement',
  'Terms of Service',
  'Other',
];

export const AnalysisInputPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [contractName, setContractName] = useState('');
  const [contractType, setContractType] = useState('Employment Agreement');

  // Method 1: PDF File
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Method 2: Text paste
  const [contractText, setContractText] = useState('');

  // Execution states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectedFile = (selectedFile: File) => {
    setError(null);
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file. Other file formats are not supported.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setFile(selectedFile);
    if (!contractName) {
      setContractName(selectedFile.name.replace(/\.pdf$/i, ''));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisStep('Initializing sample tech internship bond document...');
      const res = await api.post('/contracts/sample');
      if (res.data.success && res.data.analysis) {
        setAnalysisStep('Finalizing risk report...');
        setTimeout(() => {
          navigate(`/report/${res.data.analysis._id}`);
        }, 500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sample document.');
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'upload') {
      if (!file) {
        setError('Please select or drop a PDF contract to analyze.');
        return;
      }
    } else {
      if (!contractText || contractText.trim().length < 40) {
        setError('Please paste the contract text (minimum 40 characters required).');
        return;
      }
    }

    try {
      setIsAnalyzing(true);

      if (activeTab === 'upload') {
        setAnalysisStep('1/3 Extracting document structure and textual layers...');
        const formData = new FormData();
        formData.append('contractFile', file!);
        formData.append('contractName', contractName || file!.name.replace(/\.pdf$/i, ''));
        formData.append('contractType', contractType);

        setTimeout(() => {
          setAnalysisStep('2/3 Running 10-category rule engine and scoring risk weights...');
        }, 1200);

        const res = await api.post('/contracts/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (res.data.success && res.data.analysis) {
          setAnalysisStep('3/3 Generating plain-English negotiation guide...');
          setTimeout(() => {
            navigate(`/report/${res.data.analysis._id}`);
          }, 400);
        }
      } else {
        setAnalysisStep('1/3 Parsing text and evaluating clause boundaries...');
        setTimeout(() => {
          setAnalysisStep('2/3 Scanning for service bonds, non-competes, and deductions...');
        }, 800);

        const res = await api.post('/contracts/analyze-text', {
          contractName: contractName || `${contractType} Review`,
          contractType,
          text: contractText,
        });

        if (res.data.success && res.data.analysis) {
          setAnalysisStep('3/3 Assembling interactive highlight report...');
          setTimeout(() => {
            navigate(`/report/${res.data.analysis._id}`);
          }, 400);
        }
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to complete analysis. Please verify your document format and try again.'
      );
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Analyze Contract Risk
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload a PDF document or paste agreement text to screen for 10 dangerous clause categories.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            disabled={isAnalyzing}
            className="px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-100 flex items-center gap-2 transition-colors self-start sm:self-auto shadow-2xs"
          >
            <PlayCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Load Demo Internship Bond</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleAnalyze} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Metadata inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Contract Title / Reference
              </label>
              <input
                type="text"
                value={contractName}
                onChange={e => setContractName(e.target.value)}
                placeholder="e.g. Apex Tech Internship Offer Letter"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Agreement Category
              </label>
              <select
                value={contractType}
                onChange={e => setContractType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Input Method Switcher Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'upload'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Method 1: Upload PDF File</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'paste'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Method 2: Paste Agreement Text</span>
            </button>
          </div>

          {/* Method 1: Upload PDF Box */}
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 bg-slate-50/60 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Drag & Drop your contract PDF here
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      or click to browse from your device (PDF format, up to 10 MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Method 2: Paste Contract Text */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Contract Text Content</span>
                <span>{contractText.length} characters</span>
              </div>
              <textarea
                rows={12}
                value={contractText}
                onChange={e => setContractText(e.target.value)}
                placeholder="Paste the full text or relevant clauses of your agreement here... (e.g. appointment letter, lease conditions, confidentiality clause, termination terms)"
                className="w-full p-4 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setContractText('')}
                  className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Clear text
                </button>
              </div>
            </div>
          )}

          {/* Analysis Scanning Animation Modal/Overlay */}
          {isAnalyzing && (
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  {analysisStep || 'Analyzing contract clauses with rule engine...'}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Deterministic 10-category rule engine + Gemini plain-language assistance
            </span>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 hover:scale-102"
            >
              <span>{isAnalyzing ? 'Processing...' : 'Analyze Contract'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
