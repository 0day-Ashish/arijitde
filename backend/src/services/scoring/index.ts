import { PortfolioRow, Goal, ScoreTag } from '@prisma/client';
import { scoreDimension as scoreGoalAlignment } from './goalAlignment';
import { scoreDimension as scoreAssetAllocation } from './assetAllocation';
import { scoreDimension as scoreDiversification } from './diversification';
import { scoreDimension as scoreDiscipline } from './discipline';
import { scoreDimension as scoreEfficiency } from './efficiency';

export interface ScoreResult {
  total: number;
  goalAlignment: number;
  assetAlloc: number;
  diversification: number;
  discipline: number;
  efficiency: number;
  tag: ScoreTag;
  insights: string[];
}

export function calculateScore(
  rows: PortfolioRow[],
  assessment: { age: number; goal: Goal | null }
): ScoreResult {
  const goalResult = scoreGoalAlignment(rows, assessment);
  const assetResult = scoreAssetAllocation(rows, assessment);
  const divResult = scoreDiversification(rows, assessment);
  const discResult = scoreDiscipline(rows, assessment);
  const effResult = scoreEfficiency(rows, assessment);

  const total = goalResult.score + assetResult.score + divResult.score + discResult.score + effResult.score;

  // Determine Tag
  let tag: ScoreTag;
  if (!assessment.goal || assessment.goal === Goal.EXPLORING) {
    tag = ScoreTag.NEEDS_STRUCTURING;
  } else if (total >= 75) {
    tag = ScoreTag.ALIGNED;
  } else if (total >= 60) {
    tag = ScoreTag.MODERATE;
  } else {
    tag = ScoreTag.NEEDS_REVIEW;
  }

  // Select insights based on the lowest-scoring dimensions
  const dimensions = [
    { name: 'Goal Alignment', score: goalResult.score, insights: goalResult.insights },
    { name: 'Asset Allocation', score: assetResult.score, insights: assetResult.insights },
    { name: 'Diversification', score: divResult.score, insights: divResult.insights },
    { name: 'Discipline', score: discResult.score, insights: discResult.insights },
    { name: 'Efficiency', score: effResult.score, insights: effResult.insights },
  ];

  // Sort by score ascending (lowest score first)
  dimensions.sort((a, b) => a.score - b.score);

  const selectedInsights: string[] = [];
  for (const dim of dimensions) {
    for (const insight of dim.insights) {
      selectedInsights.push(insight);
      if (selectedInsights.length === 3) break;
    }
    if (selectedInsights.length === 3) break;
  }

  // Pad to exactly 3 if needed
  const generalInsights = [
    "Portfolio: Review and rebalance your portfolio annually to maintain your target risk profile",
    "Portfolio: Maintain an emergency fund separate from your market-linked investments",
    "Portfolio: Review your investment goals periodically to account for any lifecycle changes"
  ];
  let padIdx = 0;
  while (selectedInsights.length < 3) {
    selectedInsights.push(generalInsights[padIdx++] || "Portfolio: Stay invested for the long-term to beat inflation");
  }

  return {
    total,
    goalAlignment: goalResult.score,
    assetAlloc: assetResult.score,
    diversification: divResult.score,
    discipline: discResult.score,
    efficiency: effResult.score,
    tag,
    insights: selectedInsights,
  };
}
