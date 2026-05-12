/**
 * 把 AI 原始返回 normalize / validate 成 `RecommendedProduct[]`。
 *
 * AI 模型即使在 JSON mode 下也会偶尔:
 *   - 字段拼错(price -> "价格")
 *   - 数字传成字符串("¥8,999")
 *   - 缺字段(漏 pros / highlights)
 *   - 多包一层(包在 { products: [...] } 或 { recommendations: [...] } 里)
 *
 * 这里做两件事:
 *   1. 容错抽出数组
 *   2. 逐项 zod 校验,缺字段补默认值;**整条不可救则视为 provider 失败,由调用方走 mock fallback**。
 */
import { z } from "zod";
import {
  recommendedProductSchema,
  type RecommendedProduct,
} from "../../shared/recommend/types";

/** AI 原始单项的宽松 schema —— 字段都允许缺失,我们自己补默认值。 */
const rawAiProductSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    brand: z.string().optional(),
    name: z.string().optional(),
    price: z.union([z.number(), z.string()]).optional(),
    tagline: z.string().optional(),
    score: z.union([z.number(), z.string()]).optional(),
    matchPct: z.union([z.number(), z.string()]).optional(),
    highlights: z.array(z.string()).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),
    dimensions: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
    accent: z.string().optional(),
  })
  .passthrough();

type RawAiProduct = z.infer<typeof rawAiProductSchema>;

/** 试着从一个未知结构里取出"产品数组"。AI 经常多包一层。 */
export function extractProductsArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    for (const key of ["products", "recommendations", "results", "items", "data"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

function toNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    // AI 可能给 "¥8,999" / "8999元" / "$1,299"
    const cleaned = v.replace(/[^\d.\-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

/**
 * normalize 单个 AI 返回项。返回 null 表示这一项不可救,丢弃。
 *
 * 「不可救」的定义比较保守:必须至少有 name + 有效 price + 至少 1 个 dimensions 项。
 * 其它字段都用空值/默认值兜底。
 */
function normalizeOne(input: RawAiProduct, index: number): RecommendedProduct | null {
  const name = (input.name ?? "").trim();
  const price = toNumber(input.price);
  if (!name || price === null || price < 0) return null;

  const dimsRaw = input.dimensions ?? {};
  const dimensions: Record<string, number> = {};
  for (const [k, v] of Object.entries(dimsRaw)) {
    const n = toNumber(v);
    if (n !== null) dimensions[k] = clampScore(n);
  }
  if (Object.keys(dimensions).length === 0) return null;

  const scoreRaw = toNumber(input.score) ?? toNumber(input.matchPct);
  const score =
    scoreRaw !== null
      ? clampScore(scoreRaw)
      : // AI 没给总分:用 dimensions 平均估一个
        clampScore(
          Object.values(dimensions).reduce((a, b) => a + b, 0) /
            Object.values(dimensions).length
        );

  const candidate: RecommendedProduct = {
    id: String(input.id ?? `ai-${index}`),
    brand: (input.brand ?? "").trim() || "—",
    name,
    price,
    tagline: (input.tagline ?? "").trim(),
    score,
    highlights: (input.highlights ?? []).filter((x) => typeof x === "string"),
    pros: (input.pros ?? []).filter((x) => typeof x === "string"),
    cons: (input.cons ?? []).filter((x) => typeof x === "string"),
    dimensions,
    accent: typeof input.accent === "string" ? input.accent : undefined,
  };

  // 兜一次 strict schema —— 如果连这个都过不了,说明上面 normalize 有 bug,放弃这条。
  const parsed = recommendedProductSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

/** 调用方要求的最少产品数;达不到则视为 provider 失败 → 走 mock fallback。 */
export const MIN_PRODUCTS_REQUIRED = 10;

/**
 * 主入口:把 AI 任意结构变成干净的 `RecommendedProduct[]`。
 * 抛错的情况:
 *   - 抽不出产品数组
 *   - 抽出来但一项都不能被 normalize
 *   - normalize 后存活 < MIN_PRODUCTS_REQUIRED (业务要求:缺材不可接受)
 */
export function normalizeAiProducts(raw: unknown): RecommendedProduct[] {
  const rawArr = extractProductsArray(raw);
  if (rawArr.length === 0) {
    throw new Error("AI response does not contain a products array");
  }

  const out: RecommendedProduct[] = [];
  for (let i = 0; i < rawArr.length; i++) {
    const parsed = rawAiProductSchema.safeParse(rawArr[i]);
    if (!parsed.success) continue;
    const item = normalizeOne(parsed.data, i);
    if (item) out.push(item);
  }

  if (out.length === 0) {
    throw new Error("AI response had products but none survived normalization");
  }
  if (out.length < MIN_PRODUCTS_REQUIRED) {
    throw new Error(
      `AI returned only ${out.length} valid products; need at least ${MIN_PRODUCTS_REQUIRED}`
    );
  }
  return out;
}
