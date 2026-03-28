import {
  createContext,
  useEffect,
  startTransition,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import {
  analyzeUser,
  applyScenarioPresetRequest,
  fetchDecisionEngine,
  fetchRiskProfile,
  simulateUser
} from "../lib/api";
import type {
  AnalysisResponse,
  DecisionEngineResponse,
  InvestShiftSettings,
  RiskResponse,
  ScenarioState,
  SimulationResponse,
  UserPayload
} from "../types/finance";

interface ScenarioContextValue extends ScenarioState {
  activateScenario: (payload: UserPayload) => Promise<void>;
  applyPreset: (presetId: string | null) => Promise<void>;
  loadComparison: (payload: UserPayload | null) => Promise<void>;
  setInvestShiftSettings: (settings: InvestShiftSettings | null) => void;
  resetScenario: () => void;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

const initialState: ScenarioState = {
  baselineUser: null,
  baselineAnalysis: null,
  baselineSimulation: null,
  baselineRiskProfile: null,
  selectedUser: null,
  analysis: null,
  simulation: null,
  riskProfile: null,
  decisionEngine: null,
  compareUser: null,
  compareAnalysis: null,
  compareSimulation: null,
  compareRiskProfile: null,
  activePresetId: null,
  investShiftSettings: null,
  isLoading: false
};

export const ScenarioProvider = ({ children }: PropsWithChildren) => {
  const [baselineUser, setBaselineUser] = useState<UserPayload | null>(initialState.baselineUser);
  const [baselineAnalysis, setBaselineAnalysis] = useState<AnalysisResponse | null>(initialState.baselineAnalysis);
  const [baselineSimulation, setBaselineSimulation] = useState<SimulationResponse | null>(initialState.baselineSimulation);
  const [baselineRiskProfile, setBaselineRiskProfile] = useState<RiskResponse | null>(initialState.baselineRiskProfile);
  const [selectedUser, setSelectedUser] = useState<UserPayload | null>(initialState.selectedUser);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(initialState.analysis);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(initialState.simulation);
  const [riskProfile, setRiskProfile] = useState<RiskResponse | null>(initialState.riskProfile);
  const [decisionEngine, setDecisionEngine] = useState<DecisionEngineResponse | null>(initialState.decisionEngine);
  const [compareUser, setCompareUser] = useState<UserPayload | null>(initialState.compareUser);
  const [compareAnalysis, setCompareAnalysis] = useState<AnalysisResponse | null>(initialState.compareAnalysis);
  const [compareSimulation, setCompareSimulation] = useState<SimulationResponse | null>(initialState.compareSimulation);
  const [compareRiskProfile, setCompareRiskProfile] = useState<RiskResponse | null>(initialState.compareRiskProfile);
  const [activePresetId, setActivePresetId] = useState<string | null>(initialState.activePresetId);
  const [investShiftSettings, setInvestShiftSettings] = useState<InvestShiftSettings | null>(initialState.investShiftSettings);
  const [isLoading, setIsLoading] = useState(initialState.isLoading);

  const runAnalysisSet = async (payload: UserPayload) => {
    const [analysisResponse, simulationResponse, riskResponse, decisionEngineResponse] = await Promise.all([
      analyzeUser(payload),
      simulateUser(payload),
      fetchRiskProfile(payload),
      fetchDecisionEngine(payload)
    ]);

    return { analysisResponse, simulationResponse, riskResponse, decisionEngineResponse };
  };

  const activateScenario = async (payload: UserPayload) => {
    setIsLoading(true);

    try {
      const { analysisResponse, simulationResponse, riskResponse, decisionEngineResponse } = await runAnalysisSet(payload);

      startTransition(() => {
        setBaselineUser(payload);
        setBaselineAnalysis(analysisResponse);
        setBaselineSimulation(simulationResponse);
        setBaselineRiskProfile(riskResponse);
        setSelectedUser(payload);
        setAnalysis(analysisResponse);
        setSimulation(simulationResponse);
        setRiskProfile(riskResponse);
        setDecisionEngine(decisionEngineResponse);
        setActivePresetId(null);
        setInvestShiftSettings(null);
        setCompareUser(null);
        setCompareAnalysis(null);
        setCompareSimulation(null);
        setCompareRiskProfile(null);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreset = async (presetId: string | null) => {
    if (!baselineUser) {
      return;
    }

    setIsLoading(true);

    try {
      const nextPayload = presetId ? await applyScenarioPresetRequest(baselineUser, presetId) : baselineUser;
      const { analysisResponse, simulationResponse, riskResponse, decisionEngineResponse } = await runAnalysisSet(nextPayload);

      startTransition(() => {
        setSelectedUser(nextPayload);
        setAnalysis(analysisResponse);
        setSimulation(simulationResponse);
        setRiskProfile(riskResponse);
        setDecisionEngine(decisionEngineResponse);
        setActivePresetId(presetId);
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparison = async (payload: UserPayload | null) => {
    if (!payload) {
      setCompareUser(null);
      setCompareAnalysis(null);
      setCompareSimulation(null);
      setCompareRiskProfile(null);
      return;
    }

    setIsLoading(true);

    try {
      const { analysisResponse, simulationResponse, riskResponse } = await runAnalysisSet(payload);

      startTransition(() => {
        setCompareUser(payload);
        setCompareAnalysis(analysisResponse);
        setCompareSimulation(simulationResponse);
        setCompareRiskProfile(riskResponse);
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.removeItem("financial-truth-engine-scenario");
  }, []);

  const resetScenario = () => {
    setBaselineUser(null);
    setBaselineAnalysis(null);
    setBaselineSimulation(null);
    setBaselineRiskProfile(null);
    setSelectedUser(null);
    setAnalysis(null);
    setSimulation(null);
    setRiskProfile(null);
    setDecisionEngine(null);
    setCompareUser(null);
    setCompareAnalysis(null);
    setCompareSimulation(null);
    setCompareRiskProfile(null);
    setActivePresetId(null);
    setInvestShiftSettings(null);
    setIsLoading(false);
  };

  const value = useMemo(
    () => ({
      baselineUser,
      baselineAnalysis,
      baselineSimulation,
      baselineRiskProfile,
      selectedUser,
      analysis,
      simulation,
      riskProfile,
      decisionEngine,
      compareUser,
      compareAnalysis,
      compareSimulation,
      compareRiskProfile,
      activePresetId,
      investShiftSettings,
      isLoading,
      activateScenario,
      applyPreset,
      loadComparison,
      setInvestShiftSettings,
      resetScenario
    }),
    [
      baselineUser,
      baselineAnalysis,
      baselineSimulation,
      baselineRiskProfile,
      selectedUser,
      analysis,
      simulation,
      riskProfile,
      decisionEngine,
      compareUser,
      compareAnalysis,
      compareSimulation,
      compareRiskProfile,
      activePresetId,
      investShiftSettings,
      isLoading
    ]
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
};

export const useDemoScenario = () => {
  const context = useContext(ScenarioContext);

  if (!context) {
    throw new Error("useDemoScenario must be used inside ScenarioProvider");
  }

  return context;
};
