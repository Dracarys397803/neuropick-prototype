import { GripVertical, Plus, RotateCcw, Wand2 } from "lucide-react";
import type { Dimension } from "@/lib/dimensions";
import { getIcon } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

/** 每个维度一条配色(HSL color stops),按维度 key 取色。 */
const DIM_COLOR: Record<string, string> = {
  performance: "hsl(160 84% 39%)",
  battery:     "hsl(150 60% 50%)",
  display:     "hsl(210 80% 56%)",
  portability: "hsl(265 70% 60%)",
  value:       "hsl(28 90% 56%)",
  reliability: "hsl(0 70% 60%)",
};

type Props = {
  dimensions: Dimension[];
  /** 0..100 的权重百分比 */
  weights: Record<string, number>;
  /** 维度是否启用(关掉则不计入打分) */
  enabled: Record<string, boolean>;
  onWeightChange: (key: string, v: number) => void;
  onToggle: (key: string, on: boolean) => void;
  /** 一次性重置所有权重(给"平均分配 / 重置默认"用) */
  onReset?: (next: Record<string, number>) => void;
};

/**
 * 「你的优先级权重」—— 多 slider + 开关 + 百分比 + 严格 100 分约束。
 *
 * 约束规则:
 * - 启用维度的权重总和被强制 ≤ 100。
 * - 单个 slider 的 max 动态等于「100 - 其他启用维度之和」,所以从交互层根本不可能拖到超 100。
 * - 关闭维度时,该维度的权重不计入总和(由父组件读取 `enabled` 后聚合)。
 * - 已分配 / 还剩多少 / 是否超出 由父组件 (Home.tsx) 在 StepHeader.trailing 渲染。
 */
export function WeightAllocator({
  dimensions, weights, enabled, onWeightChange, onToggle, onReset,
}: Props) {
  const { toast } = useToast();

  const enabledTotal = dimensions.reduce(
    (sum, d) => sum + (enabled[d.key] !== false ? (weights[d.key] ?? 0) : 0),
    0
  );

  /** 给指定维度计算允许的最大值:100 - 其他启用维度的当前权重之和 */
  function maxFor(key: string): number {
    const others = dimensions.reduce((sum, d) => {
      if (d.key === key) return sum;
      if (enabled[d.key] === false) return sum;
      return sum + (weights[d.key] ?? 0);
    }, 0);
    return Math.max(0, 100 - others);
  }

  /** 把启用维度的权重均分到 100。 */
  function distributeEvenly() {
    const enabledDims = dimensions.filter((d) => enabled[d.key] !== false);
    if (enabledDims.length === 0) {
      toast({ title: "请先开启至少一个维度" });
      return;
    }
    const base = Math.floor(100 / enabledDims.length);
    const remainder = 100 - base * enabledDims.length;
    const next: Record<string, number> = {};
    dimensions.forEach((d) => {
      next[d.key] = 0;
    });
    enabledDims.forEach((d, i) => {
      next[d.key] = base + (i < remainder ? 1 : 0);
    });
    onReset?.(next);
  }

  return (
    <div className="space-y-2.5" data-testid="weight-allocator">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
        <span>低权重</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={distributeEvenly}
            className="inline-flex items-center gap-1 hover:text-foreground transition"
            data-testid="button-distribute-even"
            title="把 100 分平均分给启用维度"
          >
            <Wand2 className="size-3" /> 平均分配
          </button>
          <span className="opacity-40">|</span>
          <span>高权重</span>
        </div>
      </div>

      {dimensions.map((d) => {
        const w = weights[d.key] ?? 0;
        const on = enabled[d.key] !== false;
        const color = DIM_COLOR[d.key] ?? "hsl(var(--primary))";
        const Icon = getIcon(d.icon);
        const dynMax = on ? maxFor(d.key) : 0;

        return (
          <div
            key={d.key}
            className={[
              "grid grid-cols-[16px_auto_1fr_44px_36px] items-center gap-3 px-2 py-1.5 rounded-md",
              !on && "opacity-50",
            ].filter(Boolean).join(" ")}
            data-testid={`weight-row-${d.key}`}
          >
            <GripVertical className="size-3.5 text-muted-foreground/50" aria-hidden />
            <div className="flex items-center gap-2 w-[88px]">
              <span
                className="size-5 grid place-items-center rounded"
                style={{ background: `${color}22`, color }}
              >
                <Icon className="size-3" />
              </span>
              <span className="text-sm">{d.label}</span>
            </div>

            <div className="relative">
              <input
                type="range"
                min={0}
                /**
                 * 关键:max 不再是固定 100,而是 100 - 其他维度之和。
                 * 这样从交互上就无法拖到使总和 > 100。
                 */
                max={dynMax}
                step={1}
                value={Math.min(w, dynMax)}
                disabled={!on}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  const clamped = Math.min(next, dynMax);
                  onWeightChange(d.key, clamped);
                }}
                className="w-full appearance-none bg-transparent disabled:cursor-not-allowed"
                style={
                  {
                    accentColor: color,
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${dynMax > 0 ? (w / dynMax) * 100 : 0}%, hsl(var(--muted)) ${dynMax > 0 ? (w / dynMax) * 100 : 0}%, hsl(var(--muted)) 100%)`,
                    height: 6,
                    borderRadius: 999,
                  } as React.CSSProperties
                }
                data-testid={`weight-slider-${d.key}`}
                aria-label={`${d.label} 权重`}
                aria-valuemin={0}
                aria-valuemax={dynMax}
                aria-valuenow={w}
              />
            </div>

            <span className="text-xs font-mono text-foreground/80 text-right tabular-nums">
              {Math.round(w)}%
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => {
                const turningOff = on;
                onToggle(d.key, !on);
                if (turningOff) {
                  // 关闭某维度时,把它的权重清零,避免后续重新打开后造成 >100 的尴尬状态。
                  onWeightChange(d.key, 0);
                }
              }}
              className={[
                "relative inline-flex h-5 w-9 items-center rounded-full transition",
                on ? "bg-primary" : "bg-muted",
              ].join(" ")}
              data-testid={`weight-toggle-${d.key}`}
              title={on ? "已启用 · 点击关闭" : "已关闭 · 不计入打分"}
            >
              <span
                className={[
                  "inline-block size-4 rounded-full bg-white shadow transition-transform",
                  on ? "translate-x-[18px]" : "translate-x-0.5",
                ].join(" ")}
              />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() =>
          toast({
            title: "自定义维度 · 敬请期待",
            description: "之后可以加品牌、售后服务、屏幕色域等自定义维度。",
          })
        }
        className="w-full mt-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-dashed text-muted-foreground hover:text-foreground hover:border-foreground/30 transition text-xs"
        data-testid="button-add-custom-dim"
      >
        <Plus className="size-3.5" />
        添加自定义维度(如:品牌、售后服务等)
      </button>

      <input type="hidden" data-testid="weight-total" value={Math.round(enabledTotal)} readOnly />
    </div>
  );
}

/** 暴露给父组件用作 StepHeader 右上角显示。 */
export function useWeightTotal(
  dimensions: Dimension[],
  weights: Record<string, number>,
  enabled: Record<string, boolean>
) {
  return Math.round(
    dimensions.reduce(
      (sum, d) => sum + (enabled[d.key] !== false ? (weights[d.key] ?? 0) : 0),
      0
    )
  );
}

/** 工具:在子组件外面也用得到的 reset 辅助。 */
export { RotateCcw };
