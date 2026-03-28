import { useEffect, useState } from "react";
import { ComparePersonaPanel } from "../components/ComparePersonaPanel";
import { MetricDeltaCard } from "../components/MetricDeltaCard";
import { NextStepCard } from "../components/NextStepCard";
import { PageTransition } from "../components/PageTransition";
import { ScenarioPresetCard } from "../components/ScenarioPresetCard";
import { useDemoScenario } from "../hooks/useDemoScenario";
import { fetchScenarioPresets } from "../lib/api";
import type { ScenarioPreset } from "../types/finance";

export const ScenarioLabPage = () => {
  const [scenarioPresets, setScenarioPresets] = useState<ScenarioPreset[]>([]);
  const {
    baselineUser,
    baselineAnalysis,
    baselineSimulation,
    baselineRiskProfile,
    analysis,
    simulation,
    riskProfile,
    activePresetId,
    applyPreset
  } = useDemoScenario();

  useEffect(() => {
    const loadPresets = async () => {
      if (!baselineUser) {
        return;
      }

      const presets = await fetchScenarioPresets(baselineUser);
      setScenarioPresets(presets);
    };

    void loadPresets();
  }, [baselineUser]);

  if (
    !baselineUser ||
    !baselineAnalysis ||
    !baselineSimulation ||
    !baselineRiskProfile ||
    !analysis ||
    !simulation ||
    !riskProfile
  ) {
    return null;
  }

  return (
    <PageTransition>
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Scenario Lab</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-semibold text-white">What changes move the needle?</h2>
            <p className="mt-3 max-w-3xl text-slate-300">
              Apply one-click life events and show the before-and-after financial impact instantly. This is where the
              user can actually see the trajectory shift.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void applyPreset(null)}
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/10"
          >
            Reset to baseline
          </button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {scenarioPresets.map((preset) => (
            <ScenarioPresetCard
              key={preset.id}
              preset={preset}
              active={activePresetId === preset.id}
              onSelect={(presetId) => void applyPreset(presetId)}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricDeltaCard
          label="Monthly income"
          baseline={baselineAnalysis.metrics.monthlyIncomeObserved}
          current={analysis.metrics.monthlyIncomeObserved}
          money
        />
        <MetricDeltaCard
          label="Monthly savings"
          baseline={baselineAnalysis.metrics.monthlySavingsActual}
          current={analysis.metrics.monthlySavingsActual}
          money
        />
        <MetricDeltaCard
          label="Honesty score"
          baseline={baselineAnalysis.honestyScore}
          current={analysis.honestyScore}
          suffix=""
        />
        <MetricDeltaCard
          label="Risk score"
          baseline={baselineRiskProfile.riskScore}
          current={riskProfile.riskScore}
          inverseGood
        />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Projected 1 year</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            ${Math.round(simulation.snapshots.oneYear).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Baseline: ${Math.round(baselineSimulation.snapshots.oneYear).toLocaleString()}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Projected 5 years</p>
          <p className="mt-2 text-3xl font-semibold text-signal-good">
            ${Math.round(simulation.snapshots.fiveYear).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Baseline: ${Math.round(baselineSimulation.snapshots.fiveYear).toLocaleString()}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Projected 10 years</p>
          <p className="mt-2 text-3xl font-semibold text-signal-accent">
            ${Math.round(simulation.snapshots.tenYear).toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Baseline: ${Math.round(baselineSimulation.snapshots.tenYear).toLocaleString()}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <ComparePersonaPanel />
      </section>

      <NextStepCard
        eyebrow="Next Move"
        title="Now let the engine rank the smartest next financial moves."
        description="Open Decision Engine for prioritized recommendations, habit drift, stress tests, goal optimization, and the next best move for this user."
        to="/decision-engine"
        cta="Open Decision Engine"
      />
    </PageTransition>
  );
};
