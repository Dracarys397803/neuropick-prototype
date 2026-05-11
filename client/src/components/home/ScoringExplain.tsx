import { SCORING_EXPLAIN } from "@/data/scoringExplain";
import { getIcon } from "@/lib/icons";

/**
 * 「推荐逻辑」说明区域：6 张小卡片说清楚我们怎么判分。
 * 文案要像工具说明，不像营销广告 —— 一句话讲清楚就行。
 */
export function ScoringExplain() {
  return (
    <section id="scoring" className="mt-20 md:mt-24">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">推荐是怎么算出来的</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            综合下面 6 个维度按你设置的权重打分，并显示每条评分依据。
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {SCORING_EXPLAIN.map((item) => {
          const Icon = getIcon(item.icon);
          return (
            <div
              key={item.id}
              className="rounded-xl border bg-card p-4"
              data-testid={`scoring-card-${item.id}`}
            >
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-md border bg-background grid place-items-center text-primary">
                  <Icon className="size-3.5" />
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {item.blurb}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
