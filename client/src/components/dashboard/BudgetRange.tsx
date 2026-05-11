import { formatPrice } from "@/lib/dimensions";

type Props = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
};

/**
 * 带气泡显示的预算 slider。
 */
export function BudgetRange({ min, max, step = 500, value, onChange }: Props) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="px-1">
      <div className="relative h-9">
        <span
          className="absolute -top-1 -translate-x-1/2 px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-xs font-mono whitespace-nowrap shadow-sm"
          style={{ left: `${pct}%` }}
          data-testid="budget-bubble"
        >
          {formatPrice(value)}
        </span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 top-6 w-full accent-primary"
          aria-label="预算上限"
          data-testid="input-budget"
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}+</span>
      </div>
    </div>
  );
}
