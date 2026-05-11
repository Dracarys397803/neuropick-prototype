import { Lock } from "lucide-react";
import { SIDE_NAV } from "@/data/navigation";
import { getIcon } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

type Props = {
  activeId: string;
  onSelect: (id: string) => void;
};

/**
 * 左侧侧栏导航 —— 8 项。
 * 只有 "home" 和 "advisor" 是 available；其他点击弹 toast「敬请期待」。
 */
export function SideNav({ activeId, onSelect }: Props) {
  const { toast } = useToast();

  return (
    <aside
      className="hidden md:flex flex-col w-[180px] shrink-0 border-r bg-card/40 px-3 py-5 sticky top-14 self-start h-[calc(100vh-3.5rem)] overflow-y-auto"
      data-testid="sidebar-nav"
    >
      <nav className="flex flex-col gap-0.5">
        {SIDE_NAV.map((item) => {
          const Icon = getIcon(item.icon);
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.available) {
                  onSelect(item.id);
                } else {
                  toast({
                    title: `${item.label} · 敬请期待`,
                    description: "笔记本测评流程稳定后会陆续开放。",
                  });
                }
              }}
              className={[
                "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition relative",
                active
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
                !item.available && "opacity-70",
              ].filter(Boolean).join(" ")}
              data-testid={`side-nav-${item.id}`}
            >
              <Icon className={["size-4 shrink-0", active && "text-primary"].filter(Boolean).join(" ")} />
              <span className="flex-1 text-left">{item.label}</span>
              {!item.available && (
                <Lock className="size-3 opacity-60" aria-label="敬请期待" />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
