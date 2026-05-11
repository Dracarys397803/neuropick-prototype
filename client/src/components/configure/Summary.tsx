import { ArrowLeft, Sparkles } from "lucide-react";
import { formatPrice, type Dimension } from "@/lib/dimensions";

type Props = {
  dimensions: Dimension[];
  weights: Record<string, number>;
  budget: number;
  onSubmit: () => void;
  onBack: () => void;
};

export function Summary({ dimensions, weights, budget, onSubmit, onBack }: Props) {
  const topDims = dimensions
    .map((d) => ({ d, w: weights[d.key] ?? 0 }))
    .sort((a, b) => b.w - a.w)
    .slice(0, 3);

  return (
    <aside className="p-6 rounded-xl border bg-card h-fit space-y-5">
      <div className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">// SUMMARY</div>
      <div>
        <div className="text-xs text-muted-foreground">你最看重</div>
        <div className="mt-2 space-y-1.5">
          {topDims.map((t) => (
            <div key={t.d.key} className="flex items-center justify-between text-sm">
              <span>{t.d.label}</span>
              <span className="font-mono text-primary">{"●".repeat(t.w)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t pt-4">
        <div className="text-xs text-muted-foreground">预算上限</div>
        <div className="mt-1 font-mono text-xl font-semibold">{formatPrice(budget)}</div>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        className="w-full inline-flex items-center justify-center gap-2 px-5 h-11 rounded-md bg-primary text-primary-foreground font-medium hover-elevate active-elevate-2 border border-primary-border"
        data-testid="button-generate-report"
      >
        <Sparkles className="size-4" />
        生成 AI 推荐报告
      </button>
      <button
        type="button"
        onClick={onBack}
        className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        data-testid="button-back-step1"
      >
        <ArrowLeft className="size-3.5" /> 返回调权重
      </button>
    </aside>
  );
}
