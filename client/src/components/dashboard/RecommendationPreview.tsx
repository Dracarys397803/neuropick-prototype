import { Sparkles, ChevronRight } from "lucide-react";
import { formatPrice, getCategory, buildDimWeights } from "@/lib/dimensions";
import { scoreProducts } from "@/lib/scoring";
import { useToast } from "@/hooks/use-toast";

type Props = {
  /** 当前选中的品类（笔记本时显示真实预览，其余给占位） */
  catKey: string;
  /** 预算上限 */
  budget: number;
  /** 0..100 的权重（关掉的维度已被父组件清空） */
  weights: Record<string, number>;
  /** 关掉的维度 key */
  disabledDims: string[];
};

/**
 * 右侧栏：「推荐预览」—— 实时按当前配置取 Top 3。
 * 注意：仅 laptop 启用真实预览；其他品类显示静态占位。
 */
export function RecommendationPreview({ catKey, budget, weights, disabledDims }: Props) {
  const { toast } = useToast();

  if (catKey !== "laptop") {
    return (
      <SectionCard title="推荐预览" actionLabel="查看全部" onAction={() => toast({ title: "敬请期待" })}>
        <p className="text-xs text-muted-foreground py-6 text-center">
          先选择一个可用品类（笔记本电脑）来预览推荐。
        </p>
      </SectionCard>
    );
  }

  const category = getCategory(catKey);
  const disabledSet = new Set(disabledDims);
  // 注意:这里不用 disabledSet 清零。父组件 Home 在 weights 里已经保留全量值,
  // 关闭维度在评分阶段由 scoreProducts(disabledSet) 负责跳过;预览卡不需要提前置零。
  const dimWeights = buildDimWeights(category.dimensions, weights);

  const top = scoreProducts(category, dimWeights, budget, disabledSet).slice(0, 3);

  return (
    <SectionCard
      title="推荐预览"
      icon={<Sparkles className="size-3.5 text-primary" />}
      actionLabel="查看全部"
      onAction={() => toast({ title: "请点击下方「生成我的推荐」获取完整报告" })}
    >
      {top.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">
          预算太低或维度全关了，调整一下试试。
        </p>
      ) : (
        <ul className="divide-y" data-testid="preview-list">
          {top.map((s, i) => (
            <li
              key={s.product.id}
              className="flex items-center gap-3 py-2.5"
              data-testid={`preview-item-${i}`}
            >
              <div className="relative size-12 shrink-0 rounded-md border bg-muted grid place-items-center text-xl">
                <span aria-hidden>{s.product.image}</span>
                <span className="absolute -top-1.5 -left-1.5 px-1 py-0.5 rounded-sm bg-foreground text-background text-[9px] font-bold">
                  TOP {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {s.product.brand} {s.product.name}
                </div>
                <div className="text-xs text-primary font-mono mt-0.5">
                  {formatPrice(s.product.price)}
                </div>
                <div className="mt-1 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  综合匹配度 {s.matchPct}%
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function SectionCard({
  title, icon, actionLabel, onAction, children,
}: {
  title: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          {icon}
          {title}
        </h3>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            {actionLabel}
            <ChevronRight className="size-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
