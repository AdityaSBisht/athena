import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { InsightFlow } from "../components/InsightFlow";
import { NextStepCard } from "../components/NextStepCard";
import { PageTransition } from "../components/PageTransition";
import { TrustPanel } from "../components/TrustPanel";
import { SpendingPieChart } from "../components/charts/SpendingPieChart";
import { useDemoScenario } from "../hooks/useDemoScenario";
import { demoUsers } from "../lib/demoUsers";

const formatMoney = (value: number) => `$${Math.round(value).toLocaleString()}`;
const categoryLabels: Record<string, string> = {
  housing: "Housing and bills",
  food: "Food",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  travel: "Travel",
  debt: "Debt payment",
  savings: "Saved"
};

const getBehaviorGrade = (score: number) => {
  if (score >= 90) {
    return "A";
  }

  if (score >= 80) {
    return "B";
  }

  if (score >= 70) {
    return "C";
  }

  if (score >= 55) {
    return "D";
  }

  return "F";
};

const buildGapCostCurve = (monthlyGap: number) => {
  const monthlyShortfall = Math.max(-monthlyGap, 0);
  const monthlyRate = 0.08 / 12;

  return Array.from({ length: 10 }, (_, index) => {
    const months = (index + 1) * 12;
    const futureValue =
      monthlyShortfall === 0
        ? 0
        : monthlyShortfall * (((1 + monthlyRate) ** months - 1) / monthlyRate);

    return {
      year: `Y${index + 1}`,
      cost: Math.round(futureValue)
    };
  });
};

const buildPeerComparison = (monthlyIncome: number, savingsRate: number) => {
  const peerRates = demoUsers
    .filter((peer) => {
      const delta = Math.abs(peer.profile.monthlyIncome - monthlyIncome);
      return delta <= monthlyIncome * 0.25;
    })
    .map((peer) => {
      const savingsTxn = peer.transactions.find((transaction) => transaction.category === "savings");
      return ((savingsTxn?.amount || 0) / Math.max(peer.profile.monthlyIncome, 1)) * 100;
    });

  const comparisonRates = peerRates.length > 0
    ? peerRates
    : demoUsers.map((peer) => {
        const savingsTxn = peer.transactions.find((transaction) => transaction.category === "savings");
        return ((savingsTxn?.amount || 0) / Math.max(peer.profile.monthlyIncome, 1)) * 100;
      });

  const peerAverageRate = comparisonRates.reduce((sum, rate) => sum + rate, 0) / Math.max(comparisonRates.length, 1);
  const userRate = savingsRate * 100;
  const delta = peerAverageRate - userRate;

  return {
    peerAverageRate,
    userRate,
    delta
  };
};

const getOneFix = (
  monthlyGap: number,
  projectedUpside: number | undefined,
  recommendationTitle: string | undefined
) => {
  const redirectAmount = Math.max(200, Math.round(Math.max(-monthlyGap, 0) * 0.25 / 50) * 50 || 200);

  return {
    title: "One fix. No excuses.",
    action: recommendationTitle || `Redirect ${formatMoney(redirectAmount)}/month into investing before lifestyle creep eats it.`,
    impact: projectedUpside || Math.round(redirectAmount * 12 * 10 * 1.2)
  };
};

