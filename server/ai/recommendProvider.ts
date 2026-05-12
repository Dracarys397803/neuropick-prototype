/**
 * AI 推荐 Provider 抽象层。
 *
 * 设计原则:
 *   1. **Provider 抽象**:routes.ts 不关心走的是 Perplexity 还是 OpenAI,
 *      只关心 `getAiRecommendations(req)` 是 resolve 出产品列表还是 throw。
 *   2. **两个 provider 都已实现**:
 *      - Perplexity Sonar:in-context web search,返回带实时检索的推荐。
 *      - OpenAI Chat Completions + JSON mode:靠 模型内置知识 + structured JSON 输出。
 *      两者主要差别是是否会去 web。routes.ts 不关心 —— 它只需要 RecommendedProduct[]。
 *   3. **缺 key 直接 throw `MissingApiKeyError`**,routes.ts 看到这个错就走 mock。
 *
 * 环境变量:
 *   - AI_PROVIDER:  "perplexity" | "openai"(缺省 "perplexity")
 *   - AI_API_KEY:   provider 的 API key
 *   - AI_SEARCH_TIMEOUT_MS: 网络请求超时(缺省 10000)
 *   - AI_MODEL: provider 特定的模型名(可选)
 */
import type {
  RecommendRequest,
  RecommendedProduct,
} from "../../shared/recommend/types";
import { normalizeAiProducts } from "./normalize";
import { getCategory } from "../../shared/recommend/dimensions";

export class MissingApiKeyError extends Error {
  constructor(provider: string) {
    super(`AI provider "${provider}" missing AI_API_KEY`);
    this.name = "MissingApiKeyError";
  }
}

export class AiProviderError extends Error {
  constructor(message: string, public readonly provider: string) {
    super(message);
    this.name = "AiProviderError";
  }
}

export interface AiRecommendProvider {
  readonly name: string;
  recommend(req: RecommendRequest, signal: AbortSignal): Promise<RecommendedProduct[]>;
}

// ============================================================
// Perplexity Sonar provider —— 完整实现
// ============================================================

const PERPLEXITY_DEFAULT_MODEL = "sonar";
const PERPLEXITY_URL = "https://api.perplexity.ai/chat/completions";

class PerplexityProvider implements AiRecommendProvider {
  readonly name = "perplexity";
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async recommend(req: RecommendRequest, signal: AbortSignal): Promise<RecommendedProduct[]> {
    const prompt = buildPrompt(req);

    const resp = await fetch(PERPLEXITY_URL, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "你是一名严谨的数码硬件买手。你必须只用合法 JSON 回答,不要写任何 markdown 围栏或解释。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        // Perplexity API 支持 response_format: json_schema 来强制 JSON 输出
        response_format: {
          type: "json_schema",
          json_schema: {
            schema: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      brand: { type: "string" },
                      name: { type: "string" },
                      price: { type: "number" },
                      tagline: { type: "string" },
                      score: { type: "number" },
                      highlights: { type: "array", items: { type: "string" } },
                      pros: { type: "array", items: { type: "string" } },
                      cons: { type: "array", items: { type: "string" } },
                      dimensions: {
                        type: "object",
                        additionalProperties: { type: "number" },
                      },
                    },
                    required: ["name", "price", "dimensions"],
                  },
                },
                explanation: { type: "string" },
              },
              required: ["products"],
            },
          },
        },
      }),
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      throw new AiProviderError(
        `Perplexity HTTP ${resp.status}: ${body.slice(0, 200)}`,
        this.name
      );
    }

    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new AiProviderError("Perplexity response missing message.content", this.name);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new AiProviderError("Perplexity returned non-JSON content", this.name);
    }

    return normalizeAiProducts(parsed);
  }
}

// ============================================================
// OpenAI provider —— 完整实现(Chat Completions + JSON mode)
// ============================================================

const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

class OpenAiProvider implements AiRecommendProvider {
  readonly name = "openai";
  constructor(private readonly apiKey: string, private readonly model: string) {}

