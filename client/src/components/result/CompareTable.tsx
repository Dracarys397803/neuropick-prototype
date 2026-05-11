import { ExternalLink } from "lucide-react";
import type { Dimension } from "@/lib/dimensions";
import { formatPrice } from "@/lib/dimensions";
import type { Scored } from "@/lib/scoring";

type Props = {
  scoredList: Scored[];
  dimensions: Dimension[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

export function CompareTable({ scoredList, dimensions, onRemove, onClear }: Props) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-primary">// COMPARE</div>
          <h2 className="text-base font-semibold mt-1">对比 ({scoredList.length})</h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground"
          data-testid="button-clear-compare"
        >
          清空
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 text-xs font-medium text-muted-foreground w-32">维度</th>
              {scoredList.map((s) => (
                <th key={s.product.id} className="text-left p-3 align-top min-w-[180px]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-muted-foreground">{s.product.brand}</div>
                      <div className="font-semibold text-sm leading-tight">{s.product.name}</div>
                      <div className="font-mono text-xs text-primary mt-1">{s.matchPct}/100</div>
                    </div>
                    <button
                      onClick={() => onRemove(s.product.id)}
                      className="text-muted-foreground hover:text-foreground text-xs"
                      aria-label="移除"
                      data-testid={`button-remove-compare-${s.product.id}`}
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3 text-xs text-muted-foreground">价格</td>
              {scoredList.map((s) => (
                <td key={s.product.id} className="p-3 font-mono">
                  {formatPrice(s.product.price)}
                </td>
              ))}
            </tr>
            {dimensions.map((d) => (
              <DimensionRow key={d.key} dimension={d} scoredList={scoredList} />
            ))}
            <tr>
              <td className="p-3 text-xs text-muted-foreground align-top">购买</td>
              {scoredList.map((s) => (
                <td key={s.product.id} className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {s.product.buyLinks.map((b) => (
                      <a
                        key={b.url}
                        href={b.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 h-7 rounded border text-[11px] hover-elevate"
                        data-testid={`link-compare-buy-${s.product.id}-${b.label}`}
                      >
                        {b.label} <ExternalLink className="size-2.5" />
                      </a>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DimensionRow({
  dimension,
  scoredList,
}: {
  dimension: Dimension;
  scoredList: Scored[];
}) {
  const best = Math.max(...scoredList.map((s) => s.product.scores[dimension.key] ?? 0));
  return (
    <tr className="border-b">
      <td className="p-3 text-xs text-muted-foreground">{dimension.label}</td>
      {scoredList.map((s) => {
        const v = s.product.scores[dimension.key] ?? 0;
        const isBest = v === best && scoredList.length > 1;
        return (
          <td key={s.product.id} className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[120px]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${v}%`,
                    background: isBest ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.6)",
                  }}
                />
              </div>
              <span className={`font-mono text-xs tabular-nums ${isBest ? "text-primary font-semibold" : ""}`}>
                {v}
              </span>
            </div>
          </td>
        );
      })}
    </tr>
  );
}
