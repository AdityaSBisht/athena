import { calculateDerivedMetrics, clamp } from "../utils/metricUtils.js";

const formatMoney = (value) => `$${Math.round(value).toLocaleString()}`;

const buildRecommendations = ({ profile, metrics }) => {
  const recommendations = [];
  const hasObservedCategoryEvidence = profile.categoryEvidenceMode !== "estimated";

  if (profile.cashBufferMonths < 6) {
    const monthsNeeded = Math.max(1, Math.ceil(6 - profile.cashBufferMonths));
    const upside = monthsNeeded * profile.fixedExpenses;

    recommendations.push({
      title: `Build ${monthsNeeded} more months of emergency fund before investing harder`,
      confidence: 88,
      urgency: "high",
      reason: "Your cash cushion is thin. Build more safety first so one bad month does not throw everything off.",
      projectedUpside: upside,
      category: "resilience"
    });
  }

  if (metrics.debtToIncomeRatio > 0.12 || profile.debtBalance > profile.monthlyIncome) {
    const redirectAmount = Math.round(profile.monthlyDebtPayments * 0.6);
    const upside = redirectAmount * 12 * 10;

    recommendations.push({
      title: `Pay off high drag debt first, then redirect ${formatMoney(redirectAmount)}/month into investing`,
      confidence: 83,
      urgency: "high",
      reason: "This debt is eating room in your monthly budget and slowing down everything else.",
      projectedUpside: upside,
      category: "debt"
    });
  }

  if (metrics.discretionarySpendRatio > 0.18 || metrics.largestOverspendCategory !== "none") {
    const recommendationBase = hasObservedCategoryEvidence && metrics.largestOverspendCategory !== "none"
      ? (metrics.categorySpend[metrics.largestOverspendCategory] || 0)
      : Math.round(metrics.monthlyExpensesObserved * Math.max(metrics.discretionarySpendRatio, 0.12));
    const monthlyCut = Math.round(recommendationBase * 0.15);
    const upside = monthlyCut * 12 * 10;
    const title = hasObservedCategoryEvidence && metrics.largestOverspendCategory !== "none"
      ? `Cut ${metrics.largestOverspendCategory} by 15%; projected 10-year gain: ${formatMoney(upside)}`
      : `Trim discretionary spending by 15%; projected 10-year gain: ${formatMoney(upside)}`;
    const reason = hasObservedCategoryEvidence
      ? "This is one of the easiest places to cut without changing your whole life."
      : "Your spending looks loose, but we still need more category detail to name the exact leak.";

    recommendations.push({
      title,
      confidence: 79,
      urgency: "medium",
      reason,
      projectedUpside: upside,
      category: "behavior"
    });
  }

  if (metrics.monthlySavingsGap < 0) {
    const recoverAmount = Math.round(Math.abs(metrics.monthlySavingsGap));
    recommendations.push({
      title: `Close the monthly savings gap by ${formatMoney(recoverAmount)} before taking on new goals`,
      confidence: 74,
      urgency: "medium",
      reason: "Right now your plan expects more saving than your real cash flow is delivering.",
      projectedUpside: recoverAmount * 12 * 5,
      category: "cash-flow"
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Increase automatic investing by 10% and preserve your current discipline",
      confidence: 68,
      urgency: "low",
      reason: "You already look fairly steady, so the next win is simply investing a little more on autopilot.",
      projectedUpside: Math.round(metrics.monthlySavingsActual * 0.1 * 12 * 10),
      category: "optimization"
    });
  }

  return recommendations
    .sort((a, b) => b.projectedUpside - a.projectedUpside)
    .slice(0, 3);
};

const buildHabitDrift = ({ metrics, profile }) => {
  const baseSavingsRate = metrics.savingsRate;
  const baseVariance = metrics.spendingVariance;

  return Array.from({ length: 6 }, (_, index) => {
    const month = index + 1;
    const driftDirection = profile.riskTolerance === "high" ? -1 : profile.riskTolerance === "medium" ? 0 : 1;
    const savingsRate = clamp(baseSavingsRate + driftDirection * month * 0.008 - month * 0.002, 0.01, 0.4);
    const variance = clamp(baseVariance - driftDirection * month * 0.02 + month * 0.005, 0.03, 0.5);

    return {
      month: `M${month}`,
      savingsRate: Number((savingsRate * 100).toFixed(1)),
      spendingVariance: Number((variance * 100).toFixed(1)),
      status: savingsRate >= baseSavingsRate ? "improving" : "slipping"
    };
  });
};

