import { PortfolioRow, Goal } from '@prisma/client';
import type { AssessmentContext, DimensionResult } from './index';
import {
  detectFundCategory,
  getFundReturn,
  getCategoryBenchmarkReturn,
} from '../amfiService';

/**
 * Efficiency Matrix with AMFI API (max 20 pts)
 *
 * 1. Portfolio XIRR                → +6
 * 2. Fund vs Benchmark comparison  → +6
 * 3. Underperforming fund count    → +4
 * 4. Value erosion check           → +4
 */

export async function scoreDimension(
  rows: PortfolioRow[],
  assessment: AssessmentContext
): Promise<DimensionResult> {
  let score = 0;
  const insights: string[] = [];

  const totalInvested = rows.reduce((sum, r) => sum + r.invested, 0);
  const totalCurrentValue = rows.reduce((sum, r) => sum + r.currentValue, 0);
  const fundCount = rows.length;

  if (totalInvested <= 0 || fundCount === 0) {
    return { score: 0, insights: ["Efficiency: No investments recorded"] };
  }

  // ── 1. Portfolio XIRR (simplified) (+6) ──
  // Calculate time-weighted return
  let totalTenure = 0;
  for (const row of rows) {
    const tenureInMs = Date.now() - new Date(row.startDate).getTime();
    const tenureInYears = Math.max(0.01, tenureInMs / (365.25 * 24 * 60 * 60 * 1000));
    totalTenure += tenureInYears;
  }
  const avgTenure = Math.max(0.01, totalTenure / fundCount);

  // Annualized return approximation
  const totalReturn = (totalCurrentValue - totalInvested) / totalInvested;
  const annualizedReturn = (Math.pow(1 + totalReturn, 1 / avgTenure) - 1) * 100;

  if (annualizedReturn >= 12) {
    score += 6;
  } else if (annualizedReturn >= 8) {
    score += 4;
    insights.push(`Efficiency: Portfolio annualized return is ${annualizedReturn.toFixed(1)}% — good but below the 12% growth benchmark`);
  } else if (annualizedReturn >= 5) {
    score += 2;
    insights.push(`Efficiency: Portfolio annualized return is ${annualizedReturn.toFixed(1)}% — below market average. Review underperforming funds`);
  } else {
    score += 0;
    insights.push(`Efficiency: Portfolio annualized return is only ${annualizedReturn.toFixed(1)}% — significantly below market benchmarks`);
  }

  // ── 2. Fund vs Benchmark Comparison (+6) ──
  // Fetch returns from AMFI API (parallel, with error tolerance)
  let benchmarkComparisonScore = 0;
  try {
    // Get returns for each fund (parallel with timeout)
    const fundReturnPromises = rows.map(async (row) => {
      const category = detectFundCategory(row.fundName);
      const [fundResult, benchmarkReturn] = await Promise.all([
        getFundReturn(row.fundName),
        getCategoryBenchmarkReturn(category),
      ]);
      return {
        fundName: row.fundName,
        category,
        fundReturn: fundResult.returnPct,
        benchmarkReturn,
      };
    });

    // Race against a 10-second timeout for all AMFI calls
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));
    const fundReturnsResult = await Promise.race([
      Promise.all(fundReturnPromises),
      timeoutPromise,
    ]);

    if (fundReturnsResult && Array.isArray(fundReturnsResult)) {
      const fundReturns = fundReturnsResult;

      // Count funds that beat or match their benchmark
      let beatingBenchmark = 0;
      let underperformingFunds: string[] = [];
      let comparableFunds = 0;

      for (const fr of fundReturns) {
        if (fr.fundReturn !== null && fr.benchmarkReturn !== null) {
          comparableFunds++;
          const diff = fr.fundReturn - fr.benchmarkReturn;

          if (diff >= 0) {
            beatingBenchmark++;
          } else if (diff < -2) {
            underperformingFunds.push(fr.fundName);
          }
        }
      }

      if (comparableFunds > 0) {
        const beatRatio = beatingBenchmark / comparableFunds;

        if (beatRatio >= 0.6) {
          benchmarkComparisonScore = 6;
        } else if (beatRatio >= 0.4) {
          benchmarkComparisonScore = 3;
          insights.push(`Efficiency: ${(beatRatio * 100).toFixed(0)}% of comparable funds are beating their category benchmark — aim for 60%+`);
        } else {
          benchmarkComparisonScore = 1;
          insights.push(`Efficiency: Only ${(beatRatio * 100).toFixed(0)}% of funds are outperforming their benchmarks — consider switching to index funds or better-performing active funds`);
        }

        // Report top underperformers
        if (underperformingFunds.length > 0) {
          const topUnderperformers = underperformingFunds.slice(0, 2).join(', ');
          insights.push(`Efficiency: Underperforming funds (vs benchmark): ${topUnderperformers}`);
        }
      } else {
        // No comparable data available — give neutral score
        benchmarkComparisonScore = 3;
      }
    } else {
      // Timeout or error — give partial credit
      benchmarkComparisonScore = 3;
    }
  } catch (err) {
    console.error('AMFI benchmark comparison failed:', err);
    benchmarkComparisonScore = 3; // Graceful degradation
  }

  score += benchmarkComparisonScore;

  // ── 3. Underperforming Fund Count (+4) ──
  // Funds where currentValue < invested
  const underperformingCount = rows.filter(r => r.currentValue < r.invested).length;
  const underperformingRatio = underperformingCount / fundCount;

  if (underperformingRatio < 0.2) {
    score += 4;
  } else if (underperformingRatio <= 0.4) {
    score += 2;
    insights.push(`Efficiency: ${(underperformingRatio * 100).toFixed(0)}% of your funds are in the red (current value below invested) — review these holdings`);
  } else {
    score += 0;
    insights.push(`Efficiency: ${(underperformingRatio * 100).toFixed(0)}% of your funds show negative returns — significant portfolio review needed`);
  }

  // ── 4. Value Erosion Check (+4) ──
  // Overall portfolio value vs invested
  const portfolioGainPct = ((totalCurrentValue - totalInvested) / totalInvested) * 100;

  if (portfolioGainPct >= 20) {
    score += 4;
  } else if (portfolioGainPct >= 5) {
    score += 2;
    insights.push(`Efficiency: Portfolio has gained ${portfolioGainPct.toFixed(1)}% overall — decent but room for optimization`);
  } else if (portfolioGainPct >= 0) {
    score += 1;
    insights.push(`Efficiency: Portfolio has gained only ${portfolioGainPct.toFixed(1)}% overall — underperforming relative to inflation`);
  } else {
    score += 0;
    insights.push(`Efficiency: Portfolio is in net loss (${portfolioGainPct.toFixed(1)}%) — immediate review recommended`);
  }

  return { score: Math.min(20, Math.max(0, score)), insights };
}
