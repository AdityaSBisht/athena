import { TrustBadge } from "./TrustBadge";

interface TrustPanelProps {
  title: string;
  summary: string;
  items: Array<{
    label: string;
    detail: string;
    tone?: "provided" | "estimated" | "policy" | "historical";
  }>;
}

export const TrustPanel = ({ title, summary, items }: TrustPanelProps) => {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Trust Layer</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{summary}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <TrustBadge label={item.label} tone={item.tone} />
            <p className="mt-3 text-sm leading-6 text-slate-300">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