export const TruthReportPage = () => {
  const { analysis, selectedUser, decisionEngine } = useDemoScenario();

  if (!analysis || !selectedUser) {
    return null;
  }

  const isPositive = analysis.honestyScore >= 70;
  const hasObservedCategoryEvidence = selectedUser.profile.categoryEvidenceMode !== "estimated";
  const isEstimatedProfile = selectedUser.profile.categoryEvidenceMode === "estimated";
  const behaviorGrade = getBehaviorGrade(analysis.honestyScore);
  const plannedSavings = analysis.behaviorInsights.plannedSavings;
  const actualSavings = Math.round(analysis.behaviorInsights.actualSavings);
  const splitBarMax = Math.max(plannedSavings, actualSavings, 1);
  const gapCurve = buildGapCostCurve(analysis.metrics.monthlySavingsGap);
  const finalGapCost = gapCurve[gapCurve.length - 1]?.cost || 0;
  const runwayMonths = selectedUser.profile.cashBufferMonths;
  const runwayMax = 6;
  const runwayFill = Math.min((runwayMonths / runwayMax) * 100, 100);
  const peerComparison = buildPeerComparison(selectedUser.profile.monthlyIncome, analysis.metrics.savingsRate);
  const peerDeltaText =
    peerComparison.delta > 0
      ? `People around your income save about ${Math.abs(peerComparison.delta).toFixed(1)} percentage points more than you.`
      : `You’re saving about ${Math.abs(peerComparison.delta).toFixed(1)} percentage points more than peers around your income.`;
  const topRecommendation = decisionEngine?.recommendations[0];
  const oneFix = getOneFix(analysis.metrics.monthlySavingsGap, topRecommendation?.projectedUpside, topRecommendation?.title);
  const monthlyLeftAfterEverything = analysis.metrics.monthlyIncomeObserved - analysis.metrics.monthlyExpensesObserved;
  const estimatedFlexibleSpend = Math.max(
    analysis.metrics.monthlyExpensesObserved -
      analysis.metrics.monthlySavingsActual -
      selectedUser.profile.fixedExpenses -
      selectedUser.profile.monthlyDebtPayments,
    0
  );
  const breakdownRows = hasObservedCategoryEvidence
    ? [
        {
          label: "Income",
          value: analysis.metrics.monthlyIncomeObserved,
          tone: "positive" as const
        },
        ...Object.entries(analysis.metrics.categorySpend)
          .filter(([, amount]) => amount > 0)
          .sort(([leftKey], [rightKey]) => {
            const order = ["housing", "food", "transport", "shopping", "entertainment", "travel", "debt", "savings"];
            return order.indexOf(leftKey) - order.indexOf(rightKey);
          })
          .map(([key, value]) => ({
            label: categoryLabels[key] || key,
            value,
            tone: key === "savings" ? ("accent" as const) : ("negative" as const)
          })),
        {
          label: monthlyLeftAfterEverything >= 0 ? "Left at month end" : "Short at month end",
          value: Math.abs(monthlyLeftAfterEverything),
          tone: monthlyLeftAfterEverything >= 0 ? ("positive" as const) : ("negative" as const)
        }
      ]
    : [
        {
          label: "Income",
          value: analysis.metrics.monthlyIncomeObserved,
          tone: "positive" as const
        },
        {
          label: "Fixed bills you entered",
          value: selectedUser.profile.fixedExpenses,
          tone: "negative" as const
        },
        {
          label: "Debt payment you entered",
          value: selectedUser.profile.monthlyDebtPayments,
          tone: "negative" as const
        },
        {
          label: "Flexible spending (estimated)",
          value: estimatedFlexibleSpend,
          tone: "negative" as const
        },
        {
          label: "Saved",
          value: analysis.metrics.monthlySavingsActual,
          tone: "accent" as const
        },
        {
          label: monthlyLeftAfterEverything >= 0 ? "Left at month end" : "Short at month end",
          value: Math.abs(monthlyLeftAfterEverything),
          tone: monthlyLeftAfterEverything >= 0 ? ("positive" as const) : ("negative" as const)
        }
      ];

  return (
    <PageTransition>
      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Behavior Score</p>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-5xl font-semibold text-white">{analysis.honestyScore}/100</h2>
              <p className="mt-2 text-lg text-slate-300">
                Your financial behavior grade is <span className="font-semibold text-white">{behaviorGrade}</span>. The story sounds better than the cash flow looks.
              </p>
            </div>
            <div className="rounded-[1.8rem] border border-white/10 bg-black/20 px-6 py-5 text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Profile</p>
              <p className="mt-2 text-2xl font-semibold text-white">{selectedUser.profile.persona}</p>
              <p className={`mt-2 text-sm font-medium ${isPositive ? "text-signal-good" : "text-signal-bad"}`}>
                {isPositive ? "You are mostly backing up your plan." : "Your plan and behavior are fighting each other."}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">Savings gap</p>
              <p className={`mt-2 text-3xl font-semibold ${analysis.metrics.monthlySavingsGap >= 0 ? "text-signal-good" : "text-signal-bad"}`}>
                {formatMoney(Math.abs(analysis.metrics.monthlySavingsGap))}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {analysis.metrics.monthlySavingsGap >= 0 ? "You are ahead of the promise." : "That amount is slipping every month."}
              </p>
            </div>
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">Spending variance</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {Math.round(analysis.metrics.spendingVariance * 100)}%
              </p>
              <p className="mt-2 text-sm text-slate-400">How far your actual spending drifted from plan.</p>
            </div>
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">{hasObservedCategoryEvidence ? "Leak category" : "Leak status"}</p>
              <p className="mt-2 text-3xl font-semibold text-white capitalize">
                {hasObservedCategoryEvidence ? analysis.metrics.largestOverspendCategory : "Need detail"}
              </p>
              <p className="mt-2 text-sm text-slate-400">
                {hasObservedCategoryEvidence ? "This is where discipline is leaking out." : "Guided intake can score the damage, not name the exact leak."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Peer Comparison</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">Same income range. Different behavior.</h3>
          <p className="mt-4 text-lg leading-8 text-slate-300">{peerDeltaText}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">You</p>
              <p className="mt-2 text-3xl font-semibold text-white">{peerComparison.userRate.toFixed(1)}%</p>
              <p className="mt-2 text-sm text-slate-500">Actual savings rate</p>
            </div>
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">Peers</p>
              <p className="mt-2 text-3xl font-semibold text-signal-good">{peerComparison.peerAverageRate.toFixed(1)}%</p>
              <p className="mt-2 text-sm text-slate-500">Average savings rate</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-signal-accent/70">Brutal Read</p>
            <p className="mt-3 text-xl leading-8 text-white">
              {peerComparison.delta > 0
                ? "You are earning enough. The leak is behavior, not income."
                : "You are already beating the crowd here. Protect that edge and stop getting casual."}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Monthly Breakdown</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Here is exactly where the month went</h3>
            <p className="mt-3 max-w-3xl text-slate-300">
              This is the clearest version of the story: money in, money out, and what was left after everything.
              {!hasObservedCategoryEvidence ? " You skipped the purchase deep dive, so the app only shows your direct inputs plus one estimated flexible-spending bucket." : ""}
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300">
            Transparency first
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.7rem] border border-white/10 bg-black/20">
          <div className="grid grid-cols-[1.4fr,0.8fr] border-b border-white/10 px-5 py-4 text-sm uppercase tracking-[0.25em] text-slate-500">
            <span>Line item</span>
            <span className="text-right">Amount</span>
          </div>

          <div>
            {breakdownRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.4fr,0.8fr] items-center border-b border-white/5 px-5 py-4 last:border-b-0"
              >
                <span className="text-base text-white">{row.label}</span>
                <span
                  className={`text-right text-base font-semibold ${
                    row.tone === "positive"
                      ? "text-signal-good"
                      : row.tone === "accent"
                        ? "text-signal-accent"
                        : "text-white"
                  }`}
                >
                  {row.tone === "positive"
                    ? `+ ${formatMoney(row.value)}`
                    : row.label === "Left at month end" || row.label === "Short at month end"
                      ? `${row.tone === "negative" ? (monthlyLeftAfterEverything >= 0 ? "+ " : "- ") : ""}${formatMoney(row.value)}`
                      : `- ${formatMoney(row.value)}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
          {monthlyLeftAfterEverything >= 0
            ? `After bills, spending, debt, and savings, you still had ${formatMoney(monthlyLeftAfterEverything)} left that month.`
            : `After everything, you were short by ${formatMoney(Math.abs(monthlyLeftAfterEverything))}. That shortfall has to come from somewhere.`}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-signal-accent/70">Savings Gap</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">What you say you save vs what actually sticks</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This is the main gap. If these bars do not match, the plan is not holding up in real life.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span>You say</span>
                <span>{formatMoney(plannedSavings)}/month</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/80"
                  style={{ width: `${(plannedSavings / splitBarMax) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                <span>You actually keep</span>
                <span>{formatMoney(actualSavings)}/month</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${actualSavings >= plannedSavings ? "bg-signal-good" : "bg-signal-bad"}`}
                  style={{ width: `${(actualSavings / splitBarMax) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-signal-bad/20 bg-signal-bad/10 px-4 py-3 text-sm text-white">
            {analysis.metrics.monthlySavingsGap < 0
              ? `That missing ${formatMoney(Math.abs(analysis.metrics.monthlySavingsGap))} every month is not small. It is the entire problem.`
              : "For once, your cash flow is actually backing up your intentions."}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-signal-accent/70">10-Year Cost</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">What the gap becomes if you let it run</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This line shows how the gap grows over time if nothing changes.
          </p>

          <div className="mt-6 h-64 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gapCurve}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="year" stroke="#a3a3a3" />
                <YAxis
                  stroke="#a3a3a3"
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                  width={70}
                />
                <Tooltip
                  formatter={(value: number) => formatMoney(value)}
                  contentStyle={{
                    backgroundColor: "#07111f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#d4af37"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: "#ff5e7a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-signal-bad/20 bg-signal-bad/10 px-4 py-3 text-sm text-white">
            {finalGapCost > 0
              ? `Leave this alone and the hole swells to about ${formatMoney(finalGapCost)} over 10 years.`
              : "The gap is not compounding against you right now. Keep it that way."}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-signal-accent/70">Safety Net</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">How long your safety net really lasts</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This is how long your savings could carry you if income stopped.
          </p>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
              <span>Runway</span>
              <span>{runwayMonths.toFixed(1)} months</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${runwayMonths >= 6 ? "bg-signal-good" : runwayMonths >= 3 ? "bg-signal-warn" : "bg-signal-bad"}`}
                style={{ width: `${runwayFill}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span>3 months</span>
              <span>6+ months</span>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">Observed income</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatMoney(analysis.metrics.monthlyIncomeObserved)}
              </p>
            </div>
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">Observed expenses</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatMoney(analysis.metrics.monthlyExpensesObserved)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-signal-bad/20 bg-signal-bad/10 px-4 py-3 text-sm text-white">
            {runwayMonths < 3
              ? "That buffer is thin. One bad stretch and the plan gets rewritten for you."
              : "You have some room to breathe, but this is not the place to get lazy."}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-signal-accent/70">One Fix</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">{oneFix.title}</h3>
          <p className="mt-4 text-xl leading-8 text-white">{oneFix.action}</p>
          <div className="mt-8 rounded-[1.7rem] border border-signal-good/20 bg-signal-good/10 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-signal-accent">10-year upside</p>
            <p className="mt-3 text-4xl font-semibold text-white">{formatMoney(oneFix.impact)}</p>
            <p className="mt-2 text-sm text-slate-300">
              One focused move is worth more than five motivational slogans.
            </p>
          </div>
        </div>

        {isEstimatedProfile ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Behavior Mix</p>
            <h3 className="mt-3 text-3xl font-semibold text-white">Directional, not forensic</h3>
            <p className="mt-4 text-slate-300">
              This came from guided intake, not full transaction upload. The score is still real, but category visuals stay interpretive until the user gives cleaner category evidence.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-black/20 p-5">
                <p className="text-sm text-slate-400">Discretionary pressure</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {Math.round(analysis.metrics.discretionarySpendRatio * 100)}%
                </p>
              </div>
              <div className="rounded-3xl bg-black/20 p-5">
                <p className="text-sm text-slate-400">Category detail</p>
                <p className="mt-2 text-2xl font-semibold text-amber-200">Estimated only</p>
              </div>
            </div>
          </div>
        ) : (
          <SpendingPieChart data={analysis.metrics.categorySpend} />
        )}
      </section>

      <section className="mt-8">
        <details className="group rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Evidence Layer</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">How this score was built</h3>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300 transition group-open:border-signal-good/30 group-open:text-white">
              Expand details
            </div>
          </summary>

          <div className="mt-6">
            <TrustPanel
              title="Scoring logic and evidence"
              summary="This page is grounded in the savings gap, spend variance, and observed transaction totals. Category-level claims are only made when the underlying category evidence was actually supplied by the payload."
              items={[
                {
                  label: "Observed",
                  detail: `Planned savings ${formatMoney(analysis.behaviorInsights.plannedSavings)} vs actual savings ${formatMoney(actualSavings)} is a direct score input.`,
                  tone: "provided"
                },
                {
                  label: "Policy Logic",
                  detail: "The backend punishes missed savings, spending drift, and cash-flow pressure through deterministic math.",
                  tone: "policy"
                },
                {
                  label: hasObservedCategoryEvidence ? "Category Evidence" : "Estimated Categories",
                  detail: hasObservedCategoryEvidence
                    ? "The leak category is backed by observed category transactions in this payload."
                    : "This profile came from guided answers, so the engine avoids naming a specific leak without category-level evidence.",
                  tone: hasObservedCategoryEvidence ? "provided" : "estimated"
                },
                {
                  label: "Result Scope",
                  detail: "The copy is there to hit emotionally, but the score still comes from backend math, not vibes.",
                  tone: "policy"
                }
              ]}
            />
          </div>
        </details>
      </section>

      <details className="group mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-signal-accent/70">Truth Flow</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Open the full breakdown</h3>
          </div>
          <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300 transition group-open:border-signal-good/30 group-open:text-white">
            Expand flow
          </div>
        </summary>

        <div className="mt-6">
          <InsightFlow insights={analysis.insights} positiveLead={isPositive} />
        </div>
      </details>

      <NextStepCard
        eyebrow="Next Move"
        title="Now force the future to react."
        description="Scenario Lab is where this stops being a lecture and starts becoming a before-vs-after proof."
        to="/scenario-lab"
        cta="Go To Scenario Lab"
      />
    </PageTransition>
  );
};
