import { Sliders } from "lucide-react";
import type { Dimension } from "@/lib/dimensions";
import { getIcon } from "@/lib/icons";

const STEPS = [0, 1, 2, 3, 4, 5] as const;

type Props = {
  dimensions: Dimension[];
  weights: Record<string, number>;
  onChange: (key: string, value: number) => void;
};

export function DimensionSliders({ dimensions, weights, onChange }: Props) {
  return (
    <div className="p-6 rounded-xl border bg-card">
      <div className="flex items-center gap-2 mb-6">
        <Sliders className="size-4 text-primary" />
        <h3 className="font-medium">维度权重 · 0 不在意 / 5 极重要</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
        {dimensions.map((d) => (
          <DimensionRow
            key={d.key}
            dimension={d}
            value={weights[d.key] ?? 0}
            onChange={(v) => onChange(d.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

function DimensionRow({
  dimension,
  value,
  onChange,
}: {
  dimension: Dimension;
  value: number;
  onChange: (v: number) => void;
}) {
  const Icon = getIcon(dimension.icon);
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-2">
        <div className="size-8 grid place-items-center rounded-md border bg-background text-primary">
          <Icon className="size-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">{dimension.label}</div>
          <div className="text-[11px] text-muted-foreground">{dimension.desc}</div>
        </div>
        <div className={`font-mono text-sm tabular-nums w-7 text-right ${value >= 4 ? "text-primary" : ""}`}>
          {value}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {STEPS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 h-2.5 rounded-full transition-all ${
              n <= value ? "bg-primary" : "bg-muted hover:bg-muted-foreground/30"
            }`}
            aria-label={`${dimension.label} = ${n}`}
            data-testid={`weight-${dimension.key}-${n}`}
          />
        ))}
      </div>
    </div>
  );
}
