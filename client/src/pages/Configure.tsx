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
      <section className="border-b">
        <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 py-8">
          <button
            type="button"
            onClick={() => go({ name: "home" })}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            data-testid="link-back-home"
          >
            <ArrowLeft className="size-3.5" /> 返回首页
          </button>
          <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">调一下你的需求</h1>
              <p className="mt-2 text-sm text-muted-foreground">{category.label} · {category.tagline}</p>
            </div>
            <StepIndicator step={step} />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 py-10">
        {step === 1 ? (
          <div className="space-y-8 fade-up">
            <PresetPicker presets={category.presets} activeIndex={presetIdx} onPick={applyPreset} />
            <DimensionSliders dimensions={category.dimensions} weights={weights} onChange={setDim} />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
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
