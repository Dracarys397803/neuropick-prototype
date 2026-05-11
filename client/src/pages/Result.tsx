import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
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
};

const LOADING_MS = 1100;

export default function Result({ catKey, weights, budget, presetName }: Props) {
  const { go } = useRouter();
  const category = getCategory(catKey);

  const scored = useMemo(
    () => scoreProducts(category, weights, budget),
    [category, weights, budget]
  );
  const loading = useFakeLoading(LOADING_MS, [catKey, weights, budget]);

  const reconfigure = () => go({ name: "configure", catKey });

  return (
    <AppShell>
      <section className="relative border-b overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <button
            type="button"
            onClick={reconfigure}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            data-testid="link-back-configure"
          >
            <ArrowLeft className="size-3.5" /> 修改条件
          </button>
          <div className="mt-4 flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="font-mono text-xs tracking-[0.2em] text-primary mb-2">
                // REPORT / {category.label.toUpperCase()} {presetName && `· ${presetName}`}
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {loading ? "AI 正在生成推荐…" : `为你找到 ${scored.length} 款合适产品`}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                预算 ≤ {formatPrice(budget)} · 已按你的权重综合排序
              </p>
            </div>
            <ShareButton />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <LoadingState />
        ) : scored.length === 0 ? (
          <EmptyState onReconfigure={reconfigure} />
        ) : (
          <Report
            scored={scored}
            weights={weights}
            catKey={catKey}
            onReconfigure={reconfigure}
          />
        )}
      </div>
    </AppShell>
  );
}

function Report({
  scored, weights, catKey, onReconfigure,
}: {
  scored: Scored[];
  weights: Record<string, number>;
  catKey: string;
  onReconfigure: () => void;
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
        <div className="font-mono text-xs tracking-[0.2em] text-primary mb-3">// TOP RECOMMENDATIONS</div>
        <h2 className="text-xl font-semibold mb-6">三款最匹配你的需求</h2>
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
          <div className="font-mono text-xs tracking-[0.2em] text-primary mb-3">// OTHER CANDIDATES</div>
          <h2 className="text-xl font-semibold mb-6">其他候选 ({rest.length})</h2>
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
          onClick={onReconfigure}
          className="mt-3 inline-flex items-center gap-2 px-5 h-11 rounded-md border bg-card hover-elevate font-medium"
          data-testid="link-reconfigure"
        >
          <RotateCcw className="size-4" /> 调整需求重新生成
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
