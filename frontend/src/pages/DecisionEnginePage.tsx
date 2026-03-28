import { DecisionEnginePanel } from "../components/DecisionEnginePanel";
import { NextStepCard } from "../components/NextStepCard";
import { PageTransition } from "../components/PageTransition";
import { useDemoScenario } from "../hooks/useDemoScenario";

export const DecisionEnginePage = () => {
  const { decisionEngine } = useDemoScenario();

  if (!decisionEngine) {
    return null;
  }

  return (
    <PageTransition>
      <DecisionEnginePanel data={decisionEngine} />

      <NextStepCard
        eyebrow="Next Move"
        title="Now connect those ranked moves to the market and the balance sheet."
        description="Use Invest Shift to compare allocation choices, then move into Bank Perspective to see how the same profile would be judged by an underwriter."
        to="/invest-shift"
        cta="Open Invest Shift"
      />
    </PageTransition>
  );
};