  async recommend(req: RecommendRequest, signal: AbortSignal): Promise<RecommendedProduct[]> {
    const prompt = buildPrompt(req);

    const resp = await fetch(OPENAI_URL, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "你是一名严谨的数码硬件买手。你必须只用合法 JSON 回答,不要写任何 markdown 围栏或解释。返回的根对象必须含顶层 products 数组,长度恰好为 10。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        // OpenAI Chat Completions JSON mode。要求 prompt 里出现 "JSON" 字样 —— 我们 buildPrompt 里已经反复提 JSON。
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const body = await resp.text().catch(() => "");
      throw new AiProviderError(
        `OpenAI HTTP ${resp.status}: ${body.slice(0, 200)}`,
        this.name
      );
    }

    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new AiProviderError("OpenAI response missing message.content", this.name);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new AiProviderError("OpenAI returned non-JSON content", this.name);
    }

    return normalizeAiProducts(parsed);
  }
}

// ============================================================
// Prompt 构造
// ============================================================

function buildPrompt(req: RecommendRequest): string {
  const category = getCategory(req.category);
  const dimLabels = category.dimensions
    .map((d) => `${d.key}(${d.label})`)
    .join("、");

  const enabledWeights = Object.entries(req.weights)
    .filter(([k]) => !req.disabledDimensions.includes(k))
    .map(([k, v]) => `${k}=${v}`)
    .join(",");

  const useCases = req.useCases.length > 0 ? req.useCases.join("、") : "通用";

  return [
    `请为用户推荐 ${category.label} 共 10 款产品(综合得分由高到低排序)。`,
    `预算上限:¥${req.budget}(允许略超不超过 5%)。`,
    `主要用途:${useCases}。`,
    `各维度权重(0-100, 总和≈100,被禁用的维度不在内):${enabledWeights}`,
    `请基于实时 web 检索,聚焦目前在售机型与当前实际售价。`,
    "",
    "返回 JSON 格式:",
    "{ products: [ { id, brand, name, price(数字, 人民币), tagline, score(0-100), highlights[], pros[], cons[], dimensions{...} } ], explanation? }",
    `dimensions 的 key 必须从下列集合中取:${dimLabels}。每个分数 0-100。`,
    "score 是综合匹配度。tagline 一句话,中文。",
    "**只输出 JSON,不要 markdown 围栏,不要任何解释文字。**",
  ].join("\n");
}

// ============================================================
// Factory
// ============================================================

function pickProvider(name: string, apiKey: string, model: string | undefined): AiRecommendProvider {
  switch (name) {
    case "openai":
      return new OpenAiProvider(apiKey, model || OPENAI_DEFAULT_MODEL);
    case "perplexity":
    default:
      return new PerplexityProvider(apiKey, model || PERPLEXITY_DEFAULT_MODEL);
  }
}

/**
 * 主入口。如果环境变量缺 key,**立刻** throw MissingApiKeyError,
 * routes.ts 捕获后直接走 mock,不浪费时间发请求。
 */
export async function getAiRecommendations(
  req: RecommendRequest
): Promise<{ products: RecommendedProduct[]; providerName: string }> {
  const providerName = (process.env.AI_PROVIDER || "perplexity").trim();
  const apiKey = (process.env.AI_API_KEY || "").trim();
  const model = process.env.AI_MODEL?.trim() || undefined;
  const timeoutMs = clampTimeout(process.env.AI_SEARCH_TIMEOUT_MS, 10000);

  if (!apiKey) throw new MissingApiKeyError(providerName);

  const provider = pickProvider(providerName, apiKey, model);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const products = await provider.recommend(req, controller.signal);
    return { products, providerName: provider.name };
  } catch (err: unknown) {
    if (controller.signal.aborted) {
      throw new AiProviderError(`AI provider timed out after ${timeoutMs}ms`, provider.name);
    }
    // 透传我们自己的错误类型,其它 wrap 成 AiProviderError 方便 routes 统一处理
    if (err instanceof MissingApiKeyError || err instanceof AiProviderError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new AiProviderError(msg, provider.name);
  } finally {
    clearTimeout(timer);
  }
}

function clampTimeout(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  // 最少 1s,最多 30s,防止配错环境变量把请求挂死
  return Math.min(30000, Math.max(1000, n));
}
