/**
 * Re-export shared mock products 给 client UI 用。
 * 真实数据源在 `shared/recommend/products.ts`(供 server fallback 复用)。
 */
export type {
  BuyLink,
  Spec,
  ProductScores,
  Product,
} from "@shared/recommend/products";

export {
  MOCK_PRODUCTS,
  getProducts,
} from "@shared/recommend/products";
