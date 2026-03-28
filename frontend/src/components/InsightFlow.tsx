interface InsightFlowProps {
  insights: string[];
  positiveLead?: boolean;
}

const getInsightMeta = (text: string, index: number) => {
  const lowered = text.toLowerCase();

  if (index === 0) {
    return {
      tag: "Reality Check",
      accent: "border-signal-good/30 bg-signal-good/10 text-signal-accent"
    };
  }

  if (lowered.includes("leak")) {
    return {
      tag: "Leak Detected",
      accent: "border-signal-bad/30 bg-white/5 text-signal-bad"
    };
  }

  if (lowered.includes("cost") || lowered.includes("10 years")) {
    return {
      tag: "Long-Term Impact",
      accent: "border-signal-good/20 bg-signal-good/10 text-signal-accent"
    };
  }

  if (lowered.includes("safety net") || lowered.includes("bad month")) {
    return {
      tag: "Fragility Warning",
      accent: "border-signal-bad/30 bg-white/5 text-signal-bad"
    };
  }

  return {
    tag: "Behavior Signal",
    accent: "border-white/10 bg-black/20 text-slate-300"
  };
};

export const InsightFlow = ({ insights, positiveLead = false }: InsightFlowProps) => {
  if (insights.length === 0) {
    return null;
  }

  const leadInsight = insights[0];
  const remainingInsights = insights.slice(1);

  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-signal-accent/70">Truth Flow</p>
          <h3 className="mt-2 text-3xl font-semibold text-white">How the engine reads this behavior</h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          Story {"->"} Behavior {"->"} Consequence
        </div>
      </div>

      <div
        className={`glass-panel relative overflow-hidden rounded-[2rem] p-7 ${
          positiveLead ? "border-signal-good/30" : "border-white/10"
        }`}
      >
        <div className="absolute inset-y-0 left-0 w-1 rounded-full bg-signal-good/80" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-signal-accent/70">Lead Insight</p>
            <h4 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white">{leadInsight}</h4>
          </div>
          <div
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              positiveLead ? "bg-signal-good/20 text-signal-accent" : "bg-white/10 text-slate-200"
            }`}
          >
            {positiveLead ? "Aligned but important" : "Highest impact signal"}
          </div>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="absolute bottom-0 left-[18px] top-0 hidden w-px bg-gradient-to-b from-signal-good/40 via-white/10 to-transparent md:block" />

        <div className="space-y-5">
          {remainingInsights.map((insight, index) => {
            const meta = getInsightMeta(insight, index + 1);

            return (
              <div
                key={insight}
                className="animate-slideup md:pl-14"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="relative">
                  <div className="absolute -left-14 top-6 hidden h-10 w-10 items-center justify-center rounded-full border border-signal-good/20 bg-black text-sm font-semibold text-signal-accent md:flex">
                    {index + 2}
                  </div>

                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 transition hover:border-signal-good/25 hover:bg-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] ${meta.accent}`}>
                        {meta.tag}
                      </span>
                      <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                        Step {index + 2}
                      </span>
                    </div>

                    <p className="mt-4 text-xl leading-8 text-white">{insight}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
