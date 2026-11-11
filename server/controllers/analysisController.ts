import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../config/db';
import { analyzeContractRules } from '../services/ruleEngine';
import { calculateRiskScore } from '../services/riskScoring';
import { enhanceContractAnalysis } from '../services/explanationService';

export async function reanalyzeContract(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { contractId } = req.params;
    const contract = await db.contracts.findById(contractId);

    if (!contract) {
      res.status(404).json({ success: false, message: 'Contract not found.' });
      return;
    }

    if (!contract.isSample && contract.userId !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized access to contract.' });
      return;
    }

    const ruleResults = analyzeContractRules(contract.extractedText);
    const scoreResult = calculateRiskScore(ruleResults.detectedClauses, ruleResults.evaluatedRulesCount);
    const aiEnhancement = await enhanceContractAnalysis(
      contract.contractName,
      contract.contractType,
      contract.extractedText,
      ruleResults.detectedClauses
    );

    const updatedAnalysis = await db.analyses.create({
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
      isSample: contract.isSample,
    });

    res.json({
      success: true,
      message: 'Analysis regenerated successfully.',
      analysis: updatedAnalysis,
      contract,
    });
  } catch (error) {
    console.error('[ClauseRadar Analysis] Reanalyze error:', error);
    res.status(500).json({ success: false, message: 'Failed to re-analyze contract.' });
  }
}

export async function getAnalysisById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { analysisId } = req.params;
    const analysis = await db.analyses.findById(analysisId);

    if (!analysis) {
      res.status(404).json({ success: false, message: 'Analysis record not found.' });
      return;
    }

    const contract = await db.contracts.findById(analysis.contractId);

    if (!analysis.isSample && req.user && analysis.userId !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Unauthorized access.' });
      return;
    }

    res.json({
      success: true,
      analysis,
      contract,
    });
  } catch (error) {
    console.error('[ClauseRadar Analysis] GetById error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve analysis.' });
  }
}

export async function getAnalysisHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const analyses = await db.analyses.find(a => a.userId === req.user!.userId);
    const contracts = await db.contracts.find(c => c.userId === req.user!.userId);
    const contractMap = new Map(contracts.map(c => [c._id, c]));

    const historyItems = analyses.map(a => {
      const c = contractMap.get(a.contractId);
      return {
        _id: a._id,
        contractId: a.contractId,
        contractName: c?.contractName || 'Unnamed Contract',
        contractType: c?.contractType || 'General',
        pageCount: c?.pageCount || 1,
        uploadDate: c?.uploadDate || a.createdAt,
        riskScore: a.riskScore,
        riskLevel: a.riskLevel,
        totalIssues: a.totalIssues,
        severityBreakdown: a.severityBreakdown,
        analysisSummary: a.analysisSummary,
        createdAt: a.createdAt,
        isSample: a.isSample,
      };
    });

    // Sort descending by creation date
    historyItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      history: historyItems,
    });
  } catch (error) {
    console.error('[ClauseRadar Analysis] Get history error:', error);
    res.status(500).json({ success: false, message: 'Failed to load analysis history.' });
  }
}

export async function getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const analyses = await db.analyses.find(a => a.userId === req.user!.userId);
    const contracts = await db.contracts.find(c => c.userId === req.user!.userId);
    const contractMap = new Map(contracts.map(c => [c._id, c]));

    const totalContracts = analyses.length;
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;

    const riskDistribution = [
      { name: 'Low Risk (0-24)', value: 0, color: '#16A34A' },
      { name: 'Moderate Risk (25-49)', value: 0, color: '#F59E0B' },
      { name: 'High Risk (50-74)', value: 0, color: '#EA580C' },
      { name: 'Very High Risk (75-100)', value: 0, color: '#DC2626' },
    ];

    const categoryCounts: Record<string, number> = {};

    for (const a of analyses) {
      if (a.riskScore >= 50) {
        highRiskCount++;
      } else if (a.riskScore >= 25) {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }

      if (a.riskScore >= 75) riskDistribution[3].value++;
      else if (a.riskScore >= 50) riskDistribution[2].value++;
      else if (a.riskScore >= 25) riskDistribution[1].value++;
      else riskDistribution[0].value++;

      const c = contractMap.get(a.contractId);
      const cat = c?.contractType || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Recent 5 analyses with contract details
    const recentAnalyses = analyses
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(a => {
        const c = contractMap.get(a.contractId);
        return {
          id: a._id,
          contractId: a.contractId,
          contractName: c?.contractName || 'Unnamed Contract',
          contractType: c?.contractType || 'Agreement',
          riskScore: a.riskScore,
          riskLevel: a.riskLevel,
          totalIssues: a.totalIssues,
          createdAt: a.createdAt,
        };
      });

    // Activity trend by month or recent days
    const activityMap: Record<string, number> = {};
    for (const a of analyses) {
      const d = new Date(a.createdAt);
      const label = `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
      activityMap[label] = (activityMap[label] || 0) + 1;
    }

    const activityTimeline = Object.entries(activityMap).map(([date, count]) => ({
      date,
      analyses: count,
    }));

    res.json({
      success: true,
      stats: {
        totalContracts,
        highRiskContracts: highRiskCount,
        mediumRiskContracts: mediumRiskCount,
        lowRiskContracts: lowRiskCount,
        riskDistribution,
        categoryBreakdown: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
        recentAnalyses,
        activityTimeline: activityTimeline.length > 0 ? activityTimeline : [{ date: 'Today', analyses: analyses.length }],
      },
    });
  } catch (error) {
    console.error('[ClauseRadar Analysis] Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
  }
}
