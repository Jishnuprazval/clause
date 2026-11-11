import mongoose, { Schema, Document } from 'mongoose';

export interface IContract extends Document {
  userId: string;
  contractName: string;
  contractType: string;
  originalFileName?: string;
  extractedText: string;
  pageCount: number;
  uploadDate: Date;
  status: 'pending' | 'analyzed' | 'failed';
  isSample?: boolean;
}

const ContractSchema = new Schema<IContract>(
  {
    userId: { type: String, required: true, index: true },
    contractName: { type: String, required: true, trim: true },
    contractType: { type: String, required: true },
    originalFileName: { type: String },
    extractedText: { type: String, required: true },
    pageCount: { type: Number, default: 1 },
    uploadDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'analyzed', 'failed'], default: 'pending' },
    isSample: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ContractModel = mongoose.models.Contract || mongoose.model<IContract>('Contract', ContractSchema);
