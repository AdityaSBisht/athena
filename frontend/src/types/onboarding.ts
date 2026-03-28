export interface OnboardingAnswers {
  age: number;
  occupation: string;
  incomeType: "salary" | "freelance" | "mixed";
  monthlyIncome: number;
  currentSavings: number;
  monthlySavingsGoal: number;
  hasDebt: boolean;
  debtType: "credit-card" | "student-loan" | "auto-loan" | "mortgage" | "multiple" | "none";
  monthlyDebtPayments: number;
  debtBalance: number;
  cashBufferMonths: number;
  riskTolerance: "low" | "medium" | "high";
  primaryGoal: string;
}

export interface SpendingDetailAnswers {
  housing: number;
  food: number;
  shopping: number;
  entertainment: number;
  travel: number;
  transport: number;
}
