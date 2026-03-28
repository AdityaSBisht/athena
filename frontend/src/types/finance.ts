export type PlannedBudget = Record<string, number>;

export interface FinancialProfile {
  userId: string;
  persona: string;
  age: number;
  occupation: string;
  monthlyIncome: number;
  fixedExpenses: number;
  startingNetWorth: number;
  cashBufferMonths: number;
  monthlyDebtPayments: number;
  debtBalance: number;
  savingsGoalMonthly: number;
  savingsGoalAnnual: number;
  targetRetirementAge: number;
  riskTolerance: "low" | "medium" | "high";
  goals: string[];
  plannedBudget: PlannedBudget;
  categoryEvidenceMode?: "provided" | "estimated";
}

export interface Transaction {
  id: string;
  date: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  merchant: string;
  recurring: boolean;
}

export interface UserPayload {
  profile: FinancialProfile;
  transactions: Transaction[];
}

export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
}

export interface InvestShiftSettings {
  selectedIndexId: string;
  selectedIndexName: string;
  selectedIndexReturn: number;
  currentSavings: number;
  monthlyContribution: number;
  investPercentage: number;
  horizonYears: number;
  savingsEndValue: number;
  investmentEndValue: number;
}

export interface MarketIndex {
  id: string;
  name: string;
  value: string;
  change: string;
  annualReturn: number;
}

export interface TopStock {
  ticker: string;
  price: string;
  change: string;
}

export interface InvestShiftProjectionPoint {
  year: number;
  savings: number;
  investment: number;
  savingsLabel?: string;
  investmentLabel?: string;
}

export interface InvestShiftMetaResponse {
  indexes: MarketIndex[];
  topStocks: TopStock[];
  defaultIndexId: string;
  savingsAnnualRate: number;
}

export interface InvestShiftProjectionResponse {
  selectedIndex: MarketIndex;
  chartData: InvestShiftProjectionPoint[];
  difference: number;
  takeaway: string;
  selectedIndexRiskNote: string;
  savingsAnnualRate: number;
}

export interface AnalysisResponse {
  honestyScore: number;
  behaviorInsights: {
    plannedSavings: number;
    actualSavings: number;
    spendingVariance: number;
    largestOverspendCategory: string;
    discretionarySpendRatio: number;
  };
  metrics: {
    monthlyIncomeObserved: number;
    monthlyExpensesObserved: number;
    monthlySavingsActual: number;
    monthlySavingsGap: number;
    savingsRate: number;
    spendingVariance: number;
    largestOverspendCategory: string;
    discretionarySpendRatio: number;
    incomeStabilityScore: number;
    debtToIncomeRatio: number;
    emergencyFundScore: number;
    categorySpend: Record<string, number>;
  };
  insights: string[];
}

export interface SimulationResponse {
  assumptions: {
    annualContribution: number;
    annualDebtDrag: number;
    growthRate: number;
  };
  projection: Array<{
    year: number;
    projectedNetWorth: number;
  }>;
  snapshots: {
    oneYear: number;
    fiveYear: number;
    tenYear: number;
  };
}

export interface RiskResponse {
  riskScore: number;
  classification: string;
  profileSummary: {
    cashBufferMonths: number;
    debtToIncomeRatio: number;
    savingsRate: number;
    incomeStabilityScore: number;
  };
  flags: Array<{
    label: string;
    status: "good" | "risky";
    value: string;
  }>;
  insights: string[];
}

export interface DecisionEngineResponse {
  recommendations: Array<{
    title: string;
    confidence: number;
    reason: string;
    projectedUpside: number;
    urgency: "high" | "medium" | "low";
    category: string;
  }>;
  habitDrift: Array<{
    month: string;
    savingsRate: number;
    spendingVariance: number;
    status: "improving" | "slipping";
  }>;
  stressTests: Array<{
    id: string;
    label: string;
    impact: number;
    recoveryMonths: number;
    survivalScore: number;
  }>;
  goalOptimizer: {
    selectedGoal: string;
    targetAmount: number;
    monthsToGoal: number;
    recommendation: string;
  };
  explainability: {
    approvalOdds: string;
    factors: Array<{
      label: string;
      weight: number;
      score: number;
      impact: string;
    }>;
  };
  creditScore: {
    estimatedScore: number;
    band: string;
    notBankVerified: boolean;
    factors: {
      paymentHistory: number;
      amountsOwed: number;
      lengthOfHistory: number;
      creditMix: number;
      newCredit: number;
    };
    explanation: string;
  };
}

export interface ScenarioState {
  baselineUser: UserPayload | null;
  baselineAnalysis: AnalysisResponse | null;
  baselineSimulation: SimulationResponse | null;
  baselineRiskProfile: RiskResponse | null;
  selectedUser: UserPayload | null;
  analysis: AnalysisResponse | null;
  simulation: SimulationResponse | null;
  riskProfile: RiskResponse | null;
  compareUser: UserPayload | null;
  compareAnalysis: AnalysisResponse | null;
  compareSimulation: SimulationResponse | null;
  compareRiskProfile: RiskResponse | null;
  activePresetId: string | null;
  investShiftSettings: InvestShiftSettings | null;
  decisionEngine: DecisionEngineResponse | null;
  isLoading: boolean;
}
