import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { db, ComparisonDoc } from '../config/db';
import { CONTRACT_RULES } from '../services/ruleEngine';

export async function createComparison(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { contractIds } = req.body;
    if (!Array.isArray(contractIds) || contractIds.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Please select at least 2 contracts to generate a side-by-side comparison.',
      });
      return;
    }

    // Retrieve contracts and their analyses
    const contracts: any[] = [];
    const analyses: Array<{ contract: any; analysis: any }> = [];

    for (const cid of contractIds) {
      const c = await db.contracts.findById(cid);
      if (c && (c.userId === req.user.userId || c.isSample)) {
        contracts.push(c);
        const a = await db.analyses.findByContractId(cid);
        if (a) {
          analyses.push({ contract: c, analysis: a });
        }
      }
    }

    if (analyses.length < 2) {
      res.status(400).json({
        success: false,
        message: 'Could not find analyzed data for at least 2 selected contracts.',
      });
      return;
    }

    // Sort by risk score to identify lowest and highest risk contracts
    const sortedByRisk = [...analyses].sort((a, b) => a.analysis.riskScore - b.analysis.riskScore);
    const lowestRisk = sortedByRisk[0];
    const highestRisk = sortedByRisk[sortedByRisk.length - 1];

    // Build category comparison metrics across all 10 core categories
    const metrics = CONTRACT_RULES.map(rule => {
      const contractDataMap: Record<string, { present: boolean; count: number; severity: string; details: string }> = {};

      for (const item of analyses) {
        const matchingClauses = item.analysis.detectedClauses.filter((dc: any) => dc.ruleId === rule.ruleId);
        const isPresent = matchingClauses.length > 0;
        contractDataMap[item.contract._id] = {
          present: isPresent,
          count: matchingClauses.length,
          severity: isPresent ? matchingClauses[0].severity : 'none',
          details: isPresent
            ? matchingClauses[0].matchedText.substring(0, 140) + '...'
            : 'No restrictive terms detected in this category.',
        };
      }

      return {
        category: rule.category,
        description: rule.name,
        contracts: contractDataMap,
      };
    });

    // Summary of key differences
    const summaryPoints: string[] = [];
    if (highestRisk.analysis.riskScore - lowestRisk.analysis.riskScore >= 20) {
      summaryPoints.push(
        `"${lowestRisk.contract.contractName}" features a significantly lower overall risk profile (${lowestRisk.analysis.riskScore}/100) compared to "${highestRisk.contract.contractName}" (${highestRisk.analysis.riskScore}/100).`
      );
    } else {
      summaryPoints.push(
        `The evaluated contracts display similar overall risk profiles (${lowestRisk.analysis.riskScore} vs ${highestRisk.analysis.riskScore}), but differ in specific restrictive conditions.`
      );
    }

    // Detect distinct differences where one has a rule and another doesn't
    const criticalDifferences = metrics.filter(m => {
      const statuses = Object.values(m.contracts).map(v => v.present);
      return statuses.some(s => s) && statuses.some(s => !s);
    });

    if (criticalDifferences.length > 0) {
      const diffNames = criticalDifferences.slice(0, 3).map(d => d.category).join(', ');
      summaryPoints.push(`Notable divergence observed in: ${diffNames}.`);
    }

    const comparisonDoc: Omit<ComparisonDoc, '_id' | 'createdAt'> = {
      userId: req.user.userId,
      contractIds: analyses.map(a => a.contract._id),
      contractNames: analyses.map(a => a.contract.contractName),
      comparisonSummary: summaryPoints.join(' '),
      lowestRiskContractId: lowestRisk.contract._id,
      highestRiskContractId: highestRisk.contract._id,
      metrics,
    };

    const saved = await db.comparisons.create(comparisonDoc);

    res.status(201).json({
      success: true,
      comparison: saved,
      contracts: analyses.map(a => ({
        id: a.contract._id,
        name: a.contract.contractName,
        type: a.contract.contractType,
        riskScore: a.analysis.riskScore,
        riskLevel: a.analysis.riskLevel,
        totalIssues: a.analysis.totalIssues,
        severityBreakdown: a.analysis.severityBreakdown,
      })),
    });
  } catch (error) {
    console.error('[ClauseRadar Comparison] Create comparison error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate contract comparison.' });
  }
}

export async function getComparisonById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const comparison = await db.comparisons.findById(id);

    if (!comparison) {
      res.status(404).json({ success: false, message: 'Comparison record not found.' });
      return;
    }

    // Retrieve the contracts
    const contractDetails = [];
    for (const cid of comparison.contractIds) {
      const c = await db.contracts.findById(cid);
      const a = await db.analyses.findByContractId(cid);
      if (c && a) {
        contractDetails.push({
          id: c._id,
          name: c.contractName,
          type: c.contractType,
          riskScore: a.riskScore,
          riskLevel: a.riskLevel,
          totalIssues: a.totalIssues,
          severityBreakdown: a.severityBreakdown,
        });
      }
    }

    res.json({
      success: true,
      comparison,
      contracts: contractDetails,
    });
  } catch (error) {
    console.error('[ClauseRadar Comparison] Get by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve comparison.' });
  }
}
