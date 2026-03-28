export const generateHumanInsights = ({ honestyScore, spendingPatterns, riskScore, profile, metrics }) => {
  const statements = [];
  const savingsDelta = Math.round(Math.abs(metrics.monthlySavingsGap));
  const tenYearHabitCost = Math.round(Math.max(profile.savingsGoalMonthly - metrics.monthlySavingsActual, 0) * 12 * 10);
  const hasObservedCategoryEvidence = profile.categoryEvidenceMode !== "estimated";
  const formatMoney = (value) => `$${Math.round(value).toLocaleString()}`;

  if (metrics.monthlySavingsGap < 0) {
    statements.push(
      `You think you save ${formatMoney(profile.savingsGoalMonthly)}/month, but your behavior suggests ${formatMoney(metrics.monthlySavingsActual)}.`
    );
  } else {
    statements.push(
      `Your money habits back up your story: you're saving about ${formatMoney(metrics.monthlySavingsActual)} each month.`
    );
  }

  if (spendingPatterns.largestOverspendCategory !== "none" && hasObservedCategoryEvidence) {
    statements.push(
      `Your biggest leak is ${spendingPatterns.largestOverspendCategory}, where emotion is beating intention.`
    );
  } else if (metrics.discretionarySpendRatio > 0.18 || metrics.spendingVariance > 0.18) {
    statements.push(`Your spending pattern is drifting off plan, but we would need category-level inputs to name the exact leak.`);
  }

  if (honestyScore < 50) {
    statements.push(`There is a wide gap between your budget story and your real-life choices.`);
  } else if (honestyScore > 80) {
    statements.push(`Your behavior is unusually consistent with your financial plan.`);
  }

  if (tenYearHabitCost > 0) {
    statements.push(
      `At this pace, today's habits could cost you about $${tenYearHabitCost.toLocaleString()} over 10 years.`
    );
  }

  if (riskScore >= 70) {
    statements.push(`A bank would see pressure in your cash flow long before you feel fully in control.`);
  } else if (riskScore <= 35) {
    statements.push(`A lender would likely see you as stable, disciplined, and low-friction to underwrite.`);
  }

  if (metrics.emergencyFundScore < 0.5) {
    statements.push(`Your safety net is thin enough that one bad month could rewrite your whole plan.`);
  }

  return statements.slice(0, 5);
};
