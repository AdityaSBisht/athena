import { Link, useLocation } from "react-router-dom";
import { useDemoScenario } from "../hooks/useDemoScenario";

const steps = [
  { label: "Load Demo", to: "/" },
  { label: "Truth", to: "/truth-report" },
  { label: "Scenario", to: "/scenario-lab" },
  { label: "Decision", to: "/decision-engine" },
  { label: "Invest", to: "/invest-shift" },
  { label: "Trajectory", to: "/future-simulation" },
  { label: "Bank", to: "/bank-perspective" },
  { label: "Report", to: "/report-export" }
];

export const FlowStepper = () => {
  const location = useLocation();
  const { selectedUser } = useDemoScenario();
  const activeIndex = steps.findIndex((step) => step.to === location.pathname);

  return (
    <div className="glass-panel mb-8 rounded-[1.75rem] px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-signal-accent/70">Guided Demo Flow</p>
          <p className="mt-1 text-sm text-slate-300">
            {selectedUser ? `Loaded persona: ${selectedUser.profile.persona}` : "Start by loading a sample persona."}
          </p>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 md:block">
          Truth {"->"} Scenario {"->"} Decision {"->"} Invest {"->"} Trajectory {"->"} Bank {"->"} Report
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-8">
        {steps.map((step, index) => {
          const unlocked = index === 0 || Boolean(selectedUser);
          const active = index === activeIndex;
          const complete = activeIndex > index;

          return (
            <Link
              key={step.to}
              to={unlocked ? step.to : "/"}
              className={`rounded-2xl border px-4 py-3 text-sm transition ${
                active
                  ? "border-signal-good/50 bg-signal-good/15 text-white"
                  : complete
                    ? "border-signal-accent/20 bg-white/5 text-signal-accent"
                    : "border-white/10 bg-black/20 text-slate-300 hover:bg-white/10"
              }`}
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{`0${index + 1}`}</p>
              <p className="mt-1 font-medium">{step.label}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
