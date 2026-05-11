import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { Dimension } from "@/lib/dimensions";
import type { Scored } from "@/lib/scoring";

type Props = {
  scored: Scored[];
  weights: Record<string, number>;
  dimensions: Dimension[];
  catKey: string;
};

export function SummaryCard({ scored, weights, dimensions, catKey }: Props) {
  const winner = scored[0];
  const topDims = useMemo(
    () =>
      dimensions
        .map((d) => ({ d, w: weights[d.key] ?? 0 }))
        .filter((x) => x.w > 0)
        .sort((a, b) => b.w - a.w)
        .slice(0, 3),
    [dimensions, weights]
  );

  const explanation = useMemo(() => {
    const dimNames = topDims.map((t) => t.d.label).join("、");
    const top = topDims[0];
    return `根据你最看重的 ${dimNames}，结合预算约束，「${winner.product.name}」综合得分最高（${winner.matchPct}/100），其在${
      top?.d.label
    }维度的原始评分为 ${winner.product.scores[top?.d.key ?? ""] ?? "-"} 分，是平衡你诉求的最优解。`;
  }, [winner, topDims]);

  return (
    <div className="relative rounded-xl border bg-card overflow-hidden">
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20 pointer-events-none" />
      <div className="absolute -top-20 -right-20 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="relative p-6 md:p-8">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-lg bg-primary/15 border border-primary/30 grid place-items-center text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[11px] tracking-[0.2em] text-primary">// AI · ANALYSIS</div>
            <h2 className="text-lg md:text-xl font-semibold mt-1">推荐摘要</h2>
            <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-foreground/90">{explanation}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="font-mono">
                候选数 <span className="text-foreground ml-1">{scored.length}</span>
              </span>
              <span className="font-mono">
                最高分 <span className="text-primary ml-1">{winner.matchPct}</span>
              </span>
              <span className="font-mono">
                品类 <span className="text-foreground ml-1">{catKey}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
