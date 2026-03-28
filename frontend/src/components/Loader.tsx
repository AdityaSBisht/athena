export const Loader = () => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-950/80 backdrop-blur-md">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-10 py-8 text-center shadow-glow">
        <div className="mx-auto flex w-20 items-end justify-center gap-2">
          <span className="h-6 w-3 animate-pulse rounded-full bg-signal-accent" />
          <span className="h-10 w-3 animate-pulse rounded-full bg-signal-good [animation-delay:180ms]" />
          <span className="h-14 w-3 animate-pulse rounded-full bg-signal-bad [animation-delay:360ms]" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.35em] text-slate-400">Calculating truth</p>
        <h3 className="mt-2 text-xl font-semibold text-white">Running your financial reality check...</h3>
      </div>
    </div>
  );
};
