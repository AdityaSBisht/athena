import { useMemo } from "react";
import { PageTransition } from "../components/PageTransition";
import { useDemoScenario } from "../hooks/useDemoScenario";

export const ReportExportPage = () => {
  const { selectedUser, analysis, simulation, riskProfile, investShiftSettings } = useDemoScenario();

  const headline = useMemo(() => {
    if (!selectedUser || !analysis || !riskProfile) {
      return "";
    }

    if (analysis.honestyScore >= 75 && riskProfile.riskScore < 45) {
      return "A financially disciplined profile with strong plan-to-behavior alignment.";
    }

    if (analysis.honestyScore < 55) {
      return "A high-drama financial profile where behavior is outrunning the plan.";
    }

    return "A mixed profile with visible upside if current habits are tightened.";
  }, [selectedUser, analysis, riskProfile]);

  if (!selectedUser || !analysis || !simulation || !riskProfile) {
    return null;
  }

  return (
    <PageTransition>
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 print:border-none print:bg-white print:text-black">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 print:text-slate-600">Exportable Report</p>
            <h2 className="mt-2 text-4xl font-semibold text-white print:text-black">Financial Truth Report</h2>
            <p className="mt-3 max-w-3xl text-slate-300 print:text-slate-700">{headline}</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-full bg-white px-5 py-3 text-sm font-medium text-ink-950 transition hover:bg-signal-cyan print:hidden"
          >
            Export / Print
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl bg-black/20 p-5 print:bg-slate-100">
            <p className="text-sm text-slate-400 print:text-slate-600">Persona</p>
            <p className="mt-2 text-xl font-semibold text-white print:text-black">{selectedUser.profile.persona}</p>
          </div>
          <div className="rounded-3xl bg-black/20 p-5 print:bg-slate-100">
            <p className="text-sm text-slate-400 print:text-slate-600">Honesty score</p>
            <p className="mt-2 text-xl font-semibold text-white print:text-black">{analysis.honestyScore}</p>
          </div>
          <div className="rounded-3xl bg-black/20 p-5 print:bg-slate-100">
            <p className="text-sm text-slate-400 print:text-slate-600">Risk score</p>
            <p className="mt-2 text-xl font-semibold text-white print:text-black">{riskProfile.riskScore}</p>
          </div>
          <div className="rounded-3xl bg-black/20 p-5 print:bg-slate-100">
            <p className="text-sm text-slate-400 print:text-slate-600">10-year net worth</p>
            <p className="mt-2 text-xl font-semibold text-white print:text-black">
              ${Math.round(simulation.snapshots.tenYear).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 p-6 print:border-slate-200">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 print:text-slate-600">Core Findings</p>
            <ul className="mt-4 space-y-3 text-slate-200 print:text-slate-800">
              {analysis.insights.slice(0, 3).map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 p-6 print:border-slate-200">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 print:text-slate-600">Bank View</p>
            <ul className="mt-4 space-y-3 text-slate-200 print:text-slate-800">
              {riskProfile.flags.map((flag) => (
                <li key={flag.label}>
                  {flag.label}: {flag.value} ({flag.status})
                </li>
              ))}
            </ul>
          </div>
        </div>

        {investShiftSettings ? (
          <div className="mt-8 rounded-3xl border border-white/10 p-6 print:border-slate-200">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400 print:text-slate-600">Invest Shift Summary</p>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-slate-400 print:text-slate-600">Selected index</p>
                <p className="mt-1 text-lg font-semibold text-white print:text-black">
                  {investShiftSettings.selectedIndexName}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 print:text-slate-600">Return assumption</p>
                <p className="mt-1 text-lg font-semibold text-white print:text-black">
                  {investShiftSettings.selectedIndexReturn}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 print:text-slate-600">Invest allocation</p>
                <p className="mt-1 text-lg font-semibold text-white print:text-black">
                  {investShiftSettings.investPercentage}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 print:text-slate-600">Horizon</p>
                <p className="mt-1 text-lg font-semibold text-white print:text-black">
                  {investShiftSettings.horizonYears} years
                </p>
              </div>
            </div>

            <p className="mt-5 text-slate-200 print:text-slate-800">
              Using a {investShiftSettings.selectedIndexName}-style long-term return, a{" "}
              {investShiftSettings.investPercentage}% investment allocation projects{" "}
              ${Math.round(investShiftSettings.investmentEndValue).toLocaleString()} by year{" "}
              {investShiftSettings.horizonYears}, versus ${Math.round(investShiftSettings.savingsEndValue).toLocaleString()} in the savings path.
            </p>
          </div>
        ) : null}
      </section>
    </PageTransition>
  );
};
