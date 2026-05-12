/**
 * 前端调 /api/recommend 的胶水层。
 *
 * 双保险:
 *   1. server 端 routes 即使遇到 AI 失败也会返回 source="mock"(永不 5xx)。
 *   2. 但 fetch 本身可能失败(网络断、CORS、URL 输错等),
 *      这里再加一层本地 mock 兜底,保证 UI 永远拿得到 products。
 *
 * UI 端只需要根据返回的 `source` 决定徽章文案,不关心是哪种失败。
 */
import { scoreProducts } from "./scoring";
import { getCategory } from "./dimensions";
import type {
  RecommendRequest,
  RecommendedProduct,
  RecommendResponse,
} from "@shared/recommend/types";

const REQUEST_TIMEOUT_MS = 15000;

// 与 queryClient.ts 同款占位符:
//   - 本地 dev: API_BASE = "",fetch("/api/recommend")
//   - deploy 后: deploy_website 把 "__PORT_5000__" 替换成代理路径,
//     fetch 走到 Express 后端
const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export async function fetchRecommendations(
  req: RecommendRequest
): Promise<RecommendResponse> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    if (!res.ok) {
      // 这条路径不应该走到 —— routes.ts 设计上业务失败也返 200。
      // 但万一前面有 reverse proxy 或部署事故,仍要兜底。
      throw new Error(`HTTP ${res.status}`);
    }
    const body = (await res.json()) as RecommendResponse;
    // 信任 server side schema —— 它已经 zod 校验过了
    return body;
  } catch (err) {
    // 网络异常 / 超时 / 解析失败 -> 前端本地 mock,确保 UI 不白屏
    return {
      source: "mock",
      products: localMockRecommendations(req),
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 完全跑在浏览器里的 mock —— 与 server 的 mockRecommendations 同一套 scoring,
 * 但数据走 client 已经 bundle 的 shared/recommend/products(再次复用,不重复)。
 *
 * 仅在 fetch 完全炸掉时调用。
 */
export function localMockRecommendations(
  req: RecommendRequest
): RecommendedProduct[] {
  const category = getCategory(req.category);
  const disabledSet = new Set(req.disabledDimensions);
  const scored = scoreProducts(category, req.weights, req.budget, disabledSet);
  return scored.slice(0, 10).map((s) => ({
    id: s.product.id,
    brand: s.product.brand,
    name: s.product.name,
    price: s.product.price,
    tagline: s.product.tagline,
    score: s.matchPct,
    highlights: s.product.highlights,
    pros: s.product.pros,
    cons: s.product.cons,
    dimensions: { ...s.product.scores },
    accent: s.product.accent,
  }));
}