const buildStressTests = ({ profile, metrics }) => {
  const currentFreeCashFlow = Math.max(profile.monthlyIncome - profile.fixedExpenses - profile.monthlyDebtPayments, 0);
  const scenarios = [
    {
      id: "job_loss",
      label: "3-month job loss",
      impact: profile.fixedExpenses * 3,
      recoveryMonths: Math.ceil((profile.fixedExpenses * 3) / Math.max(metrics.monthlySavingsActual, 1))
    },
    {
      id: "medical_expense",
      label: "Medical expense",
      impact: 7500,
      recoveryMonths: Math.ceil(7500 / Math.max(metrics.monthlySavingsActual, 1))
    },
    {
      id: "market_drop",
      label: "20% market drop",
      impact: profile.startingNetWorth * 0.2,
      recoveryMonths: Math.ceil((profile.startingNetWorth * 0.2) / Math.max(metrics.monthlySavingsActual, 1))
    },
    {
      id: "rent_increase",
      label: "15% rent increase",
      impact: (profile.plannedBudget.housing || profile.fixedExpenses * 0.58) * 0.15 * 12,
      recoveryMonths: Math.ceil(((profile.plannedBudget.housing || profile.fixedExpenses * 0.58) * 0.15 * 12) / Math.max(currentFreeCashFlow, 1))
    }
  ];

  return scenarios.map((scenario) => {
    const postShockReserve = profile.startingNetWorth - scenario.impact;
    const survivalScore = Math.round(clamp((postShockReserve / Math.max(profile.fixedExpenses * 3, 1)) * 100, 5, 95));

    return {
      ...scenario,
      impact: Math.round(scenario.impact),
      recoveryMonths: Math.min(scenario.recoveryMonths, 36),
      survivalScore
    };
  });
};

const normalizeGoal = (goals = []) => {
  const goalText = goals.join(" ").toLowerCase();
  if (goalText.includes("debt")) return "debt-free";
  if (goalText.includes("emergency")) return "emergency-fund";
  if (goalText.includes("home")) return "home-down-payment";
  return "retirement";
};

const buildGoalOptimizer = ({ profile, metrics }) => {
  const selectedGoal = normalizeGoal(profile.goals);
  const monthlyCapacity = Math.max(metrics.monthlySavingsActual, profile.savingsGoalMonthly * 0.6, 50);

  const options = {
    "debt-free": {
      label: "Debt-Free",
      targetAmount: profile.debtBalance,
      monthsToGoal: Math.ceil(profile.debtBalance / monthlyCapacity),
      recommendation: `Point ${formatMoney(monthlyCapacity)} toward debt until the balance is cleared, then redirect that same amount into investing.`
    },
    "emergency-fund": {
      label: "Emergency Fund",
      targetAmount: profile.fixedExpenses * 6,
      monthsToGoal: Math.ceil(Math.max(profile.fixedExpenses * 6 - profile.startingNetWorth, 0) / monthlyCapacity),
      recommendation: `Build up about six months of living costs before taking bigger investing swings.`
    },
    "home-down-payment": {
      label: "Home Down Payment",
      targetAmount: profile.monthlyIncome * 12,
      monthsToGoal: Math.ceil(Math.max(profile.monthlyIncome * 12 - profile.startingNetWorth, 0) / monthlyCapacity),
      recommendation: `Keep this money stable and easy to access while you build toward the down payment.`
    },
    retirement: {
      label: "Retirement",
      targetAmount: profile.monthlyIncome * 12 * 10,
      monthsToGoal: Math.ceil(Math.max(profile.monthlyIncome * 12 * 10 - profile.startingNetWorth, 0) / Math.max(monthlyCapacity * 1.3, 1)),
      recommendation: `Keep building savings and investing at the same time, then invest more once your cushion is stronger.`
    }
  };

  const plan = options[selectedGoal];

  return {
    selectedGoal: plan.label,
    targetAmount: Math.round(plan.targetAmount),
    monthsToGoal: Math.min(plan.monthsToGoal, 480),
    recommendation: plan.recommendation
  };
};

