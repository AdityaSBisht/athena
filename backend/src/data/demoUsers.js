export const demoUsers = [
  {
    profile: {
      userId: "user_impulsive_spender",
      persona: "Impulsive Spender",
      age: 29,
      occupation: "Brand Strategist",
      monthlyIncome: 6200,
      fixedExpenses: 2450,
      startingNetWorth: 18000,
      cashBufferMonths: 1.4,
      monthlyDebtPayments: 540,
      debtBalance: 9200,
      savingsGoalMonthly: 1200,
      savingsGoalAnnual: 14400,
      targetRetirementAge: 60,
      riskTolerance: "medium",
      goals: [
        "Build a 6-month emergency fund",
        "Save for a home down payment"
      ],
      plannedBudget: {
        housing: 1700,
        food: 650,
        transport: 320,
        shopping: 350,
        entertainment: 220,
        travel: 150,
        savings: 1200
      }
    },
    transactions: [
      { id: "txn_is_001", date: "2026-03-01", category: "income", amount: 6200, type: "income", merchant: "Employer Payroll", recurring: true },
      { id: "txn_is_002", date: "2026-03-02", category: "housing", amount: 1700, type: "expense", merchant: "Rent", recurring: true },
      { id: "txn_is_003", date: "2026-03-04", category: "food", amount: 720, type: "expense", merchant: "Grocer + Delivery", recurring: false },
      { id: "txn_is_004", date: "2026-03-07", category: "shopping", amount: 510, type: "expense", merchant: "Flash Sale Apparel", recurring: false },
      { id: "txn_is_005", date: "2026-03-11", category: "entertainment", amount: 340, type: "expense", merchant: "Concert + Drinks", recurring: false },
      { id: "txn_is_006", date: "2026-03-15", category: "transport", amount: 410, type: "expense", merchant: "Rideshare + Parking", recurring: false },
      { id: "txn_is_007", date: "2026-03-18", category: "travel", amount: 460, type: "expense", merchant: "Weekend Flight", recurring: false },
      { id: "txn_is_008", date: "2026-03-20", category: "debt", amount: 540, type: "expense", merchant: "Credit Card Payment", recurring: true },
      { id: "txn_is_009", date: "2026-03-23", category: "shopping", amount: 280, type: "expense", merchant: "Late Night Cart", recurring: false },
      { id: "txn_is_010", date: "2026-03-26", category: "savings", amount: 310, type: "expense", merchant: "Emergency Fund Transfer", recurring: true }
    ]
  },
  {
    profile: {
      userId: "user_disciplined_saver",
      persona: "Disciplined Saver",
      age: 34,
      occupation: "Product Manager",
      monthlyIncome: 8400,
      fixedExpenses: 3100,
      startingNetWorth: 76000,
      cashBufferMonths: 7.8,
      monthlyDebtPayments: 240,
      debtBalance: 4800,
      savingsGoalMonthly: 2400,
      savingsGoalAnnual: 28800,
      targetRetirementAge: 58,
      riskTolerance: "low",
      goals: [
        "Max out retirement contributions",
        "Invest for financial independence"
      ],
      plannedBudget: {
        housing: 2200,
        food: 700,
        transport: 260,
        shopping: 200,
        entertainment: 180,
        travel: 300,
        savings: 2400
      }
    },
    transactions: [
      { id: "txn_ds_001", date: "2026-03-01", category: "income", amount: 8400, type: "income", merchant: "Employer Payroll", recurring: true },
      { id: "txn_ds_002", date: "2026-03-03", category: "housing", amount: 2200, type: "expense", merchant: "Rent", recurring: true },
      { id: "txn_ds_003", date: "2026-03-05", category: "food", amount: 640, type: "expense", merchant: "Groceries", recurring: false },
      { id: "txn_ds_004", date: "2026-03-08", category: "transport", amount: 230, type: "expense", merchant: "Transit Pass", recurring: true },
      { id: "txn_ds_005", date: "2026-03-10", category: "shopping", amount: 160, type: "expense", merchant: "Home Supplies", recurring: false },
      { id: "txn_ds_006", date: "2026-03-14", category: "entertainment", amount: 140, type: "expense", merchant: "Dinner Out", recurring: false },
      { id: "txn_ds_007", date: "2026-03-17", category: "travel", amount: 240, type: "expense", merchant: "Weekend Train", recurring: false },
      { id: "txn_ds_008", date: "2026-03-20", category: "debt", amount: 240, type: "expense", merchant: "Student Loan", recurring: true },
      { id: "txn_ds_009", date: "2026-03-22", category: "savings", amount: 2500, type: "expense", merchant: "Brokerage Auto Transfer", recurring: true }
    ]
  },
  {
    profile: {
      userId: "user_side_hustler",
      persona: "Side Hustler",
      age: 31,
      occupation: "Software Engineer",
      monthlyIncome: 7100,
      fixedExpenses: 2800,
      startingNetWorth: 42000,
      cashBufferMonths: 3.6,
      monthlyDebtPayments: 320,
      debtBalance: 11800,
      savingsGoalMonthly: 1800,
      savingsGoalAnnual: 21600,
      targetRetirementAge: 57,
      riskTolerance: "high",
      goals: [
        "Pay off debt aggressively",
        "Build an angel investing runway"
      ],
      plannedBudget: {
        housing: 1900,
        food: 620,
        transport: 240,
        shopping: 260,
        entertainment: 200,
        travel: 220,
        savings: 1800
      }
    },
    transactions: [
      { id: "txn_sh_001", date: "2026-03-01", category: "income", amount: 5900, type: "income", merchant: "Employer Payroll", recurring: true },
      { id: "txn_sh_002", date: "2026-03-10", category: "income", amount: 1200, type: "income", merchant: "Freelance Client", recurring: false },
      { id: "txn_sh_003", date: "2026-03-03", category: "housing", amount: 1900, type: "expense", merchant: "Rent", recurring: true },
      { id: "txn_sh_004", date: "2026-03-06", category: "food", amount: 700, type: "expense", merchant: "Groceries + Lunches", recurring: false },
      { id: "txn_sh_005", date: "2026-03-12", category: "shopping", amount: 330, type: "expense", merchant: "Gear Upgrade", recurring: false },
      { id: "txn_sh_006", date: "2026-03-16", category: "entertainment", amount: 250, type: "expense", merchant: "Events", recurring: false },
      { id: "txn_sh_007", date: "2026-03-18", category: "transport", amount: 260, type: "expense", merchant: "Gas + Parking", recurring: false },
      { id: "txn_sh_008", date: "2026-03-22", category: "debt", amount: 320, type: "expense", merchant: "Card Payment", recurring: true },
      { id: "txn_sh_009", date: "2026-03-25", category: "savings", amount: 1520, type: "expense", merchant: "Brokerage Transfer", recurring: true },
      { id: "txn_sh_010", date: "2026-03-27", category: "travel", amount: 180, type: "expense", merchant: "Conference Train", recurring: false }
    ]
  }
];
