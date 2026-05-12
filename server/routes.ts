import type { Express, Request, Response } from "express";
import type { Server } from "node:http";
import { storage } from "./storage";
import {
  recommendRequestSchema,
  type RecommendedProduct,
  type RecommendResponse,
} from "../shared/recommend/types";
import { getMockRecommendations } from "./recommend/mockRecommendations";
import {
  getAiRecommendations,
  MissingApiKeyError,
  AiProviderError,
} from "./ai/recommendProvider";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 用 storage 防 "unused import"(将来真要用 session/user CRUD 时直接接)
  void storage;

  /**
   * POST /api/recommend
   *
   * 业务原则:
   * - 请求体不合法 -> 400(这是真正的 client error)
   * - 其它任何路径(无 key / AI 超时 / AI 抛错 / normalize 失败)
   *   -> 200 + { source: "mock", products, error }
   *   接口绝不返回 5xx 导致前端崩。
   */
  app.post("/api/recommend", async (req: Request, res: Response) => {
    const parsed = recommendRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        issues: parsed.error.flatten(),
      });
    }
    const reqBody = parsed.data;

    // 兜底拿一份 mock,后面要么被 AI 替换,要么直接返回它。
    let mockProducts: RecommendedProduct[];
    try {
      mockProducts = getMockRecommendations(reqBody);
    } catch (err) {
      // 极端情况(品类未知 + scoring 抛错):返回空 mock,**不要 500**
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
      // 完整 message 只走 server 日志,避免 response body 里泄露 provider 报错详情。
      const fullMessage =
        err instanceof Error ? err.message : String(err);
      console.warn("[recommend] AI fallback:", fullMessage);

      // 返给前端只是一个粗粒度分类标签——UI 只看 source,不看这个;
      // 但万一后续调试要看 Network 面板,也只会看到分类,不会漏 provider 原始报错。
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
  });

  return httpServer;
}
