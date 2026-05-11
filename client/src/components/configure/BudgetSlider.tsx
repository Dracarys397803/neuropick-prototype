import { useMemo } from "react";
import { Wallet } from "lucide-react";
import { formatPrice, type BudgetConfig } from "@/lib/dimensions";

type Props = {
  config: BudgetConfig;
  value: number;
  onChange: (v: number) => void;
};

export function BudgetSlider({ config, value, onChange }: Props) {
  const quickPicks = useMemo(
    () => [
      config.min,
      Math.round((config.min + config.defaultMax) / 2),
      config.defaultMax,
      Math.round((config.defaultMax + config.max) / 2),
      config.max,
    ],
    [config]
  );

  const step = Math.max(100, Math.round((config.max - config.min) / 200));

  return (
    <div className="p-6 rounded-xl border bg-card space-y-6">
      <div className="flex items-center gap-2">
        <Wallet className="size-4 text-primary" />
        <h3 className="font-medium">设定预算上限</h3>
      </div>

      <div className="text-center py-6">
        <div className="font-mono text-5xl md:text-6xl font-semibold tracking-tight glow-text">
          {formatPrice(value)}
        </div>
        <div className="text-xs text-muted-foreground mt-2 font-mono tracking-widest">MAX BUDGET</div>
      </div>

      <input
        type="range"
        min={config.min}
        max={config.max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        data-testid="input-budget-slider"
      />
      <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
        <span>{formatPrice(config.min)}</span>
        <span>{formatPrice(config.max)}</span>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <span className="text-xs text-muted-foreground self-center mr-2">快速档位：</span>
        {quickPicks.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`px-3 h-8 rounded-md text-xs border hover-elevate font-mono ${
              value === p ? "bg-primary/15 border-primary" : "bg-background"
            }`}
            data-testid={`button-budget-${p}`}
          >
            {formatPrice(p)}
          </button>
        ))}
      </div>
    </div>
  );
}
