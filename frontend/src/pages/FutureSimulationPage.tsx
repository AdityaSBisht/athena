import { NextStepCard } from "../components/NextStepCard";
import { PageTransition } from "../components/PageTransition";
import { NetWorthLineChart } from "../components/charts/NetWorthLineChart";
import { useDemoScenario } from "../hooks/useDemoScenario";

export const FutureSimulationPage = () => {
  const { simulation } = useDemoScenario();

  if (!simulation) {
    return null;
  }

  return (
    <PageTransition>
      <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <NetWorthLineChart data={simulation.projection} />

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Projection Snapshot</p>
          <h2 className="mt-3 text-4xl font-semibold text-white">Your future trajectory</h2>
          <p className="mt-3 text-slate-300">
            Simple deterministic compounding based on your actual savings behavior, debt drag, and a reasonable growth
            assumption.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">1 year</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                ${Math.round(simulation.snapshots.oneYear).toLocaleString()}
              </p>
            </div>
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">5 years</p>
              <p className="mt-2 text-3xl font-semibold text-signal-good">
                ${Math.round(simulation.snapshots.fiveYear).toLocaleString()}
              </p>
            </div>
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">10 years</p>
              <p className="mt-2 text-3xl font-semibold text-signal-accent">
                ${Math.round(simulation.snapshots.tenYear).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Annual contribution</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            ${Math.round(simulation.assumptions.annualContribution).toLocaleString()}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Debt drag</p>
          <p className="mt-2 text-2xl font-semibold text-signal-bad">
            ${Math.round(simulation.assumptions.annualDebtDrag).toLocaleString()}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-slate-400">Growth assumption</p>
          <p className="mt-2 text-2xl font-semibold text-signal-good">
            {Math.round(simulation.assumptions.growthRate * 100)}%
          </p>
        </div>
      </section>

      <NextStepCard
        eyebrow="Next Move"
        title="Translate the trajectory into lender language."
        description="Bank Perspective reframes the same future path into risk score, stability, and approval-style signals."
        to="/bank-perspective"
        cta="See Bank Perspective"
      />
    </PageTransition>
  );
};
