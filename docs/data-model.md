# Data Model

## User Financial Profile

```json
{
  "userId": "user_impulsive_spender",
  "persona": "Impulsive Spender",
  "age": 29,
  "occupation": "Brand Strategist",
  "monthlyIncome": 6200,
  "fixedExpenses": 2450,
  "startingNetWorth": 18000,
  "cashBufferMonths": 1.4,
  "monthlyDebtPayments": 540,
  "debtBalance": 9200,
  "savingsGoalMonthly": 1200,
  "savingsGoalAnnual": 14400,
  "targetRetirementAge": 60,
  "riskTolerance": "medium",
  "goals": [
    "Build a 6-month emergency fund",
    "Save for a home down payment"
  ],
  "plannedBudget": {
    "housing": 1700,
    "food": 650,
    "transport": 320,
    "shopping": 350,
    "entertainment": 220,
    "travel": 150,
    "savings": 1200
  }
}
```

### Field Usage

- `monthlyIncome`: Baseline for savings rate, risk score, and future simulation.
- `fixedExpenses`: Used to estimate stability and free cash flow.
- `startingNetWorth`: Starting point for projections.
- `cashBufferMonths`: Strong signal for bank-style resilience scoring.
- `monthlyDebtPayments` and `debtBalance`: Feed risk score and net worth drag.
- `savingsGoalMonthly`: Compared against actual behavior for the lie detector.
- `plannedBudget`: Compared against real spending by category.

## Transactions

```json
[
  {
    "id": "txn_001",
    "date": "2026-03-03",
    "category": "shopping",
    "amount": 182.45,
    "type": "expense",
    "merchant": "Late Night Cart",
    "recurring": false
  },
  {
    "id": "txn_002",
    "date": "2026-03-05",
    "category": "income",
    "amount": 6200,
    "type": "income",
    "merchant": "Employer Payroll",
    "recurring": true
  }
]
```

### Field Usage

- `date`: Used to build trends and monthly averages.
- `category`: Feeds pie chart, spending variance, and insight generation.
- `amount`: Used in every score and projection calculation.
- `type`: Separates inflows from outflows.
- `merchant`: Supports human-readable insights.
- `recurring`: Helps determine stability and bank confidence.

## Derived Metrics

```json
{
  "monthlySavingsActual": 310,
  "monthlySavingsGap": -890,
  "savingsRate": 0.05,
  "spendingVariance": 0.26,
  "largestOverspendCategory": "shopping",
  "discretionarySpendRatio": 0.31,
  "incomeStabilityScore": 0.82,
  "debtToIncomeRatio": 0.09,
  "emergencyFundScore": 0.23
}
```

### Field Usage

- `monthlySavingsActual`: Actual post-spending savings amount.
- `monthlySavingsGap`: Difference between stated goal and real behavior.
- `savingsRate`: Primary health indicator across all three features.
- `spendingVariance`: Main honesty signal between plan and behavior.
- `largestOverspendCategory`: Powers narrative insight statements.
- `discretionarySpendRatio`: Used in both honesty and risk scoring.
- `incomeStabilityScore`: Used in bank-style profile classification.
- `debtToIncomeRatio`: Key credit-style risk input.
- `emergencyFundScore`: Measures resilience under stress.

## Sample Mock Data

```json
{
  "profile": {
    "userId": "user_disciplined_saver",
    "persona": "Disciplined Saver",
    "age": 34,
    "occupation": "Product Manager",
    "monthlyIncome": 8400,
    "fixedExpenses": 3100,
    "startingNetWorth": 76000,
    "cashBufferMonths": 7.8,
    "monthlyDebtPayments": 240,
    "debtBalance": 4800,
    "savingsGoalMonthly": 2400,
    "savingsGoalAnnual": 28800,
    "targetRetirementAge": 58,
    "riskTolerance": "low",
    "goals": [
      "Max out retirement contributions",
      "Invest for financial independence"
    ],
    "plannedBudget": {
      "housing": 2200,
      "food": 700,
      "transport": 260,
      "shopping": 200,
      "entertainment": 180,
      "travel": 300,
      "savings": 2400
    }
  },
  "transactions": [
    {
      "id": "txn_ds_001",
      "date": "2026-03-01",
      "category": "income",
      "amount": 8400,
      "type": "income",
      "merchant": "Employer Payroll",
      "recurring": true
    },
    {
      "id": "txn_ds_002",
      "date": "2026-03-04",
      "category": "housing",
      "amount": 2200,
      "type": "expense",
      "merchant": "Rent",
      "recurring": true
    },
    {
      "id": "txn_ds_003",
      "date": "2026-03-20",
      "category": "savings",
      "amount": 2500,
      "type": "expense",
      "merchant": "Brokerage Auto Transfer",
      "recurring": true
    }
  ]
}
```
