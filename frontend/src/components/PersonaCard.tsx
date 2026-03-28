import type { UserPayload } from "../types/finance";

interface PersonaCardProps {
  persona: UserPayload;
  onLoad: (persona: UserPayload) => void;
}

export const PersonaCard = ({ persona, onLoad }: PersonaCardProps) => {
  const savingsSignal =
    persona.profile.savingsGoalMonthly > 1800 ? "text-signal-good" : "text-signal-bad";

  return (
    <button
      type="button"
      onClick={() => onLoad(persona)}
      className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-glow transition duration-300 hover:-translate-y-1 hover:border-signal-good/40 hover:bg-white/10"
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-signal-accent/70">Demo User</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{persona.profile.persona}</h3>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          {persona.profile.riskTolerance} risk tolerance
        </span>
      </div>

      <p className="text-sm text-slate-300">
        {persona.profile.occupation} • ${persona.profile.monthlyIncome.toLocaleString()}/month income
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-black/20 p-3">
          <p className="text-slate-400">Savings goal</p>
          <p className={`mt-1 text-lg font-semibold ${savingsSignal}`}>
            ${persona.profile.savingsGoalMonthly.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl bg-black/20 p-3">
          <p className="text-slate-400">Cash buffer</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {persona.profile.cashBufferMonths.toFixed(1)} months
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm text-slate-400">{persona.transactions.length} mock transactions</span>
        <span className="rounded-full bg-signal-good px-4 py-2 text-sm font-medium text-ink-950 transition group-hover:bg-signal-accent">
          Load demo mode
        </span>
      </div>
    </button>
  );
};
