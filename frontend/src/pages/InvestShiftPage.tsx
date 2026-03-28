import { NextStepCard } from "../components/NextStepCard";
import { PageTransition } from "../components/PageTransition";
import { InvestmentTrajectoryComparisonCard } from "../components/InvestmentTrajectoryComparisonCard";
import { useDemoScenario } from "../hooks/useDemoScenario";

export const InvestShiftPage = () => {
  const { selectedUser, analysis } = useDemoScenario();

  return (
    <PageTransition>
      <InvestmentTrajectoryComparisonCard
        selectedUser={selectedUser}
        analysis={analysis}
      />

      <NextStepCard
        eyebrow="Next Move"
        title="Bring the growth tradeoff back into the wider future trajectory."
        description="After exploring how savings and investing split over time, return to Future Simulation to connect that decision to the full long-term wealth story."
        to="/future-simulation"
        cta="Back To Future Simulation"
      />
    </PageTransition>
  );
};
