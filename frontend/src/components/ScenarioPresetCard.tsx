import type { ScenarioPreset } from "../types/finance";

interface ScenarioPresetCardProps {
  preset: ScenarioPreset;
  active: boolean;
  onSelect: (presetId: string | null) => void;
}

export const ScenarioPresetCard = ({ preset, active, onSelect }: ScenarioPresetCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(active ? null : preset.id)}
      className={`rounded-3xl border p-5 text-left transition ${
        active
          ? "border-signal-cyan/60 bg-signal-cyan/10"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      }`}
    >
      <p className="text-lg font-semibold text-white">{preset.label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{preset.description}</p>
      <span className="mt-4 inline-flex rounded-full bg-black/20 px-3 py-1 text-xs text-slate-300">
        {active ? "Applied" : "Tap to simulate"}
      </span>
    </button>
  );
};
