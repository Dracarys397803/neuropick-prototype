import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { RecommendedProduct } from "@shared/recommend/types";

/**
 * 内存路由 —— 只保留两个视图:
 * - home:     新版 dashboard 首页(选品 + 权重 + 实时预览)
 * - result:   生成后的推荐报告页
 *
 * 旧的 `configure` 视图已废弃并删除,所有"返回 / 修改条件"操作都回到 home。
 *
 * `products` / `source` 是 POC 加的字段:Home 发 /api/recommend 拿到结果后
 * 直接透传给 Result,Result 不再本地运行 scoreProducts。
 * 两个字段均为可选——缺了 Result 页会用本地 mock 兜底(刷新/跳转丢状态场景)。
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
      /** 服务端返回的推荐列表。缺 = Result 本地走 mock 兜底。 */
      products?: RecommendedProduct[];
      /** 推荐来源。缺 = "mock"。 */
      source?: "ai" | "mock";
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