const buildExplainability = ({ metrics, profile }) => {
  const factors = [
    {
      label: "Cash Buffer",
      weight: 30,
      score: Math.round(metrics.emergencyFundScore * 100),
      impact: profile.cashBufferMonths >= 6 ? "supports approval" : "weakens approval"
    },
    {
      label: "Debt Load",
      weight: 25,
      score: Math.round((1 - clamp(metrics.debtToIncomeRatio / 0.43, 0, 1)) * 100),
      impact: metrics.debtToIncomeRatio <= 0.2 ? "supports approval" : "creates caution"
    },
    {
      label: "Savings Discipline",
      weight: 20,
      score: Math.round(clamp(metrics.savingsRate / 0.2, 0, 1) * 100),
      impact: metrics.savingsRate >= 0.12 ? "supports approval" : "creates caution"
    },
    {
      label: "Income Stability",
      weight: 15,
      score: Math.round(metrics.incomeStabilityScore * 100),
      impact: metrics.incomeStabilityScore >= 0.75 ? "supports approval" : "weakens approval"
    },
    {
      label: "Behavior Consistency",
      weight: 10,
      score: Math.round((1 - clamp(metrics.spendingVariance, 0, 1)) * 100),
      impact: metrics.spendingVariance <= 0.18 ? "supports approval" : "creates caution"
    }
  ];

  const weightedScore = Math.round(
    factors.reduce((sum, factor) => sum + factor.score * (factor.weight / 100), 0)
  );

  return {
    approvalOdds: `${Math.round(clamp(weightedScore, 15, 92))}%`,
    factors
  };
};

const buildCreditScoreEstimate = ({ profile, metrics, explainability }) => {
  const paymentHistory = clamp((metrics.incomeStabilityScore * 0.6 + (metrics.monthlySavingsGap >= 0 ? 0.4 : 0.18)) * 100, 20, 100);
  const amountsOwed = clamp((1 - clamp(metrics.debtToIncomeRatio / 0.43, 0, 1)) * 100, 15, 100);
  const lengthOfHistory = clamp((profile.age - 18) * 3.5, 20, 95);
  const creditMix = profile.debtBalance > 0 ? 72 : 58;
  const newCredit = metrics.discretionarySpendRatio < 0.2 ? 78 : 60;

  const normalized =
    paymentHistory * 0.35 +
    amountsOwed * 0.3 +
    lengthOfHistory * 0.15 +
    creditMix * 0.1 +
    newCredit * 0.1;

  const estimatedScore = Math.round(300 + (normalized / 100) * 550);

  let band = "Deep Subprime";
  if (estimatedScore >= 720) band = "Super Prime";
  else if (estimatedScore >= 660) band = "Prime";
  else if (estimatedScore >= 620) band = "Near Prime";
  else if (estimatedScore >= 580) band = "Subprime";

  return {
    estimatedScore,
    band,
    notBankVerified: true,
    factors: {
      paymentHistory: Math.round(paymentHistory),
      amountsOwed: Math.round(amountsOwed),
      lengthOfHistory: Math.round(lengthOfHistory),
      creditMix,
      newCredit
    },
    explanation: `This transparent estimate blends payment behavior, debt pressure, age proxy, credit mix proxy, and new-credit caution into a 300-850 style score.`
  };
};

export const buildDecisionEngine = ({ profile, transactions }) => {
  const metrics = calculateDerivedMetrics({ profile, transactions });
  const explainability = buildExplainability({ metrics, profile });

  return {
    recommendations: buildRecommendations({ profile, metrics }),
    habitDrift: buildHabitDrift({ metrics, profile }),
    stressTests: buildStressTests({ profile, metrics }),
    goalOptimizer: buildGoalOptimizer({ profile, metrics }),
    explainability,
    creditScore: buildCreditScoreEstimate({ profile, metrics, explainability })
  };
};
