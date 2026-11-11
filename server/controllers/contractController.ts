import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../config/db';
import { extractTextFromPdf } from '../services/pdfService';
import { analyzeContractRules } from '../services/ruleEngine';
import { calculateRiskScore } from '../services/riskScoring';
import { enhanceContractAnalysis } from '../services/explanationService';
import { SAMPLE_INTERNSHIP_AGREEMENT } from '../utils/sampleContract';

export async function uploadContract(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please attach a valid PDF document.' });
      return;
    }

    const contractType = req.body.contractType || 'Employment Agreement';
    const originalFileName = req.file.originalname || 'document.pdf';
    const contractName = (req.body.contractName || originalFileName.replace(/\.pdf$/i, '')).trim();

    // 1. Extract text from PDF
    const { text, pageCount } = await extractTextFromPdf(req.file.buffer);

    if (!text || text.trim().length < 20) {
      res.status(400).json({
        success: false,
        message: 'Could not extract meaningful readable text from this PDF. Please ensure the document is not an image-only scan or password-protected.',
      });
      return;
    }

    // 2. Save Contract in DB
    const contract = await db.contracts.create({
      userId: req.user.userId,
      contractName,
      contractType,
      originalFileName,
      extractedText: text,
      pageCount,
      status: 'analyzed',
      isSample: false,
    });

    // 3. Run Rule Engine
    const ruleResults = analyzeContractRules(text);

    // 4. Calculate Risk Scoring
    const scoreResult = calculateRiskScore(ruleResults.detectedClauses, ruleResults.evaluatedRulesCount);

    // 5. Generate Plain Language Explanations / AI Enhancement
    const aiEnhancement = await enhanceContractAnalysis(
      contractName,
      contractType,
      text,
      ruleResults.detectedClauses
    );

    // 6. Save Analysis in DB
    const analysis = await db.analyses.create({
      userId: req.user.userId,
      contractId: contract._id,
      riskScore: scoreResult.riskScore,
      riskLevel: scoreResult.riskLevel,
      totalIssues: ruleResults.totalIssues,
      severityBreakdown: scoreResult.severityBreakdown,
      detectedClauses: ruleResults.detectedClauses,
      analysisSummary: aiEnhancement.analysisSummary,
      generalQuestions: aiEnhancement.generalQuestions,
      negotiationPoints: aiEnhancement.negotiationPoints,
      evaluatedRulesCount: ruleResults.evaluatedRulesCount,
      isSample: false,
    });

    res.status(201).json({
      success: true,
      message: 'Contract uploaded and analyzed successfully.',
      contract,
      analysis,
    });
  } catch (error: any) {
    console.error('[ClauseRadar Contract] Upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process and analyze contract.' });
  }
}

export async function analyzeTextContract(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { contractName, contractType, text } = req.body;

    if (!text || text.trim().length < 25) {
      res.status(400).json({
        success: false,
        message: 'Contract text is too short. Please paste at least a few clauses or sentences.',
      });
      return;
    }

    const resolvedName = (contractName || `${contractType || 'Contract'} Document`).trim();
    const resolvedType = contractType || 'Other';
    const pageCount = Math.max(1, Math.ceil(text.length / 2800));

    // Save Contract
    const contract = await db.contracts.create({
      userId: req.user.userId,
      contractName: resolvedName,
      contractType: resolvedType,
      extractedText: text,
      pageCount,
      status: 'analyzed',
      isSample: false,
    });

    // Rule Engine
    const ruleResults = analyzeContractRules(text);

    // Risk Scoring
    const scoreResult = calculateRiskScore(ruleResults.detectedClauses, ruleResults.evaluatedRulesCount);

    // Plain English & AI Enhancement
    const aiEnhancement = await enhanceContractAnalysis(
      resolvedName,
      resolvedType,
      text,
      ruleResults.detectedClauses
    );

    // Save Analysis
    const analysis = await db.analyses.create({
      userId: req.user.userId,
      contractId: contract._id,
      riskScore: scoreResult.riskScore,
      riskLevel: scoreResult.riskLevel,
      totalIssues: ruleResults.totalIssues,
      severityBreakdown: scoreResult.severityBreakdown,
      detectedClauses: ruleResults.detectedClauses,
      analysisSummary: aiEnhancement.analysisSummary,
      generalQuestions: aiEnhancement.generalQuestions,
      negotiationPoints: aiEnhancement.negotiationPoints,
      evaluatedRulesCount: ruleResults.evaluatedRulesCount,
      isSample: false,
    });

    res.status(201).json({
      success: true,
      message: 'Contract text analyzed successfully.',
      contract,
      analysis,
    });
  } catch (error: any) {
    console.error('[ClauseRadar Contract] Analyze text error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error analyzing contract text.' });
  }
}

