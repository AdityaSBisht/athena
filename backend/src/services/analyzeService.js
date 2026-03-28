import { calculateDerivedMetrics, clamp } from "../utils/metricUtils.js";
import { generateHumanInsights } from "./insightService.js";

export const analyzeFinancialTruth = ({ profile, transactions }) => {
  const metrics = calculateDerivedMetrics({ profile, transactions });

  // Hackathon-friendly honesty model:
  // reward plan/behavior alignment, penalize overspending and missed savings.
  const honestyScoreRaw =
    100 -
    metrics.spendingVariance * 40 -
    Math.max(0, -metrics.monthlySavingsGap / Math.max(profile.savingsGoalMonthly, 1)) * 35 -
    metrics.discretionarySpendRatio * 35;

  const honestyScore = Math.round(clamp(honestyScoreRaw, 5, 98));
  const behaviorInsights = {
    plannedSavings: profile.savingsGoalMonthly,
    actualSavings: metrics.monthlySavingsActual,
    spendingVariance: metrics.spendingVariance,
    largestOverspendCategory: metrics.largestOverspendCategory,
    discretionarySpendRatio: metrics.discretionarySpendRatio
  };

  return {
    honestyScore,
    behaviorInsights,
    metrics,
    insights: generateHumanInsights({
      honestyScore,
      spendingPatterns: behaviorInsights,
      riskScore: Math.round((metrics.debtToIncomeRatio + metrics.discretionarySpendRatio) * 100),
      profile,
      metrics
    })
  };
};
