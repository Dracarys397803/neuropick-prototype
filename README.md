# Neuropick Prototype

Neuropick 是一个面向普通消费者的 AI 3C 硬件选购助手。当前版本聚焦笔记本电脑推荐,后续会扩展到手机、耳机、平板、显示器等品类。

界面定位:**任务型应用 / consumer buying assistant**,不是企业官网,也不是 demo 主页。

---

## 30 秒 Quick Start

```bash
git clone https://github.com/Dracarys397803/neuropick-prototype.git
cd neuropick-prototype
npm install
npm run dev        # http://localhost:5000
```

不需要任何 API key、不需要数据库、不需要 docker。无 key 时所有路径自动走 mock,UI 完全可用。

如要启用真实 AI 推荐,见下文 [启用真实 AI 推荐](#启用真实-ai-推荐可选)。

---

## 项目现状

| 项 | 状态 |
| --- | --- |
| 阶段 | Prototype |
| 主流程 | ✅ 选购助手 + 笔记本品类 |
| 其他品类 | 🚧 占位「敬请期待」(手机/耳机/平板/手表/游戏主机) |
| AI 推荐 | ✅ Perplexity + OpenAI 双 provider,无 key 自动 mock |
| 真实价格抓取 | ❌ Phase 5 |
| 对比 / 收藏 / 评测库 / 社区 / 排行榜 | 🚧 占位 |

**当前能力**

- 首页 4 步配置:产品类型 / 预算范围 / 主要用途 / 优先级权重(带开关,关掉不计入打分)
- **严格 100 分约束**:每个 slider 的 max 动态 = 100 减其他启用维度之和,拖不超;total ≠ 100 时按钮 disabled 并提示差多少
- 一键「平均分配」/「重置」
- 右侧 Top 3 推荐预览 · 实时随配置变化
- 笔记本 Result 页:dashboard 壳(SideNav + TopBar)+ **Top 3 重点大卡** + **4-10 名横向列表**
- 产品缩略图由 `LaptopThumbnail` SVG 组件统一绘制
- 默认浅色主题、可切深色
- mock 笔记本库 11 款,涵盖 Apple / Dell / Lenovo / ASUS / HP / Acer / Huawei / Redmi / Framework

---

## 技术栈

- [Vite](https://vitejs.dev/) 7 + [React](https://react.dev/) 18 + TypeScript 5
- [Tailwind CSS](https://tailwindcss.com/) 3 + [shadcn/ui](https://ui.shadcn.com/) + [lucide-react](https://lucide.dev/)
- [Express](https://expressjs.com/) 5 — dev 态走 Vite middleware,prod 态 serve `dist/public`
- 自实现 `lib/router.tsx` 状态切换路由,无外部 router 依赖

不用数据库、不用 ORM、不用鉴权 — 这是个纯前端原型 + 单一 `/api/recommend` 后端的最小化结构。

---

## 本地运行

### Dev 模式

```bash
npm install
npm run dev
```

默认监听 `5000`(可用 `PORT=8080 npm run dev` 覆盖)。Express 通过 Vite middleware 把前端挂到同一端口,改代码热更新。

### Build & 生产模式

```bash
npm run build      # 产物: dist/public(前端) + dist/index.cjs(server)
npm run start      # NODE_ENV=production node dist/index.cjs
```

---

## 启用真实 AI 推荐(可选)

```bash
cp .env.example .env
# 编辑 .env,至少填 AI_API_KEY
npm run dev
```

也可以行内传:

```bash
AI_PROVIDER=openai AI_API_KEY=sk-... npm run dev
```

### 环境变量

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `AI_PROVIDER` | `perplexity` | `perplexity` \| `openai` |
| `AI_API_KEY` | 空 | 留空 → 后端永远走 mock,接口仍可用 |
| `AI_MODEL` | provider 默认 | 覆盖默认模型名 |
| `AI_SEARCH_TIMEOUT_MS` | `10000` | 单次 AI 调用超时,clamp 到 [1000, 30000] |

### Provider 支持

| Provider | 接口 | 默认模型 | 特点 |
| --- | --- | --- | --- |
| `perplexity` | `/chat/completions` + json_schema | `sonar` | 带实时 web 检索,适合需要当前价格 |
| `openai` | `/chat/completions` + JSON mode | `gpt-4o-mini` | 靠模型内置知识 + structured JSON |

### Fallback 规则

以下任一情况返 `200` + `source="mock"` + mock 产品列表(接口**永不 5xx**):

- 没填 `AI_API_KEY`
- AI 调用 HTTP 非 2xx
- 返回内容不是合法 JSON
- 超过 `AI_SEARCH_TIMEOUT_MS`
- normalize 后产品不足 10 件

只有请求 body 不合法才返 400(这是真正的 client error)。

### 请求 / 响应示例

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

返回(见 `shared/recommend/types.ts`):

```jsonc
{
  "source": "ai" | "mock",                  // UI 依此决定徽章文案
  "products": [ /* 10 件 RecommendedProduct */ ],
  "explanation": "Provided by perplexity",  // 仅 AI 路径
  "error": "missing_api_key" | "provider_error" | "unknown_error"
                                            // 仅 fallback,粗粒度分类
}
```

UI 结果页右上渲染轻量 badge:「AI 搜索结果」 / 「当前为演示数据」。

### 安全要点

- `.env` 已被 `.gitignore` 排除,只提交 `.env.example`
- API key 仅在 server 端读取(`process.env.AI_API_KEY`),前端 bundle 内不含 key
- AI provider 原始报错只进 server 日志;HTTP response 只返粗粒度 `error` 分类

---

## 部署

> **核心原则**:这是个**带 Express 后端**的应用,不是纯静态前端。AI 推荐路径依赖 `/api/recommend`,所以**部署目标必须支持 Node 进程**。

### 推荐方案

| 方案 | 适合 | 命令 |
| --- | --- | --- |
| 自建 VPS / Docker | 完全自主、需 Node 进程 | `npm ci && npm run build && PORT=8080 npm run start` |
| Render / Railway / Fly | 一键托管 Node | 入口 `npm start`,build 命令 `npm run build` |
| Perplexity Computer 预览 | 临时分享、PR review | 见下文 |

### 自建 / VPS 部署

```bash
npm ci                       # 锁定依赖,与 lock 文件一致
npm run build                # 产物在 dist/
PORT=8080 npm run start      # Express 监听 8080
# 后面通常再套一层 nginx / caddy 做 TLS 终止
```

如需启用 AI,把环境变量写进进程管理器(systemd / pm2 / docker `-e`):

```
AI_PROVIDER=perplexity
AI_API_KEY=...
AI_SEARCH_TIMEOUT_MS=10000
```

### 静态预览(只前端,不带 AI 路径)

如果团队只想看 UI、不需要后端,把 `dist/public/` 直接传任何 CDN / 静态托管(Cloudflare Pages、Netlify、GitHub Pages 都行):

```bash
npm run build
# 把 dist/public/ 整目录上传
```

此时前端会因为 `fetch /api/recommend` 失败而走 **client 端本地 mock fallback**,Top 3 + 4-10 依然能跑出来,只是徽章固定显示「当前为演示数据」。

⚠️ 千万别在静态托管平台上期望 AI 路径能跑 — 没有 Node 进程,`/api/recommend` 会 404。

### Perplexity Computer 一键预览

如果你有 Perplexity Computer,把整个项目目录传上去后用内置的 `deploy_website` 工具一键拿到带后端的预览 URL。占位符 `__PORT_5000__`(见 `client/src/lib/queryClient.ts` 和 `recommendApi.ts`)会在部署时被自动替换成代理路径,让前端调到 Express 后端。

---

## 用户流程

1. **首页**:选产品类型、设预算上限、勾选用途
2. **配置**:6 个滑块微调维度权重(严格 100 分,可关闭某维度)
3. **生成推荐**:调用 `POST /api/recommend`(AI 或 mock)
4. **Result**:Top 3 重点大卡 + 4-10 名横向列表,带 source 徽章

---

## 评分维度(笔记本)

- **性能** — CPU/GPU 综合算力,重度任务表现
- **续航** — 日常负载下的离电使用时长
- **屏幕** — 色准、刷新率、亮度、护眼
- **便携** — 重量、厚度、出行友好度
- **价格** — 同价位段的综合竞争力
- **可靠性**(展示性) — 品牌口碑、售后政策与长期使用反馈

> 维度配置在 `shared/recommend/dimensions.ts`,UI 全部 map 自这份配置。新增/删除维度只改这一处。

---

## 项目结构

```
neuropick-prototype/
├── client/src/
│   ├── pages/                 # Home / Result
│   ├── components/
│   │   ├── dashboard/         # 首页: TopBar / SideNav / StepHeader
│   │   │                      #       ProductTypeGrid / BudgetRange / UseCaseChips
│   │   │                      #       WeightAllocator / RecommendationPreview / CommunityCard
│   │   ├── result/            # ProductCard / CompareTable / SummaryCard / ScoreRing
│   │   └── ui/                # shadcn/radix 原子组件
│   ├── data/                  # 静态展示数据 (navigation / productTypes / useCases ...)
│   ├── lib/
│   │   ├── dimensions.ts      # re-export 自 shared/recommend/dimensions
│   │   ├── mockProducts.ts    # re-export 自 shared/recommend/products
│   │   ├── scoring.ts         # re-export 自 shared/recommend/scoring
│   │   ├── recommendApi.ts    # POST /api/recommend 客户端 + 本地 mock 兜底
│   │   ├── queryClient.ts     # __PORT_5000__ 占位符 + react-query 配置
│   │   ├── icons.ts           # 图标名 → lucide 组件映射
│   │   └── router.tsx         # 极简 view 切换路由
│   ├── App.tsx · main.tsx · index.css
├── server/
│   ├── index.ts               # Express 启动 + dotenv/config
│   ├── routes.ts              # POST /api/recommend
│   ├── vite.ts                # dev 模式 Vite middleware
│   ├── static.ts              # 生产模式 静态 serve
│   ├── ai/
│   │   ├── recommendProvider.ts  # Perplexity + OpenAI provider 抽象
│   │   └── normalize.ts          # zod 校验 + 最少 10 件产品门槛
│   └── recommend/
│       └── mockRecommendations.ts  # 复用 shared scoring 返 mock 10 件
├── shared/recommend/          # server 和 client 都可读、不依赖 UI
│   ├── dimensions.ts          # 维度 / 品类单一事实来源
│   ├── products.ts            # mock 产品库
│   ├── scoring.ts             # 评分纯函数
│   └── types.ts               # zod schema + RecommendRequest / RecommendedProduct / RecommendResponse
├── script/build.ts            # 同时打包 client 与 server
├── README.md · CHANGELOG.md
└── package.json
```

---

## Roadmap

- **Phase 1 ✅** 消费级前端原型
- **Phase 2 ✅** Dashboard 任务型选购助手骨架
- **Phase 3 ✅** AI 推荐接口(Perplexity + OpenAI,带 mock fallback)
- **Phase 4** 笔记本深化:mock 产品库扩充、评测内容结构、对比页面
- **Phase 5** 商品链接、价格更新、库存校验
- **Phase 6** 对比 / 收藏 / 评测库 等「敬请期待」模块逐一开启
- **Phase 7** 扩展手机 / 耳机 / 平板 / 手表 / 游戏主机等品类

---

## 贡献指南

这是个原型,以快为先。改动建议:

- 维度 / 品类 → `shared/recommend/dimensions.ts` (client/server 复用)
- mock 产品 → `shared/recommend/products.ts`
- 评分公式 → `shared/recommend/scoring.ts`
- API 请求 / 返回类型 → `shared/recommend/types.ts` (zod schema)
- 首页 UI 模块 → `client/src/components/dashboard/`
- 用途 chips / 文案 → `client/src/data/`
- AI provider → `server/ai/recommendProvider.ts`

页面组件(`pages/*.tsx`)保持瘦,业务逻辑放 `lib/`,UI 块放 `components/`。

提交前检查:

```bash
npm run check      # tsc 类型检查
npm run build      # client + server 双 build
```

---

## License

MIT
