interface TrustBadgeProps {
  label: string;
  tone?: "provided" | "estimated" | "policy" | "historical";
}

const toneClasses: Record<NonNullable<TrustBadgeProps["tone"]>, string> = {
  provided: "border-signal-good/25 bg-signal-good/10 text-signal-accent",
  estimated: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  policy: "border-white/10 bg-white/5 text-slate-200",
  historical: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
};

export const TrustBadge = ({ label, tone = "policy" }: TrustBadgeProps) => (
  <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] ${toneClasses[tone]}`}>
    {label}
  </span>
);
