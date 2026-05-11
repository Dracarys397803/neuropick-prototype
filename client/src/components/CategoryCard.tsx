import { ArrowRight } from "lucide-react";
import type { CategoryMeta } from "@/lib/dimensions";
import { getIcon } from "@/lib/icons";

type Props = {
  category: CategoryMeta;
  index: number;
  onPick: (key: CategoryMeta["key"]) => void;
};

export function CategoryCard({ category, index, onPick }: Props) {
  const Icon = getIcon(category.navIcon);
  return (
    <button
      type="button"
      onClick={() => onPick(category.key)}
      className="group relative block text-left p-6 rounded-xl border bg-card hover-elevate overflow-hidden fade-up"
      style={{ animationDelay: `${0.1 + index * 0.08}s` }}
      data-testid={`card-category-${category.key}`}
    >
      <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="size-10 rounded-lg border bg-background grid place-items-center text-primary">
            <Icon className="size-5" />
          </div>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
            0{index + 1}
          </span>
        </div>
        <h3 className="mt-5 text-lg font-semibold">{category.label}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{category.tagline}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {category.dimensions.slice(0, 4).map((d) => (
            <span
              key={d.key}
              className="text-[10px] font-mono px-2 py-0.5 rounded border bg-background text-muted-foreground"
            >
              {d.label}
            </span>
          ))}
        </div>
        <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          开始配置
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}
