import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext } from './index';

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext
): { score: number; insights: string[] } {
  let score = 20;
  const insights: string[] = [];

  const totalInvested = rows.reduce((sum, r) => sum + r.invested, 0);
  const totalCurrentValue = rows.reduce((sum, r) => sum + r.currentValue, 0);

  if (totalInvested <= 0) {
    return { score: 0, insights: ["Efficiency: No investments recorded"] };
  }

  const fundCount = rows.length;

  // Average tenure
  let totalTenure = 0;
  for (const row of rows) {
    const tenureInMs = Date.now() - new Date(row.startDate).getTime();
    const tenureInYears = Math.max(0.01, tenureInMs / (365.25 * 24 * 60 * 60 * 1000));
    totalTenure += tenureInYears;
  }
  const avgTenure = fundCount > 0 ? totalTenure / fundCount : 0.01;
  const years = Math.max(0.01, avgTenure);

  const xirr = ((totalCurrentValue - totalInvested) / totalInvested) / years * 100;

  if (xirr < 8) {
    score -= 8;
    insights.push(`Efficiency: Low portfolio growth — XIRR is ${xirr.toFixed(1)}% (benchmark minimum 8%)`);
  }

  // More than 50% idle (currentValue < invested)
  const idleCount = rows.filter((r) => r.currentValue < r.invested).length;
  if (idleCount / fundCount > 0.50) {
    score -= 4;
    insights.push(`Efficiency: Value erosion — ${(idleCount / fundCount * 100).toFixed(0)}% of your funds have a current value below your initial investment`);
  }

  // Poor goal coverage (total currentValue < 2x total invested for LONG_TERM/WEALTH_CREATION)
  const isGrowthGoal = assessment.goal === Goal.LONG_TERM || assessment.goal === Goal.WEALTH_CREATION || assessment.goal === Goal.RETIREMENT || assessment.goal === Goal.CHILD_EDUCATION || assessment.goal === Goal.HOUSE_PURCHASE || assessment.goal === Goal.PASSIVE_INCOME;
  if (isGrowthGoal && totalCurrentValue < 2 * totalInvested) {
    score -= 4;
    insights.push("Efficiency: Poor goal coverage — Total portfolio value is less than double the amount invested, which is low for long-term growth goals");
  }

  // All lumpsum, no growth pattern
  const sipCount = rows.filter((r) => r.type === 'SIP').length;
  if (sipCount === 0) {
    score -= 4;
    insights.push("Efficiency: All lumpsum assets — Lacks dynamic compounding benefits of systematic reinvestments (SIP)");
  }

  return { score: Math.max(0, score), insights };
}
