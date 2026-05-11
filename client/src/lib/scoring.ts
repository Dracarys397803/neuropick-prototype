/**
 * 评分逻辑：纯函数，不依赖任何 UI。
 *
 * 输入：品类元信息 + 用户权重 + 预算
 * 输出：排序后的候选列表，附带每个维度的加权贡献
 */
import type { CategoryMeta, DimensionKey } from "./dimensions";
import { getProducts, type Product } from "./mockProducts";

export type Weights = Record<DimensionKey, number>; // 0..5 importance

export type DimensionContribution = {
  key: DimensionKey;
  weight: number;
  raw: number;
  weighted: number;
};

export type Scored = {
  product: Product;
  totalScore: number;                       // 0..100 (weighted + bonus)
  dimensionContrib: DimensionContribution[];
  matchPct: number;                         // 0..100 rounded for UI
};

/** 允许略超预算的容忍度（5%） */
const BUDGET_TOLERANCE = 1.05;
/** 预算契合奖励上限 */
const BUDGET_BONUS_MAX = 5;

export function scoreProducts(
  category: CategoryMeta,
  weights: Weights,
  budget: number
): Scored[] {
  const candidates = getProducts(category.key).filter(
    (p) => p.price <= budget * BUDGET_TOLERANCE
  );
  const totalWeight = sumWeights(weights);

  return candidates
    .map((product) => scoreOne(product, category, weights, budget, totalWeight))
    .sort((a, b) => b.totalScore - a.totalScore);
}

function scoreOne(
  product: Product,
  category: CategoryMeta,
  weights: Weights,
  budget: number,
  totalWeight: number
): Scored {
  let weighted = 0;
  const dimensionContrib = category.dimensions.map<DimensionContribution>((d) => {
    const weight = weights[d.key] ?? 0;
    const raw = product.scores[d.key] ?? 0;
    const contrib = (raw * weight) / totalWeight;
    weighted += contrib;
    return { key: d.key, weight, raw, weighted: contrib };
  });

  const totalScore = Math.min(100, weighted + budgetBonus(product.price, budget));

  return {
    product,
    totalScore,
    dimensionContrib,
    matchPct: Math.round(totalScore),
  };
}

function sumWeights(weights: Weights): number {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  return sum || 1;
}

/** 预算契合奖励：价格离预算上限越远，奖励越多，最多 +5 分 */
function budgetBonus(price: number, budget: number): number {
  const headroom = Math.max(budget * 0.4, 1);
  const fit = Math.min(1, (budget - price) / headroom);
  return Math.max(0, fit) * BUDGET_BONUS_MAX;
}
