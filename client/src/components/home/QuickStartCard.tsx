import { useState } from "react";
import { ArrowRight, Sliders, Lock } from "lucide-react";
import { CATEGORIES, getCategory, formatPrice } from "@/lib/dimensions";
import { LAPTOP_USE_CASES } from "@/data/useCases";
import { getIcon } from "@/lib/icons";

type Props = {
  /** 「开始生成推荐」点击 —— 直接跳到 configure（暂不传 useCase/budget，配置页内可微调）。 */
  onStart: (catKey: string) => void;
};

/**
 * 首屏右侧的「Quick Start Card」——
 * 让用户在 hero 区就能直接开始：选品类 → 设预算 → 选用途 → 进入配置。
 *
 * 注意：本次不接真实 AI，所以这里的本地状态只是为了让用户「上手感」更顺，
 * 真正的权重打分依旧在 Configure 页完成。
 */
export function QuickStartCard({ onStart }: Props) {
  const laptop = getCategory("laptop");

  const [catKey, setCatKey] = useState<string>("laptop");
  const [budget, setBudget] = useState<number>(laptop.budget.defaultMax);
  const [useCases, setUseCases] = useState<Set<string>>(new Set(["office"]));

  function toggleUseCase(id: string) {
    setUseCases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      className="rounded-2xl border bg-card shadow-sm p-6 md:p-7 w-full"
      data-testid="card-quick-start"
    >
      <div className="text-sm font-medium text-foreground">快速开始</div>
      <p className="mt-1 text-xs text-muted-foreground">填一两项就能看到推荐，后续可在下一步微调。</p>

      {/* 产品类型 */}
      <fieldset className="mt-5">
        <legend className="text-xs font-medium text-muted-foreground mb-2">产品类型</legend>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = getIcon(cat.navIcon);
            const active = catKey === cat.key;
            const disabled = cat.status === "coming-soon";
            return (
              <button
                key={cat.key}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setCatKey(cat.key)}
                aria-pressed={active}
                className={[
                  "relative flex flex-col items-start gap-1.5 rounded-lg border px-3 py-2.5 text-left transition",
                  active
                    ? "border-primary/70 bg-primary/5 text-foreground"
                    : "bg-background text-foreground/80 hover:border-foreground/20",
                  disabled && "opacity-60 cursor-not-allowed",
                ].filter(Boolean).join(" ")}
                data-testid={`quickstart-cat-${cat.key}`}
              >
                <Icon className="size-4 text-primary" />
                <span className="text-xs font-medium">
                  {cat.label.replace("智能", "").replace("无线", "")}
                </span>
                {disabled && (
                  <span className="absolute top-1.5 right-1.5 inline-flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    <Lock className="size-2.5" /> 即将
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 预算 */}
      <fieldset className="mt-5">
        <legend className="text-xs font-medium text-muted-foreground mb-2 flex items-center justify-between">
          <span>预算上限</span>
          <span className="font-mono text-foreground" data-testid="quickstart-budget-value">
            {formatPrice(budget)}
          </span>
        </legend>
        <input
          type="range"
          min={laptop.budget.min}
          max={laptop.budget.max}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-primary"
          data-testid="quickstart-budget-slider"
          aria-label="预算上限"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>{formatPrice(laptop.budget.min)}</span>
          <span>{formatPrice(laptop.budget.max)}</span>
        </div>
      </fieldset>

      {/* 主要用途 chips */}
      <fieldset className="mt-5">
        <legend className="text-xs font-medium text-muted-foreground mb-2">主要用途（可多选）</legend>
        <div className="flex flex-wrap gap-1.5">
          {LAPTOP_USE_CASES.map((u) => {
            const active = useCases.has(u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleUseCase(u.id)}
                aria-pressed={active}
                className={[
                  "px-2.5 py-1 rounded-full border text-xs transition",
                  active
                    ? "border-primary/70 bg-primary/10 text-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground hover:border-foreground/20",
                ].join(" ")}
                data-testid={`quickstart-usecase-${u.id}`}
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 偏好权重入口（这里只展示，真正调节在 configure 页） */}
      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <Sliders className="size-3.5" />
        <span>下一步可微调：性能 · 续航 · 屏幕 · 便携 · 价格</span>
      </div>

      <button
        type="button"
        onClick={() => onStart(catKey)}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
        data-testid="quickstart-submit"
      >
        开始生成推荐
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}
