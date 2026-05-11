import { AppShell } from "@/components/AppShell";
import { CategoryListItem } from "@/components/home/CategoryListItem";
import { QuickStartCard } from "@/components/home/QuickStartCard";
import { ScoringExplain } from "@/components/home/ScoringExplain";
import { CATEGORIES } from "@/lib/dimensions";
import { useRouter } from "@/lib/router";

/**
 * 首页 —— 消费级选购助手布局：
 * - Hero 左边：标题 + 副标题 + CTA
 * - Hero 右边：QuickStartCard（产品类型 / 预算 / 用途）
 * - 下面：品类列表（小卡，状态显式）
 * - 再下面：推荐逻辑说明（6 个维度）
 */
export default function Home() {
  const { go } = useRouter();
  const goConfigure = (key: string) => go({ name: "configure", catKey: key });
  const scrollToScoring = () =>
    document.getElementById("scoring")?.scrollIntoView({ behavior: "smooth" });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 pt-10 md:pt-14 pb-16">
        {/* ============ HERO ============ */}
        <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-[2.5rem] font-semibold tracking-tight leading-[1.15]">
              帮你挑一台真正适合的笔记本
            </h1>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              输入预算、用途和偏好，系统会按性能、续航、屏幕、便携性、价格等维度给出可解释推荐。
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => goConfigure("laptop")}
                className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
                data-testid="button-cta-start"
              >
                开始选择笔记本
              </button>
              <button
                type="button"
                onClick={scrollToScoring}
                className="inline-flex items-center justify-center h-11 px-5 rounded-lg border bg-card text-foreground hover:bg-muted transition"
                data-testid="button-view-scoring"
              >
                查看评分逻辑
              </button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              当前为前端原型，暂未接入实时价格与购买链接。
            </p>
          </div>

          <div className="md:justify-self-end w-full md:max-w-[420px]">
            <QuickStartCard onStart={goConfigure} />
          </div>
        </section>

        {/* ============ CATEGORIES ============ */}
        <section className="mt-16 md:mt-20">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight">支持的品类</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                当前先做透笔记本，其他品类陆续开放。
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryListItem key={cat.key} category={cat} onPick={goConfigure} />
            ))}
          </div>
        </section>

        {/* ============ SCORING EXPLAIN ============ */}
        <ScoringExplain />
      </div>
    </AppShell>
  );
}
