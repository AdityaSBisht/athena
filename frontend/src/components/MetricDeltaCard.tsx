interface MetricDeltaCardProps {
  label: string;
  baseline: number;
  current: number;
  suffix?: string;
  money?: boolean;
  inverseGood?: boolean;
}

const formatValue = (value: number, money?: boolean, suffix?: string) => {
  if (money) {
    return `$${Math.round(value).toLocaleString()}`;
  }

  if (suffix === "%") {
    return `${Math.round(value)}%`;
  }

  return `${Math.round(value)}${suffix ?? ""}`;
};

export const MetricDeltaCard = ({
  label,
  baseline,
  current,
  suffix,
  money,
  inverseGood = false
}: MetricDeltaCardProps) => {
  const delta = current - baseline;
  const positiveIsGood = inverseGood ? delta <= 0 : delta >= 0;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Before</p>
          <p className="mt-1 text-xl font-semibold text-white">{formatValue(baseline, money, suffix)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">After</p>
          <p className="mt-1 text-xl font-semibold text-white">{formatValue(current, money, suffix)}</p>
        </div>
        <div className={`rounded-full px-3 py-2 text-sm font-medium ${positiveIsGood ? "bg-signal-good/20 text-signal-good" : "bg-signal-bad/20 text-signal-bad"}`}>
          {delta >= 0 ? "+" : ""}
          {formatValue(delta, money, suffix)}
        </div>
      </div>
    </div>
  );
};
