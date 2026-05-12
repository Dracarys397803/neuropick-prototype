/**
 * Re-export shared scoring 给 client UI 用。
 * 真正的实现在 `shared/recommend/scoring.ts`(server fallback 也会复用)。
 */
export type {
  Weights,
  DimensionContribution,
  Scored,
} from "@shared/recommend/scoring";

export { scoreProducts } from "@shared/recommend/scoring";
