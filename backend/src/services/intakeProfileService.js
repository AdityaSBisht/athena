const round = (value) => Math.round(value);

const toTitleCase = (value = "") =>
  String(value)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const blockedOccupationTerms = ["dumb", "dumbass", "idiot", "stupid", "moron", "loser", "fuck", "shit", "bitch", "asshole"];

const sanitizeOccupation = (value = "") => {
  const normalized = toTitleCase(value);
  const lowered = normalized.toLowerCase();

  if (!normalized || blockedOccupationTerms.some((term) => lowered.includes(term))) {
    return "Custom Profile";
  }

  return normalized;
};

const normalizeSpendingDetails = (spendingDetails = {}) => ({
  housing: Math.max(Number(spendingDetails.housing) || 0, 0),
  food: Math.max(Number(spendingDetails.food) || 0, 0),
  shopping: Math.max(Number(spendingDetails.shopping) || 0, 0),
  entertainment: Math.max(Number(spendingDetails.entertainment) || 0, 0),
  travel: Math.max(Number(spendingDetails.travel) || 0, 0),
  transport: Math.max(Number(spendingDetails.transport) || 0, 0)
});

export const buildIntakeProfile = (answers, spendingDetails = null) => {
  const normalizedOccupation = sanitizeOccupation(answers.occupation);
  const normalizedSpendingDetails = spendingDetails ? normalizeSpendingDetails(spendingDetails) : null;
  const fixedExpenses = normalizedSpendingDetails
    ? normalizedSpendingDetails.housing
    : Math.round(answers.monthlyIncome * 0.34);
  const discretionaryBudget = Math.max(
    answers.monthlyIncome - fixedExpenses - answers.monthlyDebtPayments - answers.monthlySavingsGoal,
    answers.monthlyIncome * 0.12
  );

  const plannedBudget = {
    housing: round(fixedExpenses),
    food: normalizedSpendingDetails ? round(normalizedSpendingDetails.food) : round(discretionaryBudget * 0.28),
    transport: normalizedSpendingDetails ? round(normalizedSpendingDetails.transport) : round(discretionaryBudget * 0.18),
    shopping: round(discretionaryBudget * 0.24),
    entertainment: round(discretionaryBudget * 0.18),
    travel: round(discretionaryBudget * 0.12),
    savings: round(answers.monthlySavingsGoal)
  };

  const actualCategorySpend = normalizedSpendingDetails
    ? normalizedSpendingDetails
    : {
        food: round(plannedBudget.food * (answers.riskTolerance === "high" ? 1.2 : answers.riskTolerance === "medium" ? 1.08 : 0.95)),
        shopping: round(plannedBudget.shopping * (answers.riskTolerance === "high" ? 1.2 : answers.riskTolerance === "medium" ? 1.08 : 0.95)),
        entertainment: round(plannedBudget.entertainment * (answers.riskTolerance === "high" ? 1.2 : answers.riskTolerance === "medium" ? 1.08 : 0.95)),
        travel: round(plannedBudget.travel * (answers.riskTolerance === "high" ? 1.3 : 1)),
        transport: round(plannedBudget.transport * 1.04)
      };

  const actualSavings = normalizedSpendingDetails
    ? Math.max(
        round(
          answers.monthlyIncome -
            fixedExpenses -
            answers.monthlyDebtPayments -
            Object.entries(actualCategorySpend)
              .filter(([key]) => key !== "housing")
              .reduce((sum, [, value]) => sum + value, 0)
        ),
        0
      )
    : Math.max(round(answers.monthlySavingsGoal * 0.84), 50);
  const overspendFactor = answers.riskTolerance === "high" ? 1.2 : answers.riskTolerance === "medium" ? 1.08 : 0.95;

  return {
    profile: {
      userId: `user_custom_${Date.now()}`,
      persona: normalizedOccupation,
      age: answers.age,
      occupation: normalizedOccupation,
      monthlyIncome: answers.monthlyIncome,
      fixedExpenses,
      startingNetWorth: answers.currentSavings,
      cashBufferMonths: answers.cashBufferMonths,
      monthlyDebtPayments: answers.monthlyDebtPayments,
      debtBalance: answers.debtBalance,
      savingsGoalMonthly: answers.monthlySavingsGoal,
      savingsGoalAnnual: answers.monthlySavingsGoal * 12,
      targetRetirementAge: 60,
      riskTolerance: answers.riskTolerance,
      goals: [
        answers.primaryGoal,
        "Build a stronger long-term financial trajectory"
      ],
      plannedBudget,
      categoryEvidenceMode: normalizedSpendingDetails ? "provided" : "estimated"
    },
    transactions: [
      {
        id: "txn_custom_income",
        date: "2026-03-01",
        category: "income",
        amount: answers.monthlyIncome,
        type: "income",
        merchant: "Primary Income",
        recurring: true
      },
      {
        id: "txn_custom_housing",
        date: "2026-03-03",
        category: "housing",
        amount: fixedExpenses,
        type: "expense",
        merchant: "Housing",
        recurring: true
      },
      {
        id: "txn_custom_food",
        date: "2026-03-05",
        category: "food",
        amount: actualCategorySpend.food,
        type: "expense",
        merchant: "Food + Delivery",
        recurring: false
      },
      {
        id: "txn_custom_transport",
        date: "2026-03-08",
        category: "transport",
        amount: actualCategorySpend.transport,
        type: "expense",
        merchant: "Transport",
        recurring: true
      },
      {
        id: "txn_custom_shopping",
        date: "2026-03-12",
        category: "shopping",
        amount: actualCategorySpend.shopping,
        type: "expense",
        merchant: "Shopping",
        recurring: false
      },
      {
        id: "txn_custom_entertainment",
        date: "2026-03-16",
        category: "entertainment",
        amount: actualCategorySpend.entertainment,
        type: "expense",
        merchant: "Entertainment",
        recurring: false
      },
      {
        id: "txn_custom_travel",
        date: "2026-03-20",
        category: "travel",
        amount: actualCategorySpend.travel,
        type: "expense",
        merchant: "Travel",
        recurring: false
      },
      {
        id: "txn_custom_debt",
        date: "2026-03-22",
        category: "debt",
        amount: answers.monthlyDebtPayments,
        type: "expense",
        merchant: "Debt Payment",
        recurring: true
      },
      {
        id: "txn_custom_savings",
        date: "2026-03-26",
        category: "savings",
        amount: actualSavings,
        type: "expense",
        merchant: "Savings Transfer",
        recurring: true
      }
    ]
  };
};
