import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type View =
  | { name: "home" }
  | { name: "configure"; catKey: string }
  | { name: "result"; catKey: string; weights: Record<string, number>; budget: number; presetName?: string };

type Ctx = {
  view: View;
  go: (v: View) => void;
};

const RouterCtx = createContext<Ctx | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>({ name: "home" });
  const go = useCallback((v: View) => {
    setView(v);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);
  return <RouterCtx.Provider value={{ view, go }}>{children}</RouterCtx.Provider>;
}

export function useRouter() {
  const c = useContext(RouterCtx);
  if (!c) throw new Error("useRouter must be inside RouterProvider");
  return c;
}
