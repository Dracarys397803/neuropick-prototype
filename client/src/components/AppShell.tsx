import { useEffect, useState } from "react";
import { Github, Moon, Sun } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORIES } from "@/lib/dimensions";
import { useRouter } from "@/lib/router";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);
  const { go } = useRouter();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            type="button"
            onClick={() => go({ name: "home" })}
            className="bg-transparent"
            data-testid="button-logo"
          >
            <Logo />
          </button>
          <nav className="flex items-center gap-1 text-sm">
            <button
              type="button"
              onClick={() => go({ name: "home" })}
              className="hidden sm:inline-flex px-3 py-1.5 rounded-md hover-elevate text-muted-foreground hover:text-foreground"
              data-testid="link-nav-home"
            >
              首页
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => go({ name: "configure", catKey: cat.key })}
                className="hidden md:inline-flex px-3 py-1.5 rounded-md hover-elevate text-muted-foreground hover:text-foreground"
                data-testid={`link-nav-${cat.key}`}
              >
                {cat.label.replace("智能", "").replace("无线", "")}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="ml-2 size-9 grid place-items-center rounded-md border hover-elevate"
              aria-label="切换主题"
              data-testid="button-theme-toggle"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="size-9 grid place-items-center rounded-md border hover-elevate"
              aria-label="GitHub"
              data-testid="link-github"
            >
              <Github className="size-4" />
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono tracking-wider">© 2026 NEUROPICK · 原型演示，产品数据仅供参考</span>
          <span className="font-mono opacity-60">v0.1.0 · prototype</span>
        </div>
      </footer>
    </div>
  );
}
