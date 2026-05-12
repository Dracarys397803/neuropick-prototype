/**
 * /api/recommend 的请求/响应契约。
 *
 * 这是 client 与 server 之间的唯一数据接口。
 * 不要把 UI 端类型(Scored、DimensionContribution 等)塞进来 ——
 * 调用方只关心「我要展示哪些产品、来源是 AI 还是 mock」。
 */
import { z } from "zod";

// ---------- 请求 ----------

export const recommendRequestSchema = z.object({
  category: z.string().min(1),
  budget: z.number().positive().finite(),
  useCases: z.array(z.string()).default([]),
  weights: z.record(z.string(), z.number().min(0).max(100)),
  disabledDimensions: z.array(z.string()).default([]),
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;

// ---------- 单个推荐产品 ----------

export const recommendedProductSchema = z.object({
  id: z.string(),
  brand: z.string(),
  name: z.string(),
  /** 人民币定价 */
  price: z.number().nonnegative(),
  tagline: z.string(),
  /** 综合匹配度 0..100,UI 取整后显示为「综合匹配度 N%」 */
  score: z.number().min(0).max(100),
  highlights: z.array(z.string()).default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  /** 每个维度上的分数 0..100;UI 会从 category.dimensions 取 key */
  dimensions: z.record(z.string(), z.number()),
  /** 卡片主色调(HSL 字符串,不含 hsl(...) 包装);AI 可选返回,缺省 UI 用 fallback */
  accent: z.string().optional(),
});

export type RecommendedProduct = z.infer<typeof recommendedProductSchema>;

// ---------- 响应 ----------

export const recommendResponseSchema = z.object({
  source: z.union([z.literal("ai"), z.literal("mock")]),
  products: z.array(recommendedProductSchema),
  /** AI 给出的一段总体说明,UI 可选展示 */
  explanation: z.string().optional(),
  /** 仅用于排查,不展示给最终用户 */
  error: z.string().optional(),
});

export type RecommendResponse = z.infer<typeof recommendResponseSchema>;
