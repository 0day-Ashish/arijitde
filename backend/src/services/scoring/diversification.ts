import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext } from './index';

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext
): { score: number; insights: string[] } {
  let score = 20;
  const insights: string[] = [];

  const totalValue = rows.reduce((sum, r) => sum + r.currentValue, 0);
  if (totalValue <= 0) {
    return { score: 0, insights: ["Diversification: No portfolio value recorded"] };
  }

  const fundCount = rows.length;

  if (fundCount < 3) {
    score -= 5;
    insights.push(`Diversification: Under-diversified — Only ${fundCount} fund(s) in portfolio (recommended 3-6)`);
  } else if (fundCount > 6) {
    score -= 5;
    insights.push(`Diversification: Over-diversified — ${fundCount} funds in portfolio (recommended 3-6 to avoid dilution)`);
  }

  // Single fund > 40% of total portfolio value
  const maxValRow = rows.reduce((max, r) => (r.currentValue > max.currentValue ? r : max), rows[0]!);
  const maxValPercent = (maxValRow.currentValue / totalValue) * 100;
  if (maxValPercent > 40) {
    score -= 5;
    insights.push(`Diversification: High concentration — ${maxValRow.fundName} makes up ${maxValPercent.toFixed(1)}% of the total portfolio value (limit 40%)`);
  }

  // All funds have same start date (only if more than 1 fund)
  if (fundCount > 1) {
    const firstDate = new Date(rows[0]!.startDate).toDateString();
    const allSameDate = rows.every((r) => new Date(r.startDate).toDateString() === firstDate);
    if (allSameDate) {
      score -= 5;
      insights.push("Diversification: Possible overlap — All funds were started on the same date, indicating a lack of time-based diversification");
    }
  }

  return { score: Math.max(0, score), insights };
}
