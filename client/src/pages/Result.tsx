import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { SideNav } from "@/components/dashboard/SideNav";
import { TopBar } from "@/components/dashboard/TopBar";
import { CompareTable } from "@/components/result/CompareTable";
import { EmptyState } from "@/components/result/EmptyState";
import { LoadingState } from "@/components/result/LoadingState";
import { ProductCard } from "@/components/result/ProductCard";
import { ShareButton } from "@/components/result/ShareButton";
import { SummaryCard } from "@/components/result/SummaryCard";
import { formatPrice, getCategory } from "@/lib/dimensions";
import { useRouter } from "@/lib/router";
import { scoreProducts, type Scored } from "@/lib/scoring";

type Props = {
  catKey: string;
  weights: Record<string, number>;
  budget: number;
  presetName?: string;
  disabledDims?: string[];
};

const LOADING_MS = 1100;

/**
 * 报告页 —— 套上新版 dashboard 壳(TopBar + SideNav),
 * 「修改条件」和「重新生成」全部回到新版首页 home。
 * 旧的 configure 路由已彻底删除,这里不存在任何回到旧页的路径。
 */
export default function Result({ catKey, weights, budget, presetName, disabledDims }: Props) {
  const { go } = useRouter();
  const category = getCategory(catKey);

  const disabledSet = useMemo(
    () => new Set(disabledDims ?? []),
    [disabledDims]
  );
  const scored = useMemo(
    () => scoreProducts(category, weights, budget, disabledSet),
    [category, weights, budget, disabledSet]
  );
  const loading = useFakeLoading(LOADING_MS, [catKey, weights, budget, disabledSet]);

  /** 「返回 / 修改条件」一律回新版首页。 */
  const backToHome = () => go({ name: "home" });

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar activeId="advisor" />
      <div className="flex flex-1">
        <SideNav activeId="advisor" onSelect={(id) => {
          // SideNav 内部已经处理了 coming-soon 的 toast。
          // 这里只接 available 的点击,目前只有 home/advisor:统一回首页。
          if (id === "home" || id === "advisor") backToHome();
        }} />

        <main className="flex-1 min-w-0 bg-muted/30">
          <section className="border-b bg-background">
            <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 py-8">
              <button
                type="button"
                onClick={backToHome}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                data-testid="link-back-home"
              >
                <ArrowLeft className="size-3.5" /> 返回首页
              </button>
              <div className="mt-4 flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                    {loading ? "正在生成推荐…" : `为你找到 ${scored.length} 款合适产品`}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {category.label}{presetName ? ` · ${presetName}` : ""} · 预算 ≤ {formatPrice(budget)} · 按你的权重排序
                  </p>
                </div>
                <ShareButton />
              </div>
            </div>
          </section>

          <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 py-10">
            {loading ? (
              <LoadingState />
            ) : scored.length === 0 ? (
              <EmptyState onBackHome={backToHome} />
            ) : (
              <Report
                scored={scored}
                weights={weights}
                catKey={catKey}
                onBackHome={backToHome}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Report({
  scored, weights, catKey, onBackHome,
}: {
  scored: Scored[];
  weights: Record<string, number>;
  catKey: string;
  onBackHome: () => void;
}) {
  const category = getCategory(catKey);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  function toggleCompare(id: string) {
    setCompareIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 3 ? ids : [...ids, id]
    );
  }

  const top3 = scored.slice(0, 3);
  const rest = scored.slice(3);

  return (
    <div className="space-y-12">
      <SummaryCard scored={scored} weights={weights} dimensions={category.dimensions} catKey={catKey} />

      <div>
        <h2 className="text-xl font-semibold mb-5">最匹配的三款</h2>
        <div className="grid lg:grid-cols-3 gap-5">
          {top3.map((s, idx) => (
            <ProductCard
              key={s.product.id}
              scored={s}
              rank={idx + 1}
              dimensions={category.dimensions}
              weights={weights}
              onCompare={toggleCompare}
              comparing={compareIds.includes(s.product.id)}
            />
          ))}
        </div>
      </div>

      {compareIds.length >= 2 && (
        <CompareTable
          scoredList={scored.filter((s) => compareIds.includes(s.product.id))}
          dimensions={category.dimensions}
          onRemove={(id) => setCompareIds((ids) => ids.filter((x) => x !== id))}
          onClear={() => setCompareIds([])}
        />
      )}

      {rest.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-5">其他候选 ({rest.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((s, idx) => (
              <ProductCard
                key={s.product.id}
                scored={s}
                rank={idx + 4}
                compact
                dimensions={category.dimensions}
                weights={weights}
                onCompare={toggleCompare}
                comparing={compareIds.includes(s.product.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">不太满意？</p>
        <button
          type="button"
          onClick={onBackHome}
          className="mt-3 inline-flex items-center gap-2 px-5 h-11 rounded-lg border bg-card hover:bg-muted transition font-medium"
          data-testid="link-back-home-bottom"
        >
          <RotateCcw className="size-4" /> 回到首页重新调整
        </button>
      </div>
    </div>
  );
}

/** 假装 AI 生成过程的 loading state */
function useFakeLoading(ms: number, deps: unknown[]) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return loading;
}
