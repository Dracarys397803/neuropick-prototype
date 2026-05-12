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
  - 真实 AI 推荐接口
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
│       ├── pages/                 # Home (dashboard) / Configure (legacy) / Result
│       ├── components/
│       │   ├── dashboard/         # 新首页专用:
│       │   │                       #   TopBar / SideNav / StepHeader
│       │   │                       #   ProductTypeGrid / BudgetRange / UseCaseChips
│       │   │                       #   WeightAllocator / RecommendationPreview / CommunityCard
│       │   ├── home/              # 上一版 hero 余留组件(未使用)
│       │   ├── configure/         # PresetPicker / DimensionSliders / BudgetSlider / Summary
│       │   ├── result/            # ProductCard / CompareTable / SummaryCard / ScoreRing 等
│       │   ├── AppShell.tsx       # legacy 外壳(仅 Configure/Result 用)
│       │   ├── CategoryCard.tsx   # legacy(未使用)
│       │   └── ui/                # shadcn/radix 原子组件
│       ├── data/                  # 只服务 UI 的静态数据
│       │   ├── navigation.ts      # 左侧栏 + 顶部导航项
│       │   ├── productTypes.ts    # 6 个产品类型 chip
│       │   ├── useCases.ts        # 主要用途 chips
│       │   ├── communityFeed.ts   # mock 社区动态
│       │   └── scoringExplain.ts  # 维度说明文案
│       ├── lib/
│       │   ├── dimensions.ts      # 维度 / 品类 / 预设 / 预算 单一事实来源
│       │   ├── mockProducts.ts    # mock 产品库(纯数据)
│       │   ├── scoring.ts         # 评分纯函数(支持维度禁用)
│       │   ├── icons.ts           # 图标名 → lucide 组件映射
│       │   └── router.tsx         # 极简 view 切换路由
│       ├── hooks/use-toast.ts     # “敬请期待” toast
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
├── server/                         # Express + Vite dev middleware
├── shared/                         # 跨端共享 schema
├── script/build.ts                 # 同时打包 client 与 server
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
- **Phase 4** AI 推荐解释(LLM 生成「为什么推这台」)
- **Phase 5** 商品链接、价格更新、库存校验
- **Phase 6** 对比 / 收藏 / 评测库 等「敬请期待」模块逐一开启
- **Phase 7** 扩展手机 / 耳机 / 平板 / 手表 / 游戏主机等品类

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
