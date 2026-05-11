import { ArrowRight } from "lucide-react";
import type { CategoryMeta } from "@/lib/dimensions";
import { getIcon } from "@/lib/icons";

type Props = {
  category: CategoryMeta;
  onPick: (key: CategoryMeta["key"]) => void;
};

/**
 * 小型品类卡片。
 * 比之前的官网式大卡更克制：图标 + 名字 + 一句话 + 状态标签。
 */
export function CategoryListItem({ category, onPick }: Props) {
  const Icon = getIcon(category.navIcon);
  const available = category.status === "available";

  return (
    <button
      type="button"
      disabled={!available}
      onClick={() => available && onPick(category.key)}
      className={[
        "group flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition",
        available
          ? "hover:border-foreground/20 hover:shadow-sm cursor-pointer"
          : "opacity-70 cursor-not-allowed",
      ].join(" ")}
      data-testid={`card-category-${category.key}`}
    >
      <div className="size-9 shrink-0 rounded-lg border bg-background grid place-items-center text-primary">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{category.label}</h3>
          <span
            className={[
              "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              available
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            ].join(" ")}
          >
            {available ? "可用" : "即将支持"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {category.tagline}
        </p>
        {available && (
          <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
            开始
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </button>
  );
}
