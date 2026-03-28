import { InsightCard } from "../components/InsightCard";
import { NextStepCard } from "../components/NextStepCard";
import { PageTransition } from "../components/PageTransition";
import { RiskMeter } from "../components/RiskMeter";
import { TrustPanel } from "../components/TrustPanel";
import { useDemoScenario } from "../hooks/useDemoScenario";

export const BankPerspectivePage = () => {
  const { riskProfile, decisionEngine } = useDemoScenario();

  if (!riskProfile || !decisionEngine) {
    return null;
  }

  return (
    <PageTransition>
      <section className="grid gap-6 lg:grid-cols-[0.8fr,1.2fr]">
        <RiskMeter value={riskProfile.riskScore} label={riskProfile.classification} />

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Bank Perspective</p>
          <h2 className="mt-3 text-4xl font-semibold text-white">{riskProfile.classification}</h2>
          <p className="mt-3 text-slate-300">
            A simple underwriter-style view based on liquidity, debt pressure, savings discipline, and income
            stability.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {riskProfile.flags.map((flag) => (
              <div key={flag.label} className="rounded-3xl bg-black/20 p-5">
                <p className="text-sm text-slate-400">{flag.label}</p>
                <p
                  className={`mt-2 text-2xl font-semibold ${
                    flag.status === "good" ? "text-signal-good" : "text-signal-bad"
                  }`}
                >
                  {flag.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 p-5">
              <p className="text-sm text-slate-400">Income stability</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {Math.round(riskProfile.profileSummary.incomeStabilityScore * 100)}%
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 p-5">
              <p className="text-sm text-slate-400">Savings rate</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {Math.round(riskProfile.profileSummary.savingsRate * 100)}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {riskProfile.insights.map((statement, index) => (
          <InsightCard
            key={statement}
            text={statement}
            tone={riskProfile.riskScore < 45 && index === 0 ? "good" : "risky"}
          />
        ))}
      </section>

      <section className="mt-8">
        <TrustPanel
          title="What makes this bank view trustworthy"
          summary="This screen is intentionally explicit about what is a rule-based underwriting signal, what is an estimated proxy, and what is not bank-verified. The goal is clarity, not false authority."
          items={[
            {
              label: "Policy Logic",
              detail: "Risk score combines debt pressure, discretionary behavior, emergency reserves, and income stability through backend rules.",
              tone: "policy"
            },
            {
              label: "Observed Metrics",
              detail: `Flags like ${riskProfile.flags.map((flag) => flag.label).join(", ")} come from the current payload and derived metrics, not vague sentiment.`,
              tone: "provided"
            },
            {
              label: "Estimated Credit",
              detail: "The credit layer is a transparent proxy model inspired by common factor categories and is labeled as not bank-verified.",
              tone: "estimated"
            },
            {
              label: "Explainability",
              detail: "Approval odds are accompanied by weighted factor scores so the user can see why the outcome moved.",
              tone: "policy"
            }
          ]}
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Estimated Credit Layer</p>
          <h3 className="mt-3 text-4xl font-semibold text-white">{decisionEngine.creditScore.estimatedScore}</h3>
          <p className="mt-2 text-signal-accent">{decisionEngine.creditScore.band}</p>
          <p className="mt-4 text-sm leading-6 text-slate-300">{decisionEngine.creditScore.explanation}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {Object.entries(decisionEngine.creditScore.factors).map(([key, value]) => (
              <div key={key} className="rounded-2xl bg-black/20 p-4">
                <p className="text-sm capitalize text-slate-400">{key.replace(/([A-Z])/g, " $1")}</p>
                <p className="mt-1 text-xl font-semibold text-white">{value}/100</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.25em] text-slate-500">Not bank verified</p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Underwriter Explainability Layer</p>
          <div className="mt-4 flex items-center justify-between">
            <h3 className="text-3xl font-semibold text-white">Approval odds</h3>
            <div className="rounded-full bg-signal-good/10 px-4 py-2 text-signal-accent">
              {decisionEngine.explainability.approvalOdds}
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {decisionEngine.explainability.factors.map((factor) => (
              <div key={factor.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white">{factor.label}</p>
                    <p className="mt-1 text-sm text-slate-400">{factor.impact}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Weight {factor.weight}%</p>
                    <p className="mt-1 text-lg font-semibold text-white">{factor.score}/100</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NextStepCard
        eyebrow="Final Step"
        title="Wrap the story into one clean, pitch-ready report."
        description="Export Report is the final screen for judges: persona, truth score, bank view, and 10-year outcome in one place."
        to="/report-export"
        cta="Open Export Report"
      />
    </PageTransition>
  );
};