export async function loadSampleContract(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId || 'demo_user';
    const text = SAMPLE_INTERNSHIP_AGREEMENT;
    const resolvedName = 'Sample Tech Internship Agreement (Demonstration)';
    const resolvedType = 'Internship Offer Letter';

    // Rule Engine
    const ruleResults = analyzeContractRules(text);
    const scoreResult = calculateRiskScore(ruleResults.detectedClauses, ruleResults.evaluatedRulesCount);
    const aiEnhancement = await enhanceContractAnalysis(
      resolvedName,
      resolvedType,
      text,
      ruleResults.detectedClauses
    );

    // Create contract record
    const contract = await db.contracts.create({
      userId,
      contractName: resolvedName,
      contractType: resolvedType,
      originalFileName: 'Sample_Internship_Agreement_Demo.pdf',
      extractedText: text,
      pageCount: 2,
      status: 'analyzed',
      isSample: true,
    });

    // Create analysis record
    const analysis = await db.analyses.create({
      userId,
      contractId: contract._id,
      riskScore: scoreResult.riskScore,
      riskLevel: scoreResult.riskLevel,
      totalIssues: ruleResults.totalIssues,
      severityBreakdown: scoreResult.severityBreakdown,
      detectedClauses: ruleResults.detectedClauses,
      analysisSummary: aiEnhancement.analysisSummary,
      generalQuestions: aiEnhancement.generalQuestions,
      negotiationPoints: aiEnhancement.negotiationPoints,
      evaluatedRulesCount: ruleResults.evaluatedRulesCount,
      isSample: true,
    });

    res.json({
      success: true,
      message: 'Demo contract loaded successfully.',
      contract,
      analysis,
    });
  } catch (error: any) {
    console.error('[ClauseRadar Contract] Load sample error:', error);
    res.status(500).json({ success: false, message: 'Failed to load demo contract.' });
  }
}

export async function getContracts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const contracts = await db.contracts.find(c => c.userId === req.user!.userId);
    res.json({ success: true, contracts });
  } catch (error) {
    console.error('[ClauseRadar Contract] Get contracts error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contracts.' });
  }
}

export async function getContractById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const contract = await db.contracts.findById(id);

    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found.' });
      return;
    }

    // Ownership check (sample documents accessible to all)
    if (!contract.isSample && req.user && contract.userId !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Access denied to this document.' });
      return;
    }

    const analysis = await db.analyses.findByContractId(id);

    res.json({
      success: true,
      contract,
      analysis,
    });
  } catch (error) {
    console.error('[ClauseRadar Contract] Get by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve contract.' });
  }
}

export async function deleteContract(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const contract = await db.contracts.findById(id);

    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found.' });
      return;
    }

    if (contract.userId !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this contract.' });
      return;
    }

    await db.contracts.deleteOne(id);

    res.json({ success: true, message: 'Contract and associated analysis deleted successfully.' });
  } catch (error) {
    console.error('[ClauseRadar Contract] Delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contract.' });
  }
}
