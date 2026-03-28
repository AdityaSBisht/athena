import { calculateDerivedMetrics, clamp } from "../utils/metricUtils.js";
import { generateHumanInsights } from "./insightService.js";

export const generateRiskProfile = ({ profile, transactions }) => {
  const metrics = calculateDerivedMetrics({ profile, transactions });

  // Bank-style risk view:
  // debt pressure and discretionary behavior increase risk,
  // while savings resilience and stable income reduce it.
  const riskScoreRaw =
    metrics.debtToIncomeRatio * 40 +
    metrics.discretionarySpendRatio * 30 +
    (1 - metrics.emergencyFundScore) * 20 +
    (1 - metrics.incomeStabilityScore) * 10;

  const riskScore = Math.round(clamp(riskScoreRaw * 100 / 70, 8, 95));

  let classification = "Stable";
  if (riskScore >= 70) {
    classification = "High Risk";
  } else if (riskScore >= 45) {
    classification = "Watchlist";
  }

  return {
    riskScore,
    classification,
    profileSummary: {
      cashBufferMonths: profile.cashBufferMonths,
      debtToIncomeRatio: metrics.debtToIncomeRatio,
      savingsRate: metrics.savingsRate,
      incomeStabilityScore: metrics.incomeStabilityScore
    },
    flags: [
      {
        label: "Emergency Fund",
        status: profile.cashBufferMonths >= 6 ? "good" : "risky",
        value: `${profile.cashBufferMonths.toFixed(1)} months`
      },
      {
        label: "Debt Load",
        status: metrics.debtToIncomeRatio <= 0.12 ? "good" : "risky",
        value: `${Math.round(metrics.debtToIncomeRatio * 100)}% DTI`
      },
      {
        label: "Savings Discipline",
        status: metrics.savingsRate >= 0.15 ? "good" : "risky",
        value: `${Math.round(metrics.savingsRate * 100)}% savings rate`
      }
    ],
    insights: generateHumanInsights({
      honestyScore: Math.round((1 - metrics.spendingVariance) * 100),
      spendingPatterns: metrics,
      riskScore,
      profile,
      metrics
    })
  };
};
