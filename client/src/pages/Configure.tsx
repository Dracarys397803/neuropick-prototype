import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BudgetSlider } from "@/components/configure/BudgetSlider";
import { DimensionSliders } from "@/components/configure/DimensionSliders";
import { PresetPicker } from "@/components/configure/PresetPicker";
import { StepIndicator } from "@/components/configure/StepIndicator";
import { Summary } from "@/components/configure/Summary";
import { emptyWeights, getCategory } from "@/lib/dimensions";
import { useRouter } from "@/lib/router";

export default function Configure({ catKey }: { catKey: string }) {
  const { go } = useRouter();
  const category = getCategory(catKey);

  const [step, setStep] = useState<1 | 2>(1);
  const [weights, setWeights] = useState(() => emptyWeights(category.dimensions));
  const [presetIdx, setPresetIdx] = useState<number | null>(null);
  const [budget, setBudget] = useState<number>(category.budget.defaultMax);

  function setDim(key: string, val: number) {
    setWeights((w) => ({ ...w, [key]: val }));
    setPresetIdx(null);
  }

  function applyPreset(i: number) {
    setWeights({ ...category.presets[i].weights });
    setPresetIdx(i);
  }

  function submit() {
    go({
      name: "result",
      catKey,
      weights,
      budget,
      presetName: presetIdx !== null ? category.presets[presetIdx].name : undefined,
    });
  }

  return (
    <AppShell>
      <section className="relative border-b">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-10">
          <button
            type="button"
            onClick={() => go({ name: "home" })}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            data-testid="link-back-home"
          >
            <ArrowLeft className="size-3.5" /> 返回品类
          </button>
          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-mono text-xs tracking-[0.2em] text-primary mb-2">
                // CONFIGURE / {category.label.toUpperCase()}
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">告诉 AI 你的需求画像</h1>
              <p className="mt-2 text-sm text-muted-foreground">{category.tagline}</p>
            </div>
            <StepIndicator step={step} />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {step === 1 ? (
          <div className="space-y-8 fade-up">
            <PresetPicker presets={category.presets} activeIndex={presetIdx} onPick={applyPreset} />
            <DimensionSliders dimensions={category.dimensions} weights={weights} onChange={setDim} />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-primary text-primary-foreground font-medium hover-elevate active-elevate-2 border border-primary-border"
                data-testid="button-step-next"
              >
                下一步 · 预算
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-6 fade-up">
            <BudgetSlider config={category.budget} value={budget} onChange={setBudget} />
            <Summary
              dimensions={category.dimensions}
              weights={weights}
              budget={budget}
              onSubmit={submit}
              onBack={() => setStep(1)}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
