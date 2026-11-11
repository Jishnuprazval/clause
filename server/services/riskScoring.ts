import { DetectedClause } from '../config/db';

export const SEVERITY_WEIGHTS = {
  critical: 10,
  high: 8,
  medium: 5,
  low: 2,
};

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Very High';

export interface RiskScoreResult {
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  totalPoints: number;
  maxPoints: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scoreFormula: string;
}

export function calculateRiskScore(
  detectedClauses: DetectedClause[],
  evaluatedRulesCount: number = 10
): RiskScoreResult {
  const breakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  let totalPoints = 0;

  for (const clause of detectedClauses) {
    const sev = clause.severity || 'low';
    breakdown[sev] = (breakdown[sev] || 0) + 1;
    totalPoints += SEVERITY_WEIGHTS[sev] || 2;
  }

  // Maximum possible risk points = evaluatedRulesCount * max weight (10)
  const maxRuleWeight = SEVERITY_WEIGHTS.critical; // 10
  const maxPoints = Math.max(1, evaluatedRulesCount * maxRuleWeight);

  // Calculate normalized percentage (0 to 100)
  const rawScore = (totalPoints / maxPoints) * 100;
  const riskScore = Math.min(100, Math.round(rawScore));

  let riskLevel: RiskLevel = 'Low';
  if (riskScore >= 75) {
    riskLevel = 'Very High';
  } else if (riskScore >= 50) {
    riskLevel = 'High';
  } else if (riskScore >= 25) {
    riskLevel = 'Moderate';
  } else {
    riskLevel = 'Low';
  }

  return {
    riskScore,
    riskLevel,
    totalPoints,
    maxPoints,
    severityBreakdown: breakdown,
    scoreFormula: `(${totalPoints} accumulated points / ${maxPoints} max evaluated points) × 100 = ${riskScore}%`,
  };
}
