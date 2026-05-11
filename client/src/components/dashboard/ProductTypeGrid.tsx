import { Check } from "lucide-react";
import { PRODUCT_TYPES } from "@/data/productTypes";
import { getIcon } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
};

/**
 * 6 格产品类型选择 —— 只有 laptop 可选，其余 toast「敬请期待」。
 */
export function ProductTypeGrid({ selectedId, onSelect }: Props) {
  const { toast } = useToast();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5" data-testid="product-type-grid">
      {PRODUCT_TYPES.map((p) => {
        const Icon = getIcon(p.icon);
        const active = selectedId === p.id;

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              if (p.available) onSelect(p.id);
              else
                toast({
                  title: `${p.label} · 敬请期待`,
                  description: "我们先把笔记本测评做到最好，再扩展其他品类。",
                });
            }}
            className={[
              "relative flex flex-col items-center justify-center gap-2 h-[88px] rounded-xl border bg-background transition",
              active
                ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                : "hover:border-foreground/20",
              !p.available && "opacity-60",
            ].filter(Boolean).join(" ")}
            data-testid={`product-type-${p.id}`}
            aria-pressed={active}
          >
            <Icon className={["size-6", active ? "text-primary" : "text-muted-foreground"].filter(Boolean).join(" ")} />
            <span className={["text-xs", active ? "font-medium text-foreground" : "text-foreground/80"].filter(Boolean).join(" ")}>
              {p.label}
            </span>
            {active && (
              <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-primary grid place-items-center">
                <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
              </span>
            )}
            {!p.available && (
              <span className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                即将
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
