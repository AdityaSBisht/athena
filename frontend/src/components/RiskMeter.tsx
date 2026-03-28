interface RiskMeterProps {
  value: number;
  label: string;
}

export const RiskMeter = ({ value, label }: RiskMeterProps) => {
  const rotation = Math.min(Math.max(value, 0), 100) * 1.8;
  const tone = value >= 70 ? "#ff5a6b" : value >= 45 ? "#ffb020" : "#28c76f";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <div className="mx-auto mt-6 flex h-40 w-40 items-end justify-center overflow-hidden rounded-t-full border-8 border-b-0 border-white/10 bg-black/20">
        <div
          className="origin-bottom transition-transform duration-700"
          style={{
            width: 6,
            height: 70,
            background: tone,
            borderRadius: 999,
            transform: `rotate(${rotation - 90}deg) translateY(10px)`
          }}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-4xl font-semibold text-white">{value}</p>
        <p className="text-sm text-slate-400">0 = safer, 100 = riskier</p>
      </div>
    </div>
  );
};
