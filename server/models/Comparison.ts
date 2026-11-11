import mongoose, { Schema, Document } from 'mongoose';

export interface IComparison extends Document {
  userId: string;
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
  createdAt: Date;
}

const ComparisonSchema = new Schema<IComparison>(
  {
    userId: { type: String, required: true, index: true },
    contractIds: [{ type: String, required: true }],
    contractNames: [{ type: String }],
    comparisonSummary: { type: String, required: true },
    lowestRiskContractId: { type: String },
    highestRiskContractId: { type: String },
    metrics: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ComparisonModel = mongoose.models.Comparison || mongoose.model<IComparison>('Comparison', ComparisonSchema);
