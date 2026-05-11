import {
  AlertTriangle, Award, CheckCircle2, ExternalLink, Medal, Trophy,
} from "lucide-react";
import type { Dimension } from "@/lib/dimensions";
import { formatPrice } from "@/lib/dimensions";
import type { Scored } from "@/lib/scoring";
import { ScoreRing } from "./ScoreRing";

type Props = {
  scored: Scored;
  rank: number;
  compact?: boolean;
  dimensions: Dimension[];
  weights: Record<string, number>;
  onCompare: (id: string) => void;
  comparing: boolean;
};

const RANK_LABEL = ["最佳推荐", "次选", "备选"];

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="size-3.5" />;
  if (rank === 2) return <Medal className="size-3.5" />;
  if (rank === 3) return <Award className="size-3.5" />;
  return <span className="font-mono text-xs">#{rank}</span>;
}

export function ProductCard({
  scored, rank, compact, dimensions, weights, onCompare, comparing,
}: Props) {
  const { product, matchPct } = scored;
  const isTop = rank === 1;

  return (
    <div
      className={`relative rounded-xl border bg-card overflow-hidden flex flex-col ${isTop ? "ring-conic" : ""}`}
      data-testid={`card-product-${product.id}`}
    >
      <div className={`relative ${compact ? "p-4" : "p-5"}`}>
        {/* 头部 */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`grid place-items-center rounded-lg border ${compact ? "size-10 text-2xl" : "size-14 text-3xl"}`}
              style={{ background: `hsl(${product.accent} / 0.15)`, borderColor: `hsl(${product.accent} / 0.4)` }}
              aria-hidden="true"
            >
              {product.image}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${
                    isTop ? "bg-primary/20 text-primary" : "bg-muted"
                  }`}
                >
                  <RankIcon rank={rank} />
                  {rank <= 3 ? RANK_LABEL[rank - 1] : `第 ${rank} 名`}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{product.brand}</div>
            </div>
          </div>
          <ScoreRing pct={matchPct} compact={compact} />
        </div>

        <h3 className={`mt-4 font-semibold leading-tight ${compact ? "text-sm" : "text-base"}`}>
          {product.name}
        </h3>
        {!compact && <p className="text-xs text-muted-foreground mt-1">{product.tagline}</p>}

        <div className="mt-3 flex items-end justify-between">
          <div className="font-mono text-lg font-semibold tabular-nums">{formatPrice(product.price)}</div>
          {!compact && (
            <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
              {product.highlights.slice(0, 2).map((h) => (
                <span
                  key={h}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                >
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {!compact && <DimensionBars dimensions={dimensions} weights={weights} scores={product.scores} />}
        {!compact && <ProsCons pros={product.pros} cons={product.cons} />}
      </div>

      {/* 操作区 */}
      <div className="mt-auto p-3 border-t bg-background/40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCompare(product.id)}
          className={`px-2.5 h-8 rounded-md border text-xs hover-elevate ${
            comparing ? "bg-primary/15 border-primary text-primary" : ""
          }`}
          data-testid={`button-compare-${product.id}`}
        >
          {comparing ? "已加入对比" : "对比"}
        </button>
        <div className="flex-1" />
        {product.buyLinks.slice(0, 1).map((b) => (
          <a
            key={b.url}
            href={b.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-primary text-primary-foreground text-xs font-medium hover-elevate border border-primary-border"
            data-testid={`link-buy-${product.id}`}
          >
            前往{b.label} <ExternalLink className="size-3" />
          </a>
        ))}
      </div>
    </div>
  );
}

function DimensionBars({
  dimensions, weights, scores,
}: {
  dimensions: Dimension[];
  weights: Record<string, number>;
  scores: Record<string, number>;
}) {
  return (
    <div className="mt-5 space-y-2">
      {dimensions.map((d) => {
        const raw = scores[d.key] ?? 0;
        const w = weights[d.key] ?? 0;
        const highlighted = w >= 4;
        return (
          <div key={d.key} className="flex items-center gap-2 text-[11px]">
            <span className={`w-12 ${highlighted ? "text-primary font-medium" : "text-muted-foreground"}`}>
              {d.label}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${raw}%`,
                  background: highlighted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.6)",
                }}
              />
            </div>
            <span className="w-7 text-right font-mono tabular-nums text-muted-foreground">{raw}</span>
          </div>
        );
      })}
    </div>
  );
}

function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t">
      <PCList icon={<CheckCircle2 className="size-3" />} label="优势" color="text-emerald-500" items={pros} />
      <PCList icon={<AlertTriangle className="size-3" />} label="取舍" color="text-amber-500" items={cons} />
    </div>
  );
}

function PCList({
  icon, label, color, items,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  items: string[];
}) {
  return (
    <div>
      <div className={`flex items-center gap-1 text-[10px] font-mono ${color} tracking-wider mb-1.5`}>
        {icon} {label}
      </div>
      <ul className="space-y-1 text-[11px] text-muted-foreground leading-snug">
        {items.slice(0, 3).map((p) => (
          <li key={p}>· {p}</li>
        ))}
      </ul>
    </div>
  );
}
