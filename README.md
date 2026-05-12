# Neuropick Prototype

## Project Overview

Neuropick 是一个面向普通消费者的 AI 3C 硬件选购助手。当前版本优先支持笔记本电脑推荐，后续扩展到智能手机、无线耳机、平板、显示器等品类。

界面定位：**任务型应用 / consumer buying assistant**，不是企业官网，也不是 demo 主页。

## Current Status

- **当前阶段**:前端原型 / Prototype
- **产品定位**:任务型选购助手(左侧边栏 + 中间分步配置卡 + 右侧推荐预览/社区)。当前只带出「选购助手 + 笔记本」主流程,其余导航路径统一「敬请期待」。
- **当前重点品类**:笔记本电脑(唯一可选)
- **当前能力**:
  - 首页 4 步配置:产品类型 / 预算范围 / 主要用途 / 优先级权重(带开关,关掉不计入打分)
  - **严格 100 分约束**:每个 slider 的 max 动态等于「100 减其他启用维度之和」,拖不超;total ≠ 100 按钮 disabled + 明确提示还差多少 / 超出多少。
  - 一键「平均分配」/「重置」
  - 右侧 Top 3 推荐预览 · 实时随配置变化(`lg:` 断点上必出)
  - 右侧社区动态 mock
  - 默认浅色主题、可切换深色
  - 笔记本 Result 页:新版 dashboard 壳(SideNav + TopBar),**Top 3 重点大卡 + 第 4-10 名单列横向列表**(一行一个,窄屏依然单列),产品缩略图由 `LaptopThumbnail` SVG 组件统一绘制(屏幕+机身形态明确),后续有对比表、维度雷达;「返回首页」统一回新版 home,不会跳到旧页面
  - **mock 笔记本库**:11 款涵盖 Apple / Dell / Lenovo / ASUS / HP / Acer / Huawei / Redmi / Framework,默认预算 ¥18,000 可凑齐 Top 3 + 4-10 名 共 10 行
