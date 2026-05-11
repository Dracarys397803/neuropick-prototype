import { ArrowRight, BarChart3, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CategoryCard } from "@/components/CategoryCard";
import { CATEGORIES } from "@/lib/dimensions";
import { useRouter } from "@/lib/router";

const HERO_STATS = [
  { k: "200+", v: "实时跟踪产品" },
  { k: "6", v: "评分维度" },
  { k: "<10s", v: "推荐生成" },
  { k: "0", v: "广告干扰" },
];

const WORKFLOW = [
  { icon: Zap, title: "调节权重", desc: "为性能、续航、便携性等维度打分，告诉 AI 你最在意什么。" },
  { icon: ShieldCheck, title: "设定预算", desc: "明确预算上下限，避免「看起来好但买不起」的尴尬推荐。" },
  { icon: BarChart3, title: "查看报告", desc: "AI 综合评分排序，附维度雷达、对比卡片与一键购买链接。" },
];

export default function Home() {
  const { go } = useRouter();
  const goConfigure = (key: string) => go({ name: "configure", catKey: key });
  const scrollToCategories = () =>
    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });

  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40 dark:opacity-30 pointer-events-none" />
        <div className="absolute inset-0 scanline pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card/60 backdrop-blur-sm fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="size-1.5 rounded-full bg-primary pulse-dot" />
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
              AI · HARDWARE · INTELLIGENCE
            </span>
          </div>

          <h1
            className="mt-6 max-w-3xl text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] fade-up"
            style={{ animationDelay: "0.15s" }}
          >
            告诉它你看重什么，<br />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent glow-text">
              AI 给你最合适的 3C 硬件
            </span>
          </h1>

          <p
            className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed fade-up"
            style={{ animationDelay: "0.25s" }}
          >
            不再被参数表淹没。设置预算、调节维度权重，三步获得带购买链接的个性化推荐报告。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3 fade-up" style={{ animationDelay: "0.35s" }}>
            <button
              type="button"
              onClick={() => goConfigure("laptop")}
              className="group relative inline-flex items-center gap-2 px-5 h-11 rounded-md bg-primary text-primary-foreground font-medium hover-elevate active-elevate-2 border border-primary-border"
              data-testid="button-cta-start"
            >
              <Sparkles className="size-4" />
              开始智能选购
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={scrollToCategories}
              className="inline-flex items-center gap-2 px-5 h-11 rounded-md border bg-card/50 backdrop-blur-sm hover-elevate font-medium"
              data-testid="button-browse-categories"
            >
              浏览品类
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl fade-up" style={{ animationDelay: "0.45s" }}>
            {HERO_STATS.map((s) => (
              <div key={s.v} className="border-l border-primary/40 pl-4">
                <div className="font-mono text-2xl font-semibold">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono text-xs tracking-[0.2em] text-primary mb-2">// 01 / SELECT</div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">选一个品类开始</h2>
          </div>
          <span className="hidden md:block text-sm text-muted-foreground">每个品类都有专属维度</span>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, idx) => (
            <CategoryCard key={cat.key} category={cat} index={idx} onPick={goConfigure} />
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-t border-b bg-card/40">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="font-mono text-xs tracking-[0.2em] text-primary mb-2">// 02 / WORKFLOW</div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-12">三步获得专属推荐</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {WORKFLOW.map((s, i) => (
              <div key={s.title} className="relative p-6 rounded-xl border bg-background">
                <div className="font-mono text-xs text-muted-foreground absolute top-4 right-4">
                  STEP_{String(i + 1).padStart(2, "0")}
                </div>
                <s.icon className="size-6 text-primary" />
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
