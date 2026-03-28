import type {
  AnalysisResponse,
  DecisionEngineResponse,
  InvestShiftMetaResponse,
  InvestShiftProjectionResponse,
  RiskResponse,
  ScenarioPreset,
  SimulationResponse,
  UserPayload
} from "../types/finance";
import type { OnboardingAnswers, SpendingDetailAnswers } from "../types/onboarding";

export interface IntakeQuestion {
  key: keyof OnboardingAnswers;
  prompt: string;
  type: "text" | "number" | "choice";
  placeholder?: string;
  min?: number;
  step?: number;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

export interface IntakeTurnResponse {
  status: "question" | "complete";
  answers: Partial<OnboardingAnswers>;
  question?: IntakeQuestion;
  progress: {
    current: number;
    total: number;
  };
  guidance?: string;
  assistantMessage?: string;
  pendingConfirmation?: {
    key: keyof OnboardingAnswers;
    value: string | number | boolean;
  };
  acceptedAnswer?: {
    key: keyof OnboardingAnswers;
    prompt: string;
    value: string | number | boolean;
    preview: string;
  };
}

export interface FinanceCoachMessage {
  role: "user" | "assistant";
  content: string;
}

export interface FinanceCoachContext {
  persona?: string;
  honestyScore?: number;
  riskScore?: number;
  monthlyIncome?: number;
  monthlySavingsGap?: number;
  topRecommendation?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const request = async <T,>(path: string, payload?: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: payload ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: payload ? JSON.stringify(payload) : undefined
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return response.json() as Promise<T>;
};

export const fetchDemoUsers = () => request<UserPayload[]>("/demo-users");
export const analyzeUser = (payload: UserPayload) => request<AnalysisResponse>("/analyze", payload);
export const simulateUser = (payload: UserPayload) => request<SimulationResponse>("/simulate", payload);
export const fetchRiskProfile = (payload: UserPayload) => request<RiskResponse>("/risk-profile", payload);
export const fetchDecisionEngine = (payload: UserPayload) =>
  request<DecisionEngineResponse>("/decision-engine", payload);
export const createIntakeProfile = (answers: OnboardingAnswers, spendingDetails?: SpendingDetailAnswers | null) =>
  request<UserPayload>("/intake", { answers, spendingDetails: spendingDetails ?? null });
export const fetchNextIntakeTurn = (answers?: Partial<OnboardingAnswers>) =>
  request<IntakeTurnResponse>("/intake/next", { answers: answers ?? {} });
export const interpretIntakeMessage = (
  answers: Partial<OnboardingAnswers>,
  message: string,
  pendingConfirmation?: IntakeTurnResponse["pendingConfirmation"] | null
) =>
  request<IntakeTurnResponse>("/intake/interpret", { answers, message, pendingConfirmation: pendingConfirmation ?? null });
export const fetchScenarioPresets = (payload?: UserPayload) =>
  request<ScenarioPreset[]>("/scenario/presets", payload ? { payload } : undefined);
export const applyScenarioPresetRequest = (payload: UserPayload, presetId: string | null) =>
  request<UserPayload>("/scenario/apply", { payload, presetId });
export const fetchInvestShiftMeta = () => request<InvestShiftMetaResponse>("/invest-shift/meta");
export const projectInvestShift = (payload: {
  selectedIndexId: string;
  currentSavings: number;
  monthlyContribution: number;
  investPercentage: number;
  horizonYears: number;
}) => request<InvestShiftProjectionResponse>("/invest-shift/project", payload);
export const askFinanceCoach = (payload: {
  messages: FinanceCoachMessage[];
  context?: FinanceCoachContext;
}) => request<{ reply: string }>("/chat", payload);
