import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SideNav } from "@/components/dashboard/SideNav";
import { TopBar } from "@/components/dashboard/TopBar";
import { StepHeader } from "@/components/dashboard/StepHeader";
import { ProductTypeGrid } from "@/components/dashboard/ProductTypeGrid";
import { BudgetRange } from "@/components/dashboard/BudgetRange";
import { UseCaseChips } from "@/components/dashboard/UseCaseChips";
import { WeightAllocator, useWeightTotal } from "@/components/dashboard/WeightAllocator";
import { RecommendationPreview } from "@/components/dashboard/RecommendationPreview";
import { CommunityCard } from "@/components/dashboard/CommunityCard";
import { getCategory, type DimensionKey } from "@/lib/dimensions";
import { LAPTOP_USE_CASES } from "@/data/useCases";
import { useRouter } from "@/lib/router";
import { useToast } from "@/hooks/use-toast";

/** 笔记本默认的 0..100 权重——大致按截图比例。 */
const DEFAULT_LAPTOP_WEIGHTS: Record<string, number> = {
  performance: 30,
  battery:     20,
  display:     15,
  portability: 10,
  value:        7,
};

export default function Home() {
  const { go } = useRouter();
  const { toast } = useToast();

  // 当前只对 laptop 真正提供配置；其他品类点击时会被 ProductTypeGrid 拦下来 toast。
  const [catKey, setCatKey] = useState<string>("laptop");
  const category = getCategory(catKey);

  const [budget, setBudget] = useState<number>(category.budget.defaultMax);
  const [useCases, setUseCases] = useState<Set<string>>(new Set(["office"]));

  const [weights, setWeights] = useState<Record<string, number>>(
    () => ({ ...DEFAULT_LAPTOP_WEIGHTS })
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(category.dimensions.map((d) => [d.key, true]))
  );

  const total = useWeightTotal(category.dimensions, weights, enabled);

  const disabledDims = useMemo(
    () => category.dimensions.filter((d) => enabled[d.key] === false).map((d) => d.key),
    [category, enabled]
  );

  function toggleUseCase(id: string) {
    setUseCases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function generate() {
    if (total <= 0) {
      toast({
        title: "请先分配权重",
        description: "至少给一个维度一些权重，或者打开一个维度开关。",
      });
      return;
    }
    const dimWeights = category.dimensions.reduce<Record<DimensionKey, number>>((acc, d) => {
      acc[d.key] = weights[d.key] ?? 0;
      return acc;
    }, {} as Record<DimensionKey, number>);

    go({
      name: "result",
      catKey,
      weights: dimWeights,
      budget,
      disabledDims,
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar activeId="advisor" />

      <div className="flex flex-1">
        <SideNav activeId="home" onSelect={() => { /* home: stay */ }} />

        <main className="flex-1 min-w-0 px-4 md:px-6 py-6 bg-muted/30">
          <div className="mx-auto max-w-[1320px] grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 items-start">
            {/* ============ 主配置卡片 ============ */}
            <section className="rounded-2xl bg-card border shadow-sm p-5 md:p-7">
              <header className="mb-5">
                <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight leading-tight">
                  帮你挑真正适合的<span className="text-primary">数码产品</span>
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  根据你的需求和偏好，智能匹配最适合的产品。
                </p>
              </header>

              {/* Step 1 · 产品类型 */}
              <div className="space-y-3 mb-7">
                <StepHeader index={1} title="选择产品类型" />
                <ProductTypeGrid selectedId={catKey} onSelect={setCatKey} />
              </div>

              {/* Step 2 · 预算 */}
              <div className="space-y-3 mb-7">
                <StepHeader index={2} title="设置预算范围" />
                <BudgetRange
                  min={category.budget.min}
                  max={category.budget.max}
                  value={budget}
                  onChange={setBudget}
                />
              </div>

              {/* Step 3 · 用途 */}
              <div className="space-y-3 mb-7">
                <StepHeader
                  index={3}
                  title="主要用途"
                  hint={<span>（可多选）</span>}
                />
                <UseCaseChips
                  options={LAPTOP_USE_CASES}
                  selected={useCases}
                  onToggle={toggleUseCase}
                />
              </div>

              {/* Step 4 · 权重 */}
              <div className="space-y-3 mb-6">
                <StepHeader
                  index={4}
                  title="你的优先级权重"
                  hint={<span>分配 100 分，可开关维度，可自定义</span>}
                  trailing={
                    <span className="text-xs text-muted-foreground">
                      已分配 <span className="font-mono text-foreground font-semibold">{total}</span> / 100
                    </span>
                  }
                />
                <div className="relative h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden>
                  <div
                    className="absolute inset-y-0 left-0 bg-primary transition-[width]"
                    style={{ width: `${Math.min(100, total)}%` }}
                  />
                </div>
                <WeightAllocator
                  dimensions={category.dimensions}
                  weights={weights}
                  enabled={enabled}
                  onWeightChange={(k, v) => setWeights((p) => ({ ...p, [k]: v }))}
                  onToggle={(k, on) => setEnabled((p) => ({ ...p, [k]: on }))}
                />
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={generate}
                className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition inline-flex items-center justify-center gap-2"
                data-testid="button-generate"
              >
                生成我的推荐
                <ArrowRight className="size-4" />
              </button>
              <p className="text-center mt-2 text-[11px] text-muted-foreground">
                预计 1–2 秒完成分析
              </p>
            </section>

            {/* ============ 右侧栏 ============ */}
            <aside className="space-y-4">
              <RecommendationPreview
                catKey={catKey}
                budget={budget}
                weights={weights}
                disabledDims={disabledDims}
              />
              <CommunityCard />
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
