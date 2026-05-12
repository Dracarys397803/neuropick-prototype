import { useCallback, useMemo, useState } from "react";
import { ArrowRight, AlertCircle, CheckCircle2, RotateCcw, Loader2 } from "lucide-react";
import { SideNav } from "@/components/dashboard/SideNav";
import { TopBar } from "@/components/dashboard/TopBar";
import { StepHeader } from "@/components/dashboard/StepHeader";
import { ProductTypeGrid } from "@/components/dashboard/ProductTypeGrid";
import { BudgetRange } from "@/components/dashboard/BudgetRange";
import { UseCaseChips } from "@/components/dashboard/UseCaseChips";
import { WeightAllocator, useWeightTotal } from "@/components/dashboard/WeightAllocator";
import { RecommendationPreview } from "@/components/dashboard/RecommendationPreview";
import { CommunityCard } from "@/components/dashboard/CommunityCard";
import { getCategory, buildDimWeights } from "@/lib/dimensions";
import { LAPTOP_USE_CASES } from "@/data/useCases";
import { useRouter } from "@/lib/router";
import { useToast } from "@/hooks/use-toast";
import { fetchRecommendations } from "@/lib/recommendApi";

/**
 * 笔记本默认 0..100 权重 —— 严格等于 100。
 * (performance 30 + battery 20 + display 20 + portability 15 + value 15 = 100)
 */
const DEFAULT_LAPTOP_WEIGHTS: Record<string, number> = {
  performance: 30,
  battery:     20,
  display:     20,
  portability: 15,
  value:       15,
};

