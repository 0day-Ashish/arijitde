import { PortfolioRow, Goal } from '@prisma/client';

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: { age: number; goal: Goal | null }
): { score: number; insights: string[] } {
  let score = 20;
  const insights: string[] = [];

  const hasNoGoal = !assessment.goal || assessment.goal === Goal.EXPLORING;
  if (hasNoGoal) {
    score -= 10;
    insights.push("Goal Alignment: No specific goal defined — consider selecting a target goal like Wealth Creation or Retirement");
  }

  // Calculate average tenure in years
  let totalTenure = 0;
  let sipCount = 0;
  for (const row of rows) {
    const tenureInMs = Date.now() - new Date(row.startDate).getTime();
    const tenureInYears = Math.max(0.01, tenureInMs / (365.25 * 24 * 60 * 60 * 1000));
    totalTenure += tenureInYears;
    if (row.type === 'SIP') {
      sipCount++;
    }
  }
  const avgTenure = rows.length > 0 ? totalTenure / rows.length : 0;

  if (assessment.goal === Goal.SHORT_TERM && avgTenure > 3) {
    score -= 5;
    insights.push(`Goal Alignment: Tenure mismatch — Average fund tenure is ${avgTenure.toFixed(1)} years, which exceeds the 3-year threshold for short-term goals`);
  }

  const isLongTermGoal = assessment.goal === Goal.LONG_TERM || assessment.goal === Goal.WEALTH_CREATION;
  if (isLongTermGoal && sipCount === 0) {
    score -= 5;
    insights.push("Goal Alignment: No active SIP for long-term/wealth-creation goals — consider setting up systematic investments");
  }

  return { score: Math.max(0, score), insights };
}
