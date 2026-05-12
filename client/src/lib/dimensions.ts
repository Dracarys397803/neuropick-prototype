/**
 * Re-export shared dimensions(纯数据)给 client UI 用。
 *
 * 真正的「单一事实来源」在 `shared/recommend/dimensions.ts`,
 * 这里只是为了让大量旧 import("@/lib/dimensions") 不需要改路径。
 *
 * UI 专属辅助(图标映射等)留在 `@/lib/icons` 里,不在这里。
 */
export type {
  DimensionKey,
  Dimension,
  CategoryKey,
  CategoryMeta,
  BudgetConfig,
} from "@shared/recommend/dimensions";

export {
  CATEGORIES,
  getCategory,
  buildDimWeights,
  formatPrice,
} from "@shared/recommend/dimensions";