export default function Home() {
  const { go } = useRouter();
  const { toast } = useToast();

  // 当前只对 laptop 真正提供配置;其他品类点击会被 ProductTypeGrid 拦下来 toast。
  const [catKey, setCatKey] = useState<string>("laptop");
  const category = getCategory(catKey);

  const [budget, setBudget] = useState<number>(category.budget.defaultMax);
  // TODO(use-cases): useCases 当前只是 UI 装饰(影响 chips 高亮),没有进入打分。
  // 等真的把「主要用途」接入打分时,要么映射成 weights 微调,要么作为独立维度。
  const [useCases, setUseCases] = useState<Set<string>>(new Set(["office"]));

  const [weights, setWeights] = useState<Record<string, number>>(
    () => ({ ...DEFAULT_LAPTOP_WEIGHTS })
  );
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(category.dimensions.map((d) => [d.key, true]))
  );
  /** “生成”按钮是否正在调用 /api/recommend。 */
  const [submitting, setSubmitting] = useState(false);

  const total = useWeightTotal(category.dimensions, weights, enabled);
  /** 严格 100 分约束:total 必须正好等于 100 才允许提交。 */
  const isValid = total === 100;
  const remaining = 100 - total;

  const disabledDims = useMemo(
    () => category.dimensions.filter((d) => enabled[d.key] === false).map((d) => d.key),
    [category, enabled]
  );

  const toggleUseCase = useCallback((id: string) => {
    setUseCases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleWeightChange = useCallback((k: string, v: number) => {
    setWeights((p) => ({ ...p, [k]: v }));
  }, []);

  const handleToggle = useCallback((k: string, on: boolean) => {
    setEnabled((p) => ({ ...p, [k]: on }));
  }, []);

  const handleReset = useCallback((next: Record<string, number>) => {
    setWeights(next);
  }, []);

  const resetToDefault = useCallback(() => {
    setWeights({ ...DEFAULT_LAPTOP_WEIGHTS });
    setEnabled(Object.fromEntries(category.dimensions.map((d) => [d.key, true])));
  }, [category]);

  async function generate() {
    if (!isValid) {
      toast({
        title: total > 100 ? "权重超出 100 分" : "权重不足 100 分",
        description: `当前已分配 ${total} 分,请调到正好 100 分再生成。`,
      });
      return;
    }
    if (submitting) return;

    // 把所有启用维度的权重透传到 result;关闭维度通过 disabledDims 告知。
    const disabledSet = new Set(
      category.dimensions.filter((d) => enabled[d.key] === false).map((d) => d.key)
    );
    const dimWeights = buildDimWeights(category.dimensions, weights, disabledSet);

    setSubmitting(true);
    // 注意:fetchRecommendations 内部已双保险 —— 服务端业务失败返 mock、
    // 前端 fetch 本身出错也走本地 mock。这里拿到的 res 始终是合法对象。
    const res = await fetchRecommendations({
      category: catKey,
      budget,
      useCases: Array.from(useCases),
      weights: dimWeights,
      disabledDimensions: disabledDims,
    });
    setSubmitting(false);

    go({
      name: "result",
      catKey,
      weights: dimWeights,
      budget,
      disabledDims,
      products: res.products,
      source: res.source,
    });
  }

  /** 左侧栏 / 顶部栏点击「首页」时停留在当前页(已经是首页)。 */
  const stayHome = useCallback(() => {
    go({ name: "home" });
  }, [go]);

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar activeId="advisor" />

      <div className="flex flex-1">
        <SideNav activeId="home" onSelect={stayHome} />

        <main className="flex-1 min-w-0 px-4 md:px-6 py-6 bg-muted/30">
          <div className="mx-auto max-w-[1320px] grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">
            {/* ============ 主配置卡片 ============ */}
            <section className="rounded-2xl bg-card border shadow-sm p-5 md:p-7">
              <header className="mb-5">
                <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight leading-tight">
                  帮你挑真正适合的<span className="text-primary">数码产品</span>
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  根据你的需求和偏好,智能匹配最适合的产品。
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
                  hint={<span>(可多选)</span>}
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
                  hint={<span>必须严格分配 100 分</span>}
                  trailing={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={resetToDefault}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
                        data-testid="button-reset-weights"
                        title="恢复默认权重"
                      >
                        <RotateCcw className="size-3" /> 重置
                      </button>
                      <WeightBadge total={total} />
                    </div>
                  }
                />
                <WeightProgressBar total={total} />
                <WeightAllocator
                  dimensions={category.dimensions}
                  weights={weights}
                  enabled={enabled}
                  onWeightChange={handleWeightChange}
                  onToggle={handleToggle}
                  onReset={handleReset}
                />
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={generate}
                disabled={!isValid || submitting}
                className={[
                  "w-full h-12 rounded-lg font-medium transition inline-flex items-center justify-center gap-2",
                  isValid && !submitting
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                ].join(" ")}
                data-testid="button-generate"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    正在搜索真实评测与价格…
                  </>
                ) : (
                  <>
                    生成我的推荐
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
              <p
                className={[
                  "text-center mt-2 text-[11px]",
                  isValid ? "text-muted-foreground" : "text-amber-600 dark:text-amber-400",
                ].join(" ")}
                data-testid="generate-hint"
              >
                {submitting
                  ? "正在调用推荐服务…"
                  : isValid
                    ? "预计 1–2 秒完成分析"
                    : remaining > 0
                      ? `还需要分配 ${remaining} 分才能生成`
                      : `已超出 ${-remaining} 分,请调低后再生成`}
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

/** 已分配 X / 100 徽章 —— 三态:不足 / 正好 / 超出。 */
function WeightBadge({ total }: { total: number }) {
  const state =
    total === 100 ? "ok" : total > 100 ? "over" : "under";
  const cls =
    state === "ok"
      ? "text-emerald-600 dark:text-emerald-400 border-emerald-300/40 bg-emerald-500/10"
      : state === "over"
        ? "text-red-600 dark:text-red-400 border-red-300/40 bg-red-500/10"
        : "text-amber-600 dark:text-amber-400 border-amber-300/40 bg-amber-500/10";
  const Icon = state === "ok" ? CheckCircle2 : AlertCircle;
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
        cls,
      ].join(" ")}
      data-testid="weight-badge"
      data-state={state}
    >
      <Icon className="size-3" />
      <span className="font-mono">{total}</span>
      <span className="opacity-60">/ 100</span>
    </span>
  );
}

/** 进度条 —— 0..100 显示绿色,>100 部分用红色提示。 */
function WeightProgressBar({ total }: { total: number }) {
  const filled = Math.min(100, total);
  const over = Math.max(0, total - 100);
  return (
    <div
      className="relative h-1.5 rounded-full bg-muted overflow-hidden"
      aria-hidden
      data-testid="weight-progress"
    >
      <div
        className={[
          "absolute inset-y-0 left-0 transition-[width]",
          total === 100 ? "bg-emerald-500" : "bg-primary",
        ].join(" ")}
        style={{ width: `${filled}%` }}
      />
      {over > 0 && (
        <div
          className="absolute inset-y-0 right-0 bg-red-500 transition-[width]"
          style={{ width: `${Math.min(100, over)}%` }}
        />
      )}
    </div>
  );
}
