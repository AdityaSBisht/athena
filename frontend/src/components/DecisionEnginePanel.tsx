import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DecisionEngineResponse } from "../types/finance";
import { TrustPanel } from "./TrustPanel";

interface DecisionEnginePanelProps {
  data: DecisionEngineResponse;
}

const formatMoney = (value: number) => `$${Math.round(value).toLocaleString()}`;

export const DecisionEnginePanel = ({ data }: DecisionEnginePanelProps) => {
  return (
    <div className="space-y-8">
      <TrustPanel
        title="Why these recommendations were chosen"
        summary="These suggestions are ranked by backend rules, not random AI guessing. The app looks at your monthly pressure, debt load, savings strength, and likely upside."
        items={[
          {
            label: "Rule Based",
            detail: "The backend looks at debt, savings, spending pressure, and goal fit.",
            tone: "policy"
          },
          {
            label: "Upside",
            detail: "The upside number is a simple estimate of how much the move could help over time.",
            tone: "policy"
          },
          {
            label: "Trend View",
            detail: "Drift and stress tests show direction, not a guaranteed future.",
            tone: "estimated"
          },
          {
            label: "Goal Fit",
            detail: "The plan changes based on the goal you picked and the room your budget actually has.",
            tone: "provided"
          }
        ]}
      />

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-signal-accent/70">Best Next Moves</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {data.recommendations.map((recommendation, index) => (
            <div key={recommendation.title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-signal-good/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-signal-accent">
                  #{index + 1}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.25em] ${
                    recommendation.urgency === "high"
                      ? "bg-signal-bad/15 text-signal-bad"
                      : recommendation.urgency === "medium"
                        ? "bg-white/10 text-slate-300"
                        : "bg-signal-good/10 text-signal-accent"
                  }`}
                >
                  {recommendation.urgency} priority
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{recommendation.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{recommendation.reason}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-slate-500">Confidence</p>
                  <p className="mt-1 text-lg font-semibold text-white">{recommendation.confidence}%</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-slate-500">Possible upside</p>
                  <p className="mt-1 text-lg font-semibold text-signal-good">
                    {formatMoney(recommendation.projectedUpside)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                  App ranked
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">
                  {recommendation.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Habit Trend</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.habitDrift}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="month" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020403",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 16
                  }}
                />
                <Line type="monotone" dataKey="savingsRate" stroke="#d4af37" strokeWidth={3} />
                <Line type="monotone" dataKey="spendingVariance" stroke="#fefce8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Goal Plan</p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{data.goalOptimizer.selectedGoal}</h3>
          <p className="mt-3 text-slate-300">{data.goalOptimizer.recommendation}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">Target amount</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatMoney(data.goalOptimizer.targetAmount)}
              </p>
            </div>
            <div className="rounded-3xl bg-black/20 p-5">
              <p className="text-sm text-slate-400">Time to goal</p>
              <p className="mt-2 text-2xl font-semibold text-signal-accent">
                {data.goalOptimizer.monthsToGoal} months
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Stress Test</p>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.stressTests}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" stroke="#a3a3a3" />
              <YAxis stroke="#a3a3a3" />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === "impact" ? formatMoney(value) : `${value}`
                }
                contentStyle={{
                  backgroundColor: "#020403",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16
                }}
              />
              <Bar dataKey="survivalScore" fill="#d4af37" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.stressTests.map((test) => (
            <div key={test.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm text-slate-400">{test.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{test.survivalScore}/100 strength</p>
              <p className="mt-2 text-sm text-slate-300">Impact: {formatMoney(test.impact)}</p>
              <p className="mt-1 text-sm text-slate-300">Recovery: {test.recoveryMonths} months</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
