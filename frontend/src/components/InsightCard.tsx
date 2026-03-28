interface InsightCardProps {
  text: string;
  tone?: "good" | "risky";
}

export const InsightCard = ({ text, tone = "risky" }: InsightCardProps) => {
  return (
    <div
      className={`rounded-2xl border p-4 text-sm leading-6 ${
        tone === "good"
          ? "border-signal-good/30 bg-signal-good/10 text-slate-100"
          : "border-signal-bad/25 bg-white/5 text-slate-100"
      }`}
    >
      {text}
    </div>
  );
};
