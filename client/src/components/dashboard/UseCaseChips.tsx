import { Check } from "lucide-react";
import type { UseCase } from "@/data/useCases";

type Props = {
  options: UseCase[];
  selected: Set<string>;
  onToggle: (id: string) => void;
};

/**
 * 多选 chips —— 选中时左侧出现勾。
 */
export function UseCaseChips({ options, selected, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2" data-testid="use-case-chips">
      {options.map((u) => {
        const active = selected.has(u.id);
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => onToggle(u.id)}
            aria-pressed={active}
            className={[
              "inline-flex items-center gap-1 h-8 px-3 rounded-full border text-xs transition",
              active
                ? "border-primary bg-primary/10 text-foreground"
                : "bg-card text-muted-foreground hover:text-foreground hover:border-foreground/20",
            ].join(" ")}
            data-testid={`use-case-${u.id}`}
          >
            {u.label}
            {active && <Check className="size-3 text-primary" strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}
