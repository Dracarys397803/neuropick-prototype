/**
 * Vercel Serverless Function: POST /api/recommend
 *
 * 这个文件在 Vercel 部署时作为 serverless function 跑。
 * 本地 dev (`npm run dev`) 走的是 server/routes.ts 里的 Express handler,
 * 业务逻辑与这里完全一致 —— 都委托给 server/ai/* 和 server/recommend/* 纯函数,
 * 没有重复实现,只是入口形态从 Express 换成 Vercel handler。
 *
 * 业务原则(与 server/routes.ts 严格对齐):
 *   - 请求体不合法 -> 400
 *   - 其它任何路径(无 key / AI 超时 / AI 抛错 / normalize 失败)
 *     -> 200 + { source: "mock", products, error }
 *     接口绝不返回 5xx。
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  recommendRequestSchema,
  type RecommendedProduct,
  type RecommendResponse,
} from "../shared/recommend/types";
import { getMockRecommendations } from "../server/recommend/mockRecommendations";
import {
  getAiRecommendations,
  MissingApiKeyError,
  AiProviderError,
} from "../server/ai/recommendProvider";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const parsed = recommendRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid request body",
      issues: parsed.error.flatten(),
    });
  }
  const reqBody = parsed.data;

  // 兜底先拿一份 mock
  let mockProducts: RecommendedProduct[];
  try {
    mockProducts = getMockRecommendations(reqBody);
  } catch (err) {
    console.error("[recommend] mock fallback itself failed:", err);
    mockProducts = [];
  }

  // 试 AI
  try {
    const { products, providerName } = await getAiRecommendations(reqBody);
    const payload: RecommendResponse = {
      source: "ai",
      products,
      explanation: `Provided by ${providerName}`,
    };
    return res.status(200).json(payload);
  } catch (err: unknown) {
    const fullMessage = err instanceof Error ? err.message : String(err);
    console.warn("[recommend] AI fallback:", fullMessage);

    const errorTag =
      err instanceof MissingApiKeyError
        ? "missing_api_key"
        : err instanceof AiProviderError
          ? "provider_error"
          : "unknown_error";

    const payload: RecommendResponse = {
      source: "mock",
      products: mockProducts,
      error: errorTag,
    };
    return res.status(200).json(payload);
  }
}
