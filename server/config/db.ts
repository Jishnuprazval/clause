import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Interface for database entities
export interface UserDoc {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  themePreference?: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface ContractDoc {
  _id: string;
  userId: string;
  contractName: string;
  contractType: string;
  originalFileName?: string;
  extractedText: string;
  pageCount: number;
  uploadDate: string;
  status: 'pending' | 'analyzed' | 'failed';
  isSample?: boolean;
}

export interface DetectedClause {
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

export interface AnalysisDoc {
  _id: string;
  userId: string;
  contractId: string;
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Very High';
  totalIssues: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  detectedClauses: DetectedClause[];
  analysisSummary: string;
  generalQuestions: string[];
  negotiationPoints: string[];
  evaluatedRulesCount: number;
  createdAt: string;
  isSample?: boolean;
}

export interface ComparisonDoc {
  _id: string;
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
  createdAt: string;
}

interface DBData {
  users: UserDoc[];
  contracts: ContractDoc[];
  analyses: AnalysisDoc[];
  comparisons: ComparisonDoc[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure database file exists with initial structure
if (!fs.existsSync(DB_FILE)) {
  const initialData: DBData = {
    users: [],
    contracts: [],
    analyses: [],
    comparisons: [],
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

function readData(): DBData {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading DB_FILE, creating fresh one:', error);
    return { users: [], contracts: [], analyses: [], comparisons: [] };
  }
}

function writeData(data: DBData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to DB_FILE:', error);
  }
}

// Database helper functions resembling Mongoose CRUD
export const db = {
  users: {
    async findOne(predicate: (u: UserDoc) => boolean): Promise<UserDoc | null> {
      const data = readData();
      return data.users.find(predicate) || null;
    },
    async findById(id: string): Promise<UserDoc | null> {
      const data = readData();
      return data.users.find(u => u._id === id) || null;
    },
    async create(user: Omit<UserDoc, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserDoc> {
      const data = readData();
      const now = new Date().toISOString();
      const newDoc: UserDoc = {
        ...user,
        _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: now,
        updatedAt: now,
      };
      data.users.push(newDoc);
      writeData(data);
      return newDoc;
    },
    async findByIdAndUpdate(id: string, updates: Partial<UserDoc>): Promise<UserDoc | null> {
      const data = readData();
      const idx = data.users.findIndex(u => u._id === id);
      if (idx === -1) return null;
      data.users[idx] = {
        ...data.users[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      writeData(data);
      return data.users[idx];
    },
  },

  contracts: {
    async find(predicate?: (c: ContractDoc) => boolean): Promise<ContractDoc[]> {
      const data = readData();
      return predicate ? data.contracts.filter(predicate) : data.contracts;
    },
    async findById(id: string): Promise<ContractDoc | null> {
      const data = readData();
      return data.contracts.find(c => c._id === id) || null;
    },
    async create(contract: Omit<ContractDoc, '_id' | 'uploadDate'>): Promise<ContractDoc> {
      const data = readData();
      const newDoc: ContractDoc = {
        ...contract,
        _id: 'contract_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        uploadDate: new Date().toISOString(),
      };
      data.contracts.push(newDoc);
      writeData(data);
      return newDoc;
    },
    async findByIdAndUpdate(id: string, updates: Partial<ContractDoc>): Promise<ContractDoc | null> {
      const data = readData();
      const idx = data.contracts.findIndex(c => c._id === id);
      if (idx === -1) return null;
      data.contracts[idx] = { ...data.contracts[idx], ...updates };
      writeData(data);
      return data.contracts[idx];
    },
    async deleteOne(id: string): Promise<boolean> {
      const data = readData();
      const before = data.contracts.length;
      data.contracts = data.contracts.filter(c => c._id !== id);
      // Also cascade delete related analyses
      data.analyses = data.analyses.filter(a => a.contractId !== id);
      writeData(data);
      return data.contracts.length < before;
    },
  },

  analyses: {
    async find(predicate?: (a: AnalysisDoc) => boolean): Promise<AnalysisDoc[]> {
      const data = readData();
      return predicate ? data.analyses.filter(predicate) : data.analyses;
    },
    async findById(id: string): Promise<AnalysisDoc | null> {
      const data = readData();
      return data.analyses.find(a => a._id === id) || null;
    },
    async findByContractId(contractId: string): Promise<AnalysisDoc | null> {
      const data = readData();
      return data.analyses.find(a => a.contractId === contractId) || null;
    },
    async create(analysis: Omit<AnalysisDoc, '_id' | 'createdAt'>): Promise<AnalysisDoc> {
      const data = readData();
      const newDoc: AnalysisDoc = {
        ...analysis,
        _id: 'analysis_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
      };
      // remove existing analysis for the same contract if any
      data.analyses = data.analyses.filter(a => a.contractId !== analysis.contractId);
      data.analyses.push(newDoc);
      writeData(data);
      return newDoc;
    },
    async deleteOne(id: string): Promise<boolean> {
      const data = readData();
      const before = data.analyses.length;
      data.analyses = data.analyses.filter(a => a._id !== id);
      writeData(data);
      return data.analyses.length < before;
    },
  },

  comparisons: {
    async find(predicate?: (c: ComparisonDoc) => boolean): Promise<ComparisonDoc[]> {
      const data = readData();
      return predicate ? data.comparisons.filter(predicate) : data.comparisons;
    },
    async findById(id: string): Promise<ComparisonDoc | null> {
      const data = readData();
      return data.comparisons.find(c => c._id === id) || null;
    },
    async create(comparison: Omit<ComparisonDoc, '_id' | 'createdAt'>): Promise<ComparisonDoc> {
      const data = readData();
      const newDoc: ComparisonDoc = {
        ...comparison,
        _id: 'comp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
      };
      data.comparisons.push(newDoc);
      writeData(data);
      return newDoc;
    },
  },
};

// Optional Mongoose connection if MONGODB_URI is provided
export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[ClauseRadar DB] Using persistent built-in JSON datastore at ./data/db.json. (Set MONGODB_URI to connect to remote MongoDB cluster)');
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log('[ClauseRadar DB] Connected successfully to MongoDB:', uri);
  } catch (error) {
    console.warn('[ClauseRadar DB] Failed connecting to MongoDB URI, falling back to built-in JSON datastore:', error);
  }
}
