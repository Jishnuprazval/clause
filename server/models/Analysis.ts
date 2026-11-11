import mongoose, { Schema, Document } from 'mongoose';

export interface IDetectedClause {
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
  aiEnhanced?: boolean;
}

export interface IAnalysis extends Document {
  userId: string;
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
  detectedClauses: IDetectedClause[];
  analysisSummary: string;
  generalQuestions: string[];
  negotiationPoints: string[];
  evaluatedRulesCount: number;
  isSample?: boolean;
  createdAt: Date;
}

const DetectedClauseSchema = new Schema<IDetectedClause>({
  id: { type: String, required: true },
  ruleId: { type: String, required: true },
  category: { type: String, required: true },
  matchedText: { type: String, required: true },
  startIndex: { type: Number, required: true },
  endIndex: { type: Number, required: true },
  pageNumber: { type: Number, default: 1 },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  explanation: { type: String, required: true },
  whyItMatters: { type: String, required: true },
  suggestedQuestions: [{ type: String }],
  suggestedNegotiation: { type: String, required: true },
  aiEnhanced: { type: Boolean, default: false },
});

const AnalysisSchema = new Schema<IAnalysis>(
  {
    userId: { type: String, required: true, index: true },
    contractId: { type: String, required: true, index: true },
    riskScore: { type: Number, required: true },
    riskLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Very High'], required: true },
    totalIssues: { type: Number, required: true },
    severityBreakdown: {
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
    },
    detectedClauses: [DetectedClauseSchema],
    analysisSummary: { type: String, required: true },
    generalQuestions: [{ type: String }],
    negotiationPoints: [{ type: String }],
    evaluatedRulesCount: { type: Number, default: 10 },
    isSample: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AnalysisModel = mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
