# Neuropick Prototype

## Project Overview

Neuropick 是一个面向普通消费者的 AI 3C 硬件选购助手。当前版本优先支持笔记本电脑推荐，后续扩展到智能手机、无线耳机、平板、显示器等品类。

界面定位：**任务型应用 / consumer buying assistant**，不是企业官网，也不是 demo 主页。

## Current Status

- **当前阶段**:前端原型 / Prototype
- **当前重点品类**:笔记本电脑（已开放配置 + 推荐流程）
- **当前能力**:
  - 首页 Quick Start Card:产品类型、预算、主要用途
  - Configure 页:预设画像、6 维度权重调节、预算 slider
  - Result 页:Top 3 推荐、其他候选、对比表、维度雷达
- **尚未完成**:
  - 真实产品数据库(目前为 mock)
  - 真实 AI 推荐接口
  - 价格实时更新
  - 购买链接抓取
  - 手机 / 耳机 / 平板 / 显示器 等品类完整支持

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

## Preview

- **Local preview**: `npm run dev` → [http://localhost:5000](http://localhost:5000)
- **Online preview**: Pending

线上预览部署方案见下文 [Deployment](#deployment)。

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
│       ├── pages/               # Home / Configure / Result(只做编排)
│       ├── components/
│       │   ├── home/            # QuickStartCard / CategoryListItem / ScoringExplain
│       │   ├── configure/       # PresetPicker / DimensionSliders / BudgetSlider / Summary
│       │   ├── result/          # ProductCard / CompareTable / SummaryCard / ScoreRing 等
│       │   ├── AppShell.tsx
│       │   ├── CategoryCard.tsx (legacy,首页已不使用,保留以备其他流程复用)
│       │   └── ui/              # shadcn/radix 原子组件
│       ├── data/                # 仅 UI 用的静态数据:用途 chips、维度文案解释
│       ├── lib/
│       │   ├── dimensions.ts    # 维度 / 品类 / 预设 / 预算 单一事实来源
│       │   ├── mockProducts.ts  # mock 产品库(纯数据)
│       │   ├── scoring.ts       # 评分纯函数
│       │   ├── icons.ts         # 图标名 → lucide 组件映射
│       │   └── router.tsx       # 极简 view 切换路由
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── server/                       # Express + Vite dev middleware
├── shared/                       # 跨端共享 schema
├── script/build.ts               # 同时打包 client(Vite)与 server(esbuild)
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

- **Phase 1** ✅ 消费级前端原型(本仓库当前状态)
- **Phase 2** mock 产品数据库扩充 + 真实产品参数补齐
- **Phase 3** 评分逻辑完善:可靠性维度真正参与打分、动态权重归一化
- **Phase 4** AI 推荐解释(LLM 生成「为什么推这台」)
- **Phase 5** 商品链接、价格更新、库存校验
- **Phase 6** 扩展手机 / 耳机 / 平板 / 显示器等品类

## Contributing

这是个原型,以快为先。改动建议:

- 维度 / 品类 → 改 `client/src/lib/dimensions.ts`
- mock 产品 → 改 `client/src/lib/mockProducts.ts`
- 评分公式 → 改 `client/src/lib/scoring.ts`
- 首页 UI 模块 → 改 `client/src/components/home/`
- 用途 chips / 文案 → 改 `client/src/data/`

请保持页面组件(`pages/*.tsx`)尽量瘦,业务逻辑放 `lib/`,UI 块放 `components/`。

## License

MIT
