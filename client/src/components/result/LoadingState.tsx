import { useEffect, useState } from "react";

const STEPS = ["扫描候选产品", "解析维度权重", "匹配预算约束", "生成最终排序"];

export function LoadingState() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((a) => Math.min(a + 1, STEPS.length - 1)), 260);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card">
          <span className="size-2 rounded-full bg-primary pulse-dot" />
          <span className="font-mono text-xs tracking-widest text-muted-foreground">PROCESSING</span>
        </div>
      </div>
      <div className="space-y-3">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-3 transition-opacity ${i <= active ? "opacity-100" : "opacity-30"}`}
          >
            <div
              className={`size-5 rounded-full grid place-items-center text-[10px] font-mono ${
                i <= active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i <= active ? "✓" : i + 1}
            </div>
            <span className="text-sm font-mono">{s}</span>
            {i === active && (
              <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent shimmer" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
