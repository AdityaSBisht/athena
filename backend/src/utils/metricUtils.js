const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const sumAmounts = (transactions, type = "expense") =>
  transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);

export const getCategorySpend = (transactions) =>
  transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      return totals;
    }, {});

export const getDiscretionarySpend = (categorySpend) => {
  const discretionaryCategories = ["shopping", "entertainment", "travel"];

  return discretionaryCategories.reduce(
    (sum, category) => sum + (categorySpend[category] || 0),
    0
  );
};

export const calculateDerivedMetrics = ({ profile, transactions }) => {
  const income = sumAmounts(transactions, "income") || profile.monthlyIncome;
  const totalExpenses = sumAmounts(transactions, "expense");
  const categorySpend = getCategorySpend(transactions);
  const actualSavings = categorySpend.savings || Math.max(income - totalExpenses, 0);
  const debtToIncomeRatio = profile.monthlyDebtPayments / Math.max(income, 1);
  const savingsRate = actualSavings / Math.max(income, 1);
  const budgetedSpend = Object.entries(profile.plannedBudget)
    .filter(([category]) => category !== "savings")
    .reduce((sum, [, amount]) => sum + amount, 0);
  const actualNonSavingsSpend = Object.entries(categorySpend)
    .filter(([category]) => category !== "savings")
    .reduce((sum, [, amount]) => sum + amount, 0);
  const spendingVariance = Math.abs(actualNonSavingsSpend - budgetedSpend) / Math.max(budgetedSpend, 1);
  const largestOverspendCategory = Object.keys(profile.plannedBudget)
    .filter((category) => category !== "savings")
    .map((category) => ({
      category,
      gap: (categorySpend[category] || 0) - (profile.plannedBudget[category] || 0)
    }))
    .sort((left, right) => right.gap - left.gap)[0];
  const discretionarySpend = getDiscretionarySpend(categorySpend);
  const discretionarySpendRatio = discretionarySpend / Math.max(income, 1);
  const emergencyFundScore = clamp(profile.cashBufferMonths / 6, 0, 1);
  const incomeStabilityScore = clamp(
    transactions.filter((transaction) => transaction.type === "income" && transaction.recurring).length /
      Math.max(transactions.filter((transaction) => transaction.type === "income").length, 1),
    0,
    1
  );

  return {
    monthlyIncomeObserved: Number(income.toFixed(2)),
    monthlyExpensesObserved: Number(totalExpenses.toFixed(2)),
    monthlySavingsActual: Number(actualSavings.toFixed(2)),
    monthlySavingsGap: Number((actualSavings - profile.savingsGoalMonthly).toFixed(2)),
    savingsRate: Number(savingsRate.toFixed(3)),
    spendingVariance: Number(spendingVariance.toFixed(3)),
    largestOverspendCategory: largestOverspendCategory?.gap > 0 ? largestOverspendCategory.category : "none",
    discretionarySpendRatio: Number(discretionarySpendRatio.toFixed(3)),
    incomeStabilityScore: Number(incomeStabilityScore.toFixed(3)),
    debtToIncomeRatio: Number(debtToIncomeRatio.toFixed(3)),
    emergencyFundScore: Number(emergencyFundScore.toFixed(3)),
    categorySpend
  };
};

export { clamp };
