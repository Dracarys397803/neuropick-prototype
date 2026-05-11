import { Sparkles } from "lucide-react";
import type { Preset } from "@/lib/dimensions";

type Props = {
  presets: readonly Preset[];
  activeIndex: number | null;
  onPick: (index: number) => void;
};

export function PresetPicker({ presets, activeIndex, onPick }: Props) {
  return (
    <div className="p-5 rounded-xl border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="size-4 text-primary" />
        <h3 className="font-medium">快速预设</h3>
        <span className="text-xs text-muted-foreground">— 一键应用常见用户画像</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p, i) => (
          <button
            key={p.name}
            type="button"
            onClick={() => onPick(i)}
            className={`px-3 h-9 rounded-md text-sm border hover-elevate ${
              activeIndex === i
                ? "bg-primary/15 border-primary text-foreground glow-cyan"
                : "bg-background"
            }`}
            data-testid={`button-preset-${i}`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}
