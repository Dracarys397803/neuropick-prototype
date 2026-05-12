import { ChevronRight, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/dimensions";
import type { Scored } from "@/lib/scoring";
import { ScoreRing } from "./ScoreRing";
import { LaptopThumbnail, brandBadge } from "./LaptopThumbnail";

/**
 * 第 4-10 名 —— 单列横向紧凑卡片(一行一个)。
 *
 * 桌面端的视觉重心从左到右:
 *   排名 | 缩略图 | 品牌+名称+说明 | 价格+标签 | 分数环 | [对比] [查看详情]
 *
 * 窄屏(<sm):
 *   - 仍然保持「一张卡片一行」结构,不会变成两列
 *   - 内部 flex-wrap,价格/标签/按钮折到下一行
 *
 * 不参与 Top 3 那种重点展示,信息量是 Top 3 的精简版,但仍然完整够做比较。
 */

type Props = {
  scored: Scored;
  rank: number; // 期望 4..10
  onCompare: (id: string) => void;
  comparing: boolean;
  /** 「查看详情」当前只用 toast 提示,在 prototype 阶段;父组件传入。 */
  onViewDetails?: (id: string) => void;
};

export function RankedListItem({
  scored, rank, onCompare, comparing, onViewDetails,
}: Props) {
  const { product, matchPct } = scored;

  return (
    <div
      className="group relative rounded-xl border bg-card transition hover:shadow-sm hover:border-primary/40"
      data-testid={`row-ranked-${product.id}`}
    >
      <div className="flex items-center gap-4 p-3.5 md:gap-5 md:p-4 flex-wrap md:flex-nowrap">
        {/* 1) 排名编号 */}
        <div
          className="shrink-0 size-9 grid place-items-center rounded-md bg-muted font-mono text-sm tabular-nums text-muted-foreground"
          aria-label={`第 ${rank} 名`}
        >
          <span className="opacity-60">#</span>{rank}
        </div>

        {/* 2) 缩略图 */}
        <div
          className="shrink-0 rounded-md border grid place-items-center"
          style={{
            background: `hsl(${product.accent} / 0.08)`,
            width: 76,
            height: 56,
          }}
        >
          <LaptopThumbnail accent={product.accent} badge={brandBadge(product.brand)} size={64} />
        </div>

        {/* 3) 品牌 + 名称 + 一句话说明 —— 主要文本 */}
        <div className="min-w-0 flex-1 md:max-w-[34%]">
          <div className="text-[11px] text-muted-foreground">{product.brand}</div>
          <div className="font-semibold text-sm leading-tight truncate" title={product.name}>
            {product.name}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate" title={product.tagline}>
            {product.tagline}
          </div>
        </div>

        {/* 4) 价格 + 5) 标签 */}
        <div className="min-w-0 md:flex-1 flex flex-col gap-1.5">
          <div className="font-mono text-base font-semibold tabular-nums">
            {formatPrice(product.price)}
          </div>
          <div className="flex flex-wrap gap-1">
            {product.highlights.slice(0, 3).map((h) => (
              <span
                key={h}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground/70 border"
              >
                {h}
              </span>
            ))}
          </div>
        </div>

        {/* 7) 分数环 */}
        <div className="shrink-0">
          <ScoreRing pct={matchPct} compact />
        </div>

        {/* 8) 操作按钮 */}
        <div className="shrink-0 flex items-center gap-2 ml-auto md:ml-0">
          <button
            type="button"
            onClick={() => onCompare(product.id)}
            className={`px-2.5 h-8 rounded-md border text-xs hover-elevate ${
              comparing ? "bg-primary/15 border-primary text-primary" : ""
            }`}
            data-testid={`button-compare-${product.id}`}
          >
            {comparing ? "已加入" : "对比"}
          </button>
          {product.buyLinks[0] ? (
            <a
              href={product.buyLinks[0].url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-md border bg-card text-xs hover-elevate"
              data-testid={`link-details-${product.id}`}
              onClick={(e) => {
                if (onViewDetails) {
                  e.preventDefault();
                  onViewDetails(product.id);
                }
              }}
            >
              查看详情
              <ChevronRight className="size-3" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => onViewDetails?.(product.id)}
              className="inline-flex items-center gap-1 px-2.5 h-8 rounded-md border bg-card text-xs hover-elevate"
              data-testid={`button-details-${product.id}`}
            >
              查看详情
              <ChevronRight className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
