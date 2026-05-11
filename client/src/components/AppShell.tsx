import { useEffect, useState } from "react";
import { Github, Moon, Sun } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/lib/dimensions";
import { useRouter } from "@/lib/router";

const REPO_URL = "https://github.com/Dracarys397803/neuropick-prototype";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const { go } = useRouter();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/85 border-b">
        <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go({ name: "home" })}
            className="bg-transparent"
            data-testid="button-logo"
            aria-label="返回首页"
          >
            <Logo />
          </button>

          <nav className="flex items-center gap-1 text-sm">
            {CATEGORIES.map((cat) => {
              const disabled = cat.status === "coming-soon";
              const shortLabel = cat.label.replace("智能", "").replace("无线", "");
              return (
                <button
                  key={cat.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && go({ name: "configure", catKey: cat.key })}
                  className={[
                    "hidden md:inline-flex px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition",
                    disabled && "opacity-50 cursor-not-allowed hover:text-muted-foreground hover:bg-transparent",
                  ].filter(Boolean).join(" ")}
                  data-testid={`link-nav-${cat.key}`}
                  title={disabled ? "即将支持" : undefined}
                >
                  {shortLabel}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="ml-2 size-9 grid place-items-center rounded-md border bg-card hover:bg-muted transition"
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
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t mt-12">
        <div className="mx-auto w-full max-w-[1120px] px-5 md:px-8 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Neuropick · 前端原型，产品数据仅供参考</span>
          <span className="opacity-70">v0.2.0</span>
        </div>
      </footer>
    </div>
  );
}
