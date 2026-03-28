import { demoUsers } from "../lib/demoUsers";
import { useDemoScenario } from "../hooks/useDemoScenario";

export const ComparePersonaPanel = () => {
  const {
    selectedUser,
    analysis,
    riskProfile,
    simulation,
    compareUser,
    compareAnalysis,
    compareRiskProfile,
    compareSimulation,
    loadComparison
  } = useDemoScenario();

  const availableUsers = demoUsers.filter((user) => user.profile.userId !== selectedUser?.profile.userId);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Persona Compare</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Show judges the contrast</h3>
        </div>
        <select
          value={compareUser?.profile.userId ?? ""}
          onChange={(event) => {
            const nextUser = availableUsers.find((user) => user.profile.userId === event.target.value) ?? null;
            void loadComparison(nextUser);
          }}
          className="rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="">Select comparison persona</option>
          {availableUsers.map((user) => (
            <option key={user.profile.userId} value={user.profile.userId}>
              {user.profile.persona}
            </option>
          ))}
        </select>
      </div>

      {compareUser && compareAnalysis && compareRiskProfile && compareSimulation ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-black/20 p-5">
            <p className="text-sm text-slate-400">Current</p>
            <p className="mt-1 text-xl font-semibold text-white">{selectedUser?.profile.persona}</p>
            {analysis && riskProfile && simulation ? (
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-slate-400">Honesty</p>
                  <p className="mt-1 text-lg font-semibold text-white">{analysis.honestyScore}</p>
                </div>
                <div>
                  <p className="text-slate-400">Risk</p>
                  <p className="mt-1 text-lg font-semibold text-white">{riskProfile.riskScore}</p>
                </div>
                <div>
                  <p className="text-slate-400">10Y Net Worth</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    ${Math.round(simulation.snapshots.tenYear).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="rounded-3xl border border-signal-cyan/30 bg-signal-cyan/10 p-5">
            <p className="text-sm text-slate-300">Comparison Persona</p>
            <p className="mt-1 text-xl font-semibold text-white">{compareUser.profile.persona}</p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-slate-400">Honesty</p>
                <p className="mt-1 text-lg font-semibold text-white">{compareAnalysis.honestyScore}</p>
              </div>
              <div>
                <p className="text-slate-400">Risk</p>
                <p className="mt-1 text-lg font-semibold text-white">{compareRiskProfile.riskScore}</p>
              </div>
              <div>
                <p className="text-slate-400">10Y Net Worth</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  ${Math.round(compareSimulation.snapshots.tenYear).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-400">Pick another persona to show a side-by-side contrast in the demo.</p>
      )}
    </div>
  );
};
