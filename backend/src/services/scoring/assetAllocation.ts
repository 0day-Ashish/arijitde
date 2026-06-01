import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext } from './index';

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext
): { score: number; insights: string[] } {
  let score = 20;
  const insights: string[] = [];

  const totalInvested = rows.reduce((sum, r) => sum + r.invested, 0);
  if (totalInvested <= 0) {
    return { score: 0, insights: ["Asset Allocation: No investments recorded"] };
  }

  // Classify SIP funds as equity, LUMPSUM as debt for MVP
  const equityInvested = rows.filter((r) => r.type === 'SIP').reduce((sum, r) => sum + r.invested, 0);
  const debtInvested = rows.filter((r) => r.type === 'LUMPSUM').reduce((sum, r) => sum + r.invested, 0);
  
  const equityPercent = (equityInvested / totalInvested) * 100;

  // Age benchmark check
  let outsideBenchmark = false;
  let benchmarkMsg = "";
  if (assessment.age < 30) {
    if (equityPercent < 70 || equityPercent > 90) {
      outsideBenchmark = true;
      benchmarkMsg = "70-90% for age under 30";
    }
  } else if (assessment.age >= 30 && assessment.age <= 40) {
    if (equityPercent < 60 || equityPercent > 75) {
      outsideBenchmark = true;
      benchmarkMsg = "60-75% for age 30-40";
    }
  } else {
    // 40+
    if (equityPercent >= 60) {
      outsideBenchmark = true;
      benchmarkMsg = "below 60% for age 40+";
    }
  }

  if (outsideBenchmark) {
    score -= 8;
    insights.push(`Asset Allocation: Equity exposure (${equityPercent.toFixed(1)}%) is outside the recommended age benchmark (${benchmarkMsg})`);
  }

  // No debt exposure (all SIP, no lumpsum)
  if (debtInvested === 0) {
    score -= 4;
    insights.push("Asset Allocation: No debt exposure (all investments in SIP/Equity) — consider adding lumpsum/debt for safety");
  }

  // Over-concentration in one fund (>40% of total invested)
  const maxConcentrationRow = rows.reduce((max, r) => (r.invested > max.invested ? r : max), rows[0]!);
  const maxConcentrationPercent = (maxConcentrationRow.invested / totalInvested) * 100;
  if (maxConcentrationPercent > 40) {
    score -= 4;
    insights.push(`Asset Allocation: Over-concentration — ${maxConcentrationRow.fundName} represents ${maxConcentrationPercent.toFixed(1)}% of total invested amount (limit 40%)`);
  }

  // Overall imbalance (equity + debt not summing reasonably)
  if (Math.abs(equityInvested + debtInvested - totalInvested) > 0.01) {
    score -= 4;
    insights.push("Asset Allocation: Overall imbalance — Sum of equity and debt investments does not match the total portfolio investment");
  }

  return { score: Math.max(0, score), insights };
}