- **尚未完成**:
  - 真实产品数据库(目前为 mock)
  - AI 推荐接口 —— `feature/ai-search-poc` 分支已交付 POC,详见下文[AI 搜索 POC](#ai-搜索-poc-实验性仅在-featureai-search-poc-分支)
  - 价格实时更新 / 购买链接抓取
  - 手机 / 耳机 / 平板 / 手表 / 游戏主机 等品类流程
  - 对比 / 收藏 / 评测库 / 排行榜 / 社区 / 个人中心

## Tech Stack

- [Vite](https://vitejs.dev/) 7
- [React](https://react.dev/) 18 + TypeScript 5
- [Tailwind CSS](https://tailwindcss.com/) 3
- [lucide-react](https://lucide.dev/) 图标
- [Express](https://expressjs.com/) 5(开发态 dev server + 生产态 SSR-less serve)
- 自实现 `lib/router.tsx` 状态切换路由(无 react-router / wouter)
- (可选)Drizzle ORM + Supabase(尚未真正使用)

## Local Development

```bash
npm install
npm run dev
```

默认监听端口 `5000`(可通过环境变量 `PORT` 覆盖)。

打开 [http://localhost:5000](http://localhost:5000) 即可访问。

> dev 模式下 Express 会通过 Vite middleware 把 client 挂到同一个端口。

## Build

```bash
npm run build      # 生成 dist/public(前端) 与 dist/index.cjs(服务端)
npm run start      # 以生产模式启动 Express,serve dist/public
```

也可以单独把 `dist/public/` 作为纯静态站点部署到任何 CDN / 静态托管平台。

## AI 搜索 POC (实验性,仅在 feature/ai-search-poc 分支)

本分支新增 `POST /api/recommend` 接口,可调用真实 LLM provider 生成推荐。
**拿不到 key / 超时 / 返回不合法 / 产品不足 10 件 → 自动 fallback 到 mock**,接口永返 200,UI 不会白屏。

### Provider 支持

两个 provider 都是完整实现,什么都不填默认 `perplexity`:

| Provider     | 接口                             | 默认模型         | 实现点                                |
| ------------ | -------------------------------- | ---------------- | --------------------------------------- |
| `perplexity` | `/chat/completions` + json_schema | `sonar`          | 带实时 web 检索,适合需要当前价格的场景 |
| `openai`     | `/chat/completions` + JSON mode  | `gpt-4o-mini`    | 靠模型内置知识 + structured JSON     |

### 启用方式

```bash
cp .env.example .env
# 编辑 .env,填入三个变量:
#   AI_PROVIDER=perplexity   # 或 openai
#   AI_API_KEY=...           # 对应 provider 的 key
#   AI_SEARCH_TIMEOUT_MS=10000
npm run dev
```

也可以在命令行传:

```bash
AI_PROVIDER=openai AI_API_KEY=sk-... npm run dev
```

### 环境变量完整表

| 变量                      | 默认         | 说明                                                       |
| ------------------------- | ------------ | ---------------------------------------------------------- |
| `AI_PROVIDER`             | `perplexity` | `perplexity` \| `openai`                                   |
| `AI_API_KEY`              | 空           | 留空 → 服务端永远走 mock,接口仍可用                       |
| `AI_MODEL`                | provider 默认 | 覆盖默认模型名                                            |
| `AI_SEARCH_TIMEOUT_MS`    | `10000`      | 一次 AI 调用的超时,clamp 到 [1000, 30000]                  |

### Fallback 规则

以下任一情况会返 200 + `source="mock"` + mock 产品列表:

- 没填 `AI_API_KEY`
- AI 调用 HTTP 非 2xx
- 返回内容不是合法 JSON
- 超过 `AI_SEARCH_TIMEOUT_MS` 超时
- normalize 后产品不足 10 件

只有 `body` 不合法才返 400(这是真正的 client error)。

### 请求 / 响应 示例

```bash
curl -X POST http://localhost:5000/api/recommend \
  -H 'Content-Type: application/json' \
  -d '{
    "category": "laptop",
    "budget": 18000,
    "useCases": ["work"],
    "weights": {"performance":40,"battery":20,"portability":20,"display":10,"price":10}
  }'
```

返回体形状 (见 `shared/recommend/types.ts`):

```jsonc
{
  "source": "ai" | "mock",   // UI 依此决定徽章文案
  "products": [ /* 10 件 RecommendedProduct */ ],
  "explanation": "Provided by perplexity",  // 只 AI 路径有
  "error": "missing_api_key" | "provider_error" | "unknown_error"  // 只 fallback 时有,且粗粒度分类,不含 provider 原始报错
}
```

UI 结果页右上会渲染轻量 badge:“AI 搜索结果” / “当前为演示数据”。

### 安全要点

- `.env` 已被 `.gitignore` 排除。只提交 `.env.example`。
- API key 只在 server 端读取 (`process.env.AI_API_KEY`),前端 bundle 里不含 key。
- AI provider 原始报错只进 server 日志;HTTP response 只返回粗粒度 `error` 分类。
- 本功能不影响稳定演示分支 `ui/consumer-app-redesign`。

## Preview

- **Local preview**: `npm run dev` → [http://localhost:5000](http://localhost:5000)
- **Online preview**: 见下文 [Deployment](#deployment) 部分。静态预览只能看 UI(会走 client 本地 mock fallback);如需验证 AI 路径请本地 `npm run dev` + 填 `.env`。

## User Flow

1. **首页**:在 Quick Start Card 选择产品类型(默认笔记本)、设定预算上限、勾选主要用途
2. **Configure**:挑选预设画像(可选),用 6 个滑块微调维度权重
3. **预算确认**:设定预算上限
4. **Result**:查看 Top 3 推荐、其他候选与维度雷达,可加入对比

## Scoring Dimensions

笔记本品类下使用的评分维度:

- **性能**:CPU/GPU 综合算力,重度任务表现
- **续航**:日常负载下的离电使用时长
- **屏幕**:色准、刷新率、亮度、护眼
- **便携**:重量、厚度、出行友好度
- **价格**:同价位段的综合竞争力
- **可靠性**(展示性):品牌口碑、售后政策与长期使用反馈

> 维度配置集中在 `client/src/lib/dimensions.ts`,UI 全部 map 自这份配置。新增/删除维度只需在这里改。

## Project Structure

```
techpick/
├── client/
│   └── src/
│       ├── pages/                 # Home (dashboard) / Result
│       ├── components/
│       │   ├── dashboard/         # 首页: TopBar / SideNav / StepHeader
│       │   │                       #       ProductTypeGrid / BudgetRange / UseCaseChips
│       │   │                       #       WeightAllocator / RecommendationPreview / CommunityCard
│       │   ├── result/            # ProductCard / CompareTable / SummaryCard / ScoreRing
│       │   └── ui/                # shadcn/radix 原子组件
│       ├── data/                  # 静态展示用数据 (navigation / productTypes / useCases ...)
│       ├── lib/
│       │   ├── dimensions.ts      # re-export 自 shared/recommend/dimensions
│       │   ├── mockProducts.ts    # re-export 自 shared/recommend/products
│       │   ├── scoring.ts         # re-export 自 shared/recommend/scoring
│       │   ├── recommendApi.ts    # POST /api/recommend 客户端 + 本地 mock 兜底 (POC 新增)
│       │   ├── icons.ts           # 图标名 → lucide 组件映射
│       │   └── router.tsx         # 极简 view 切换路由
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── server/
│   ├── index.ts                   # Express 启动 + dotenv/config
│   ├── routes.ts                  # POST /api/recommend (POC 新增)
│   ├── vite.ts                    # dev 模式 Vite middleware
│   ├── static.ts                  # 生产模式 静态 serve
│   ├── ai/                        # POC 新增
│   │   ├── recommendProvider.ts   # Perplexity + OpenAI provider 抽象
│   │   └── normalize.ts           # zod 校验 + 最少 10 件产品门槛
│   └── recommend/                 # POC 新增
│       └── mockRecommendations.ts # 复用 shared scoring 返 mock 10 件
├── shared/
│   └── recommend/                 # POC 新增: server 和 client 都可读、不依赖 UI
│       ├── dimensions.ts          # 维度 / 品类单一事实来源
│       ├── products.ts            # mock 产品库
│       ├── scoring.ts             # 评分纯函数
│       └── types.ts               # zod schema + RecommendRequest / RecommendedProduct / RecommendResponse
├── script/build.ts                # 同时打包 client 与 server
├── README.md
├── CHANGELOG.md
└── package.json
```

## Deployment

### Vercel(不推荐)

本项目同时包含 **Express 后端**(`server/`)与 React 前端。Vercel 的 Node Runtime 适合 serverless function,但当前 Express 是长连接式的 dev/prod server,而且会通过 Vite middleware 处理 SSR-less 资源,改造成 serverless 需要拆出 `server/` 的中间件层并把每条路由改成 function,工作量明显大于「补一个静态部署」。

建议:**短期不要用 Vercel 部署完整应用**。如果只是想在 Vercel 上预览前端,把 `dist/public/` 当成静态站点导入(Output Directory 设为 `dist/public`,Build Command 设为 `npm run build`)即可。

### GitHub Pages(推荐用于前端预览)

仓库已在 `.github/workflows/deploy.yml` 提供 GitHub Actions 工作流:

1. push 到 `main` 或手动触发,会自动跑 `npm ci && npm run build`
2. 把 `dist/public/` 上传为 GitHub Pages artifact 并发布

启用方式(只需做一次):

1. 打开仓库 **Settings → Pages**
2. **Source** 选 `GitHub Actions`
3. 触发一次 Actions(push 或在 Actions 页 Run workflow)
4. 部署完成后,URL 会形如:
   `https://dracarys397803.github.io/neuropick-prototype/`

> ⚠️ GitHub Pages 只能 serve 前端 `dist/public/`,Express 后端不会运行。当前原型 UI 不依赖后端 API,所以完全可用;真正接 AI 推荐时再换 Vercel(serverless function)/Fly / Render 等支持 Node 进程的平台。

### 本地 Docker 化 / Node 直跑

如果需要部署到自己的 VPS:

```bash
npm install --omit=dev || npm ci
npm run build
PORT=8080 npm run start
```

## Roadmap

- **Phase 1** ✅ 消费级前端原型
- **Phase 2** ✅ Dashboard 任务型选购助手骨架(当前仓库状态)
- **Phase 3** 笔记本深化:mock 产品库扩充、评测内容结构、对比页面
- **Phase 4** AI 推荐解释(LLM 生成「为什么推这台」) —— `feature/ai-search-poc` 分支已交 POC
- **Phase 5** 商品链接、价格更新、库存校验
- **Phase 6** 对比 / 收藏 / 评测库 等「敬请期待」模块逐一开启
- **Phase 7** 扩展手机 / 耳机 / 平板 / 手表 / 游戏主机等品类

## Contributing

这是个原型,以快为先。改动建议:

- 维度 / 品类 → 改 `shared/recommend/dimensions.ts` (client/server 均复用)
- mock 产品 → 改 `shared/recommend/products.ts`
- 评分公式 → 改 `shared/recommend/scoring.ts`
- API 请求 / 返回类型 → 改 `shared/recommend/types.ts` (zod schema)
- 首页 UI 模块 → 改 `client/src/components/dashboard/`
- 用途 chips / 文案 → 改 `client/src/data/`
- AI provider → 改 `server/ai/recommendProvider.ts`

请保持页面组件(`pages/*.tsx`)尽量瘦,业务逻辑放 `lib/`,UI 块放 `components/`。

## License

MIT
