const formatMoney = (value) => `$${Math.round(value).toLocaleString()}`;

const addOrUpdateSavingsTransaction = (transactions, bonusSavings) => {
  if (bonusSavings <= 0) {
    return transactions;
  }

  const savingsTransaction = transactions.find((transaction) => transaction.category === "savings");

  if (savingsTransaction) {
    return transactions.map((transaction) =>
      transaction.id === savingsTransaction.id
        ? { ...transaction, amount: Number((transaction.amount + bonusSavings).toFixed(2)) }
        : transaction
    );
  }

  return [
    ...transactions,
    {
      id: "txn_generated_savings",
      date: "2026-03-28",
      category: "savings",
      amount: Number(bonusSavings.toFixed(2)),
      type: "expense",
      merchant: "Scenario Savings Redirect",
      recurring: true
    }
  ];
};

export const generateScenarioPresets = (payload) => {
  const profile = payload?.profile;
  const transactions = payload?.transactions ?? [];
  const hasObservedCategoryEvidence = profile?.categoryEvidenceMode !== "estimated";
  const discretionaryCategories = new Set(["shopping", "entertainment", "travel"]);
  const discretionarySpend = transactions
    .filter((transaction) => transaction.type === "expense" && discretionaryCategories.has(transaction.category))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const spendingResetAmount = Math.max(
    Math.round(discretionarySpend * 0.2),
    Math.round((profile?.monthlyIncome || 0) * 0.04)
  );
  const raiseDelta = Math.round((profile?.monthlyIncome || 0) * 0.1);
  const debtRedirect = Math.max(
    Math.round((profile?.monthlyDebtPayments || 0) * 0.25),
    50
  );
  const shockImpact = Math.round((profile?.monthlyIncome || 0) * 0.3 * 3);

  return [
    {
      id: "shopping-reset",
      label: hasObservedCategoryEvidence
        ? `Redirect about ${formatMoney(spendingResetAmount)}/month from flexible spend`
        : `Trim flexible spending and recover about ${formatMoney(spendingResetAmount)}/month`,
      description: hasObservedCategoryEvidence
        ? "Reduce shopping, entertainment, and travel pressure based on the current transaction mix and redirect the difference into savings."
        : "Reduce estimated discretionary pressure from the intake model and redirect the recovered cash into savings."
    },
    {
      id: "raise-boost",
      label: `Model a 10% raise (${formatMoney(raiseDelta)}/month)`,
      description: "Increase income and automatically push part of the raise into savings so the upside compounds instead of disappearing into lifestyle creep."
    },
    {
      id: "debt-crush",
      label: `Free up about ${formatMoney(debtRedirect)}/month from debt drag`,
      description: "Lower debt load, reduce repayment friction, and redirect the released monthly cash flow into savings momentum."
    },
    {
      id: "job-shock",
      label: `Stress test a ${formatMoney(shockImpact)} income hit`,
      description: "Model a 3-month income shock and show whether the current plan is resilient enough to absorb it."
    }
  ];
};

export const applyScenarioPreset = (payload, presetId) => {
  const cloned = {
    profile: {
      ...payload.profile,
      plannedBudget: { ...payload.profile.plannedBudget }
    },
    transactions: payload.transactions.map((transaction) => ({ ...transaction }))
  };

  if (presetId === "shopping-reset") {
    const targetedCategories = new Set(["shopping", "entertainment", "travel"]);
    let savingsRedirect = 0;

    cloned.transactions = cloned.transactions.map((transaction) => {
      if (transaction.type === "expense" && targetedCategories.has(transaction.category)) {
        const reducedAmount = Number((transaction.amount * 0.8).toFixed(2));
        savingsRedirect += transaction.amount - reducedAmount;
        return { ...transaction, amount: reducedAmount };
      }

      return transaction;
    });

    cloned.transactions = addOrUpdateSavingsTransaction(cloned.transactions, savingsRedirect);
    cloned.profile.plannedBudget.shopping = Math.round(cloned.profile.plannedBudget.shopping * 0.8);
    cloned.profile.plannedBudget.entertainment = Math.round(cloned.profile.plannedBudget.entertainment * 0.8);
    cloned.profile.plannedBudget.travel = Math.round(cloned.profile.plannedBudget.travel * 0.8);
  }

  if (presetId === "raise-boost") {
    const raiseDelta = cloned.profile.monthlyIncome * 0.1;
    cloned.profile.monthlyIncome = Number((cloned.profile.monthlyIncome * 1.1).toFixed(2));
    cloned.profile.savingsGoalMonthly = Number((cloned.profile.savingsGoalMonthly + raiseDelta * 0.45).toFixed(2));
    cloned.transactions = cloned.transactions.map((transaction) =>
      transaction.type === "income"
        ? { ...transaction, amount: Number((transaction.amount * 1.1).toFixed(2)) }
        : transaction
    );
    cloned.transactions = addOrUpdateSavingsTransaction(cloned.transactions, raiseDelta * 0.35);
  }

  if (presetId === "debt-crush") {
    cloned.profile.debtBalance = Number((cloned.profile.debtBalance * 0.65).toFixed(2));
    cloned.profile.monthlyDebtPayments = Number((cloned.profile.monthlyDebtPayments * 0.75).toFixed(2));
    cloned.transactions = cloned.transactions.map((transaction) => {
      if (transaction.category === "debt") {
        return { ...transaction, amount: Number((transaction.amount * 0.75).toFixed(2)) };
      }
      return transaction;
    });
    cloned.transactions = addOrUpdateSavingsTransaction(cloned.transactions, 180);
  }

  if (presetId === "job-shock") {
    cloned.profile.monthlyIncome = Number((cloned.profile.monthlyIncome * 0.7).toFixed(2));
    cloned.profile.startingNetWorth = Math.max(
      0,
      Number((cloned.profile.startingNetWorth - cloned.profile.fixedExpenses * 3).toFixed(2))
    );
    cloned.profile.cashBufferMonths = Number((cloned.profile.cashBufferMonths * 0.45).toFixed(2));
    cloned.transactions = cloned.transactions.map((transaction) =>
      transaction.type === "income"
        ? { ...transaction, amount: Number((transaction.amount * 0.7).toFixed(2)) }
        : transaction
    );
  }

  return cloned;
};
