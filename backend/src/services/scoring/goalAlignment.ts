import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext } from './index';

/** Goals that map to short-term behavior (< 5 years) */
const SHORT_TERM_GOALS: Goal[] = [Goal.SHORT_TERM, Goal.MARRIAGE, Goal.TAX_SAVING];

/** Goals that map to long-term behavior (5+ years) */
const LONG_TERM_GOALS: Goal[] = [
  Goal.LONG_TERM,
  Goal.WEALTH_CREATION,
  Goal.RETIREMENT,
  Goal.CHILD_EDUCATION,
  Goal.HOUSE_PURCHASE,
  Goal.PASSIVE_INCOME,
];

export function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext
): { score: number; insights: string[] } {
  let score = 20;
  const insights: string[] = [];

  const hasNoGoal = !assessment.goal || assessment.goal === Goal.EXPLORING || assessment.goal === Goal.NOT_SURE_YET;
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

  // Short-term goal but long tenure mismatch
  const isShortTermGoal = assessment.goal && SHORT_TERM_GOALS.includes(assessment.goal);
  if (isShortTermGoal && avgTenure > 3) {
    score -= 5;
    insights.push(`Goal Alignment: Tenure mismatch — Average fund tenure is ${avgTenure.toFixed(1)} years, which exceeds the 3-year threshold for short-term goals`);
  }

  // Long-term goal but no SIP
  const isLongTermGoal = assessment.goal && LONG_TERM_GOALS.includes(assessment.goal);
  if (isLongTermGoal && sipCount === 0) {
    score -= 5;
    insights.push("Goal Alignment: No active SIP for long-term/wealth-creation goals — consider setting up systematic investments");
  }

  return { score: Math.max(0, score), insights };
}
