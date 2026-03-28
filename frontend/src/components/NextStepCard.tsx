import { Link } from "react-router-dom";

interface NextStepCardProps {
  eyebrow: string;
  title: string;
  description: string;
  to: string;
  cta: string;
}

export const NextStepCard = ({ eyebrow, title, description, to, cta }: NextStepCardProps) => {
  return (
    <div className="glass-panel mt-8 flex flex-col justify-between gap-5 rounded-[1.75rem] p-6 md:flex-row md:items-center">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-signal-accent/70">{eyebrow}</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-2xl text-slate-300">{description}</p>
      </div>
      <Link
        to={to}
        className="inline-flex items-center justify-center rounded-full bg-signal-good px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-signal-accent"
      >
        {cta}
      </Link>
    </div>
  );
};
