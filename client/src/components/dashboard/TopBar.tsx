import { Bell, Search, User, Github, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { TOP_NAV } from "@/data/navigation";
import { useRouter } from "@/lib/router";
import { useToast } from "@/hooks/use-toast";

const REPO_URL = "https://github.com/Dracarys397803/neuropick-prototype";

type Props = {
  activeId: string;
};

/**
 * 顶部导航条 ——
 * 左侧 Logo，中间 5 个导航 Tab（只有「选购助手」可点），
 * 右侧搜索框（占位）+ 通知 + 头像 + 主题切换 + GitHub。
 */
export function TopBar({ activeId }: Props) {
  const { go } = useRouter();
  const { toast } = useToast();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const comingSoon = (label: string) =>
    toast({ title: `${label} · 敬请期待`, description: "笔记本测评流程稳定后会陆续开放。" });

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/85 border-b">
      <div className="h-14 px-4 md:px-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => go({ name: "home" })}
          className="bg-transparent shrink-0"
          data-testid="button-logo"
          aria-label="返回首页"
        >
          <Logo />
        </button>

        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {TOP_NAV.map((item) => {
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => (item.available ? null : comingSoon(item.label))}
                className={[
                  "relative px-3 py-1.5 rounded-md text-sm transition",
                  active
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  !item.available && "opacity-70",
                ].filter(Boolean).join(" ")}
                data-testid={`top-nav-${item.id}`}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-[5px] left-3 right-3 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => comingSoon("搜索")}
            className="hidden lg:flex items-center gap-2 h-9 w-[200px] px-3 rounded-md border bg-card text-xs text-muted-foreground hover:bg-muted transition"
            data-testid="search-trigger"
          >
            <Search className="size-3.5" />
            <span>搜索产品、评测、用户</span>
          </button>
          <button
            type="button"
            onClick={() => comingSoon("通知")}
            className="size-9 grid place-items-center rounded-md border bg-card hover:bg-muted transition"
            aria-label="通知"
            data-testid="button-notifications"
          >
            <Bell className="size-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => comingSoon("个人中心")}
            className="size-9 grid place-items-center rounded-md border bg-card hover:bg-muted transition"
            aria-label="个人中心"
            data-testid="button-profile"
          >
            <User className="size-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setDark((d) => !d)}
            className="size-9 grid place-items-center rounded-md border bg-card hover:bg-muted transition"
            aria-label="切换主题"
            data-testid="button-theme-toggle"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="size-9 grid place-items-center rounded-md border bg-card hover:bg-muted transition"
            aria-label="GitHub"
            data-testid="link-github"
          >
            <Github className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
