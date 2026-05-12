import { createContext, useContext, useState, useCallback, ReactNode } from "react";

/**
 * 内存路由 —— 只保留两个视图:
 * - home:     新版 dashboard 首页(选品 + 权重 + 实时预览)
 * - result:   生成后的推荐报告页
 *
 * 旧的 `configure` 视图已废弃并删除,所有"返回 / 修改条件"操作都回到 home。
 */
export type View =
  | { name: "home" }
  | {
      name: "result";
      catKey: string;
      weights: Record<string, number>;
      budget: number;
      /** 被用户关闭的维度 key。不传 = 全部启用。 */
      disabledDims?: string[];
    };

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
