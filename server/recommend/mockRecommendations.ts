/**
 * Mock fallback —— AI 失败/无 key 时返回的「演示数据」。
 *
 * 复用 `shared/recommend/scoring.ts` 与 `shared/recommend/products.ts`,
 * 不重复一份数据。这样 client 实时预览的 Top 3 与 server fallback
 * 走的是同一套排序逻辑,行为一致。
 */
import {
  scoreProducts,
  type Scored,
} from "../../shared/recommend/scoring";
import { getCategory } from "../../shared/recommend/dimensions";
import type {
  RecommendRequest,
  RecommendedProduct,
} from "../../shared/recommend/types";

/** 返回前 N 个候选,数量上限 = 10(笔记本 mock 当前有 11 个;前端 Result 页用前 10) */
const MAX_RESULTS = 10;

export function getMockRecommendations(req: RecommendRequest): RecommendedProduct[] {
  const category = getCategory(req.category);
  const disabledSet = new Set(req.disabledDimensions);
  const scored: Scored[] = scoreProducts(category, req.weights, req.budget, disabledSet);

  return scored.slice(0, MAX_RESULTS).map(toRecommended);
}

function toRecommended(s: Scored): RecommendedProduct {
  // 把 Scored 翻译成 wire-friendly 的 RecommendedProduct。
  // dimensions 用 product.scores 原值(0-100),保持与 AI 路径一致。
  return {
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
  };
}
