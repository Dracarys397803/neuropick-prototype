import { GripVertical, Plus } from "lucide-react";
import type { Dimension } from "@/lib/dimensions";
import { getIcon } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

/** 每个维度一条配色（HSL color stops），按维度 key 取色。 */
const DIM_COLOR: Record<string, string> = {
  performance: "hsl(160 84% 39%)",
  battery:     "hsl(150 60% 50%)",
  display:     "hsl(210 80% 56%)",
  portability: "hsl(265 70% 60%)",
  value:       "hsl(28 90% 56%)",
  reliability: "hsl(0 70% 60%)",
};

type Props = {
  /** 当前品类的维度列表 */
  dimensions: Dimension[];
  /** 0..100 的权重百分比 */
  weights: Record<string, number>;
  /** 维度是否启用（关掉则不计入打分） */
  enabled: Record<string, boolean>;
  onWeightChange: (key: string, v: number) => void;
  onToggle: (key: string, on: boolean) => void;
};

/**
 * 「你的优先级权重」—— 多 slider + 开关 + 百分比 + 总和显示。
 *
 * 设计取向：
 * - 用百分比（0–100）显示，符合截图直觉。
 * - 关掉的维度仍然显示但视觉淡化，不参与总和。
 * - 总和不强制 = 100，只展示已分配总量；评分时由 scoring.ts 归一化。
 */
export function WeightAllocator({
  dimensions, weights, enabled, onWeightChange, onToggle,
}: Props) {
  const { toast } = useToast();
  const total = dimensions.reduce(
    (sum, d) => sum + (enabled[d.key] ? (weights[d.key] ?? 0) : 0),
    0
  );

  return (
    <div className="space-y-2.5" data-testid="weight-allocator">
      <div className="flex justify-between text-[10px] text-muted-foreground px-1">
        <span>低权重</span>
        <span>高权重</span>
      </div>

      {dimensions.map((d) => {
        const w = weights[d.key] ?? 0;
        const on = enabled[d.key] !== false;
        const color = DIM_COLOR[d.key] ?? "hsl(var(--primary))";
        const Icon = getIcon(d.icon);

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
                max={100}
                step={1}
                value={w}
                disabled={!on}
                onChange={(e) => onWeightChange(d.key, Number(e.target.value))}
                className="w-full appearance-none bg-transparent disabled:cursor-not-allowed"
                style={
                  {
                    accentColor: color,
                    background: `linear-gradient(to right, ${color} 0%, ${color} ${w}%, hsl(var(--muted)) ${w}%, hsl(var(--muted)) 100%)`,
                    height: 6,
                    borderRadius: 999,
                  } as React.CSSProperties
                }
                data-testid={`weight-slider-${d.key}`}
                aria-label={`${d.label} 权重`}
              />
            </div>

            <span className="text-xs font-mono text-foreground/80 text-right tabular-nums">
              {Math.round(w)}%
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => onToggle(d.key, !on)}
              className={[
                "relative inline-flex h-5 w-9 items-center rounded-full transition",
                on ? "bg-primary" : "bg-muted",
              ].join(" ")}
              data-testid={`weight-toggle-${d.key}`}
              title={on ? "已启用" : "已关闭，不计入打分"}
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
        添加自定义维度（如：品牌、售后服务等）
      </button>

      <div className="absolute -mt-[228px] right-6 text-xs text-muted-foreground hidden">
        {/* placeholder; 真实 total 显示由父组件渲染在 StepHeader.trailing */}
      </div>

      <input type="hidden" data-testid="weight-total" value={Math.round(total)} readOnly />
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
