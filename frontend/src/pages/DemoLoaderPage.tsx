import { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingChat } from "../components/OnboardingChat";
import { PersonaCard } from "../components/PersonaCard";
import { PageTransition } from "../components/PageTransition";
import { TrustPanel } from "../components/TrustPanel";
import { useDemoScenario } from "../hooks/useDemoScenario";
import { fetchDemoUsers } from "../lib/api";
import { demoUsers } from "../lib/demoUsers";
import type { UserPayload } from "../types/finance";

export const DemoLoaderPage = () => {
  const navigate = useNavigate();
  const { activateScenario } = useDemoScenario();
  const [personas, setPersonas] = useState<UserPayload[]>(demoUsers);
  const [showDemoMode, setShowDemoMode] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!showDemoMode) {
      return;
    }

    let mounted = true;

    const loadRemoteDemoUsers = async () => {
      try {
        const remoteUsers = await fetchDemoUsers();
        if (mounted && remoteUsers.length > 0) {
          setPersonas(remoteUsers);
        }
      } catch {
        // Local demo data keeps the experience working even if the backend is offline.
      }
    };

    loadRemoteDemoUsers();

    return () => {
      mounted = false;
    };
  }, [showDemoMode]);

  const loadPersona = async (persona: UserPayload) => {
    await activateScenario(persona);
    startTransition(() => navigate("/truth-report"));
  };

  const loadCustomScenario = async (payload: UserPayload) => {
    await activateScenario(payload);
    startTransition(() => navigate("/truth-report"));
  };

  return (
    <PageTransition>
      <section className="grid gap-6 xl:grid-cols-[0.88fr,1.12fr]">
        <div className="rounded-[2rem] border border-[#1f1f1f] bg-[#161616] p-7 shadow-glow">
          <p className="text-sm uppercase tracking-[0.4em] text-[#d4af37]">Financial Lie Detector</p>
          <h2 className="mt-3 max-w-xl text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.04em] text-white">
            Reveal the gap between what people say about money and what their behavior proves.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
            Start with your own answers. The engine only calculates after intake, then turns your profile into a
            truth report, future wealth projection, and bank-style risk story.
          </p>

          <div className="mt-5 inline-flex rounded-full border border-[#2a2510] bg-[#1f1a00] px-4 py-2 text-sm text-[#d4af37]">
            Enter your own numbers first. Demo personas are optional and hidden unless you open them.
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-black/20 p-4">
              <p className="text-sm text-slate-400">Feature 1</p>
              <p className="mt-2 text-base font-medium text-white">Truth Report</p>
            </div>
            <div className="rounded-3xl bg-black/20 p-4">
              <p className="text-sm text-slate-400">Feature 2</p>
              <p className="mt-2 text-base font-medium text-white">Future Simulator</p>
            </div>
            <div className="rounded-3xl bg-black/20 p-4">
              <p className="text-sm text-slate-400">Feature 3</p>
              <p className="mt-2 text-base font-medium text-white">Bank Perspective</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDemoMode((current) => !current)}
            className="mt-6 rounded-full border border-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/10"
          >
            {showDemoMode ? "Hide demo personas" : "Open demo personas"}
          </button>
        </div>

        <OnboardingChat onComplete={loadCustomScenario} />
      </section>

      {showDemoMode ? (
        <section className="mt-10">
        <TrustPanel
          title="Why the results are meant to be trusted"
          summary="The app separates user-provided information from estimated behavior, keeps the actual scoring and recommendation math on the backend, and labels the assumptions that drive each output."
          items={[
            {
              label: "User Provided",
              detail: "Income, debt, savings goal, profession, and buffer inputs come directly from the user or selected demo persona.",
              tone: "provided"
            },
            {
              label: "Estimated",
              detail: "Guided-chat flows generate category-level transactions only as a simulation layer, and downstream pages now disclose that distinction.",
              tone: "estimated"
            },
            {
              label: "Policy Logic",
              detail: "Honesty, risk, recommendations, and stress outputs are computed by deterministic backend rules, not free-form model guesses.",
              tone: "policy"
            },
            {
              label: "Historical Inputs",
              detail: "Invest Shift uses hardcoded historical-return assumptions for display only and labels them clearly in the UI.",
              tone: "historical"
            }
          ]}
        />

        <section className="mt-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Demo Mode</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">Instant sample users</h3>
          </div>
          <p className="text-sm text-slate-400">One click loads data and all downstream analysis.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {personas.map((persona) => (
            <PersonaCard key={persona.profile.userId} persona={persona} onLoad={loadPersona} />
          ))}
        </div>
        </section>
      </section>
      ) : null}
    </PageTransition>
  );
};
