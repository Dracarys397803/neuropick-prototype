# Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。日期使用 UTC+8(Asia/Shanghai)。

---

## 2026-05-11 · `ui/consumer-app-redesign`

### Changed
- 首页从「赛博 / 企业 SaaS Landing」彻底改成 **任务型 consumer 选购工具**。
  - 新 Hero:左侧标题 + 副标题 + 两个 CTA(开始选择笔记本 / 查看评分逻辑),右侧 Quick Start Card(产品类型、预算、用途 chips、CTA)。
  - 类别区域改为小型卡片列表,显式标注「可用 / 即将支持」状态;手机、耳机为 coming-soon。
  - 新增「推荐逻辑说明」区域:6 个评分维度卡片(性能 / 续航 / 屏幕 / 便携 / 价格 / 可靠性),工具说明型文案。
- AppShell:
  - 默认主题从 dark 改成 light,减少深色赛博感。
  - 顶部导航对 coming-soon 品类禁用并加 tooltip,GitHub 按钮指向真实仓库。
  - 移除大写 mono 装饰、版本号低调化。
- Configure / Result 页头:
  - 移除扫描线、网格 fade 背景。
  - 移除 `// CONFIGURE / LAPTOP`、`// REPORT / LAPTOP` 等 mono 大写装饰。
  - 主标题换成更口语的「调一下你的需求 / 为你找到 X 款合适产品」。
- `index.css`:删除 `glow-cyan` / `glow-text` / `scanline` 三个霓虹效果 class。`ring-conic` / `bg-grid` / `fade-up` 等保留(结果页 ScoreRing 仍在用)。
- `lib/dimensions.ts`:`CategoryMeta` 新增 `status: "available" | "coming-soon"` 字段;laptop = available,phone/headphone = coming-soon。laptop 改用 `Laptop` 图标。
- `lib/icons.ts`:补充 `Laptop`、`ShieldCheck`。

### Added
- `client/src/data/useCases.ts`:笔记本的「主要用途」chips 配置(办公/学习/编程/游戏/视频剪辑/轻薄出差)。
- `client/src/data/scoringExplain.ts`:6 个评分维度的工具说明文案(可靠性是新增的展示性维度,暂未参与实际打分)。
- `client/src/components/home/QuickStartCard.tsx`:Hero 右侧主表单。
- `client/src/components/home/CategoryListItem.tsx`:小型品类卡(可用/即将)。
- `client/src/components/home/ScoringExplain.tsx`:推荐逻辑 6 卡片区域。
- `.github/workflows/deploy.yml`:GitHub Pages 自动部署工作流。
- `vercel.json`:静态前端 + SPA fallback,方便有人想在 Vercel 临时部署前端预览。
- `README.md`、`CHANGELOG.md`。

### UX Notes
- 首屏直接可输入预算 / 选用途 → 用户在 hero 区就能开始任务,而不是先看 slogan。
- 「即将支持」品类:在 Quick Start Card 上是 disabled 标签,在类别列表里是灰态卡,在顶部导航是禁用按钮。三处一致。
- 移动端(390px):标题 + CTA 在上,Quick Start Card 在下,单列排列;表单元素全部可点。
- 评分逻辑卡片用工具语言,避免营销腔。

### Known Issues
- 「可靠性」维度只展示在首页说明区,尚未进入实际评分公式(后续 Phase 3 会接入)。
- Quick Start Card 里的预算 / 用途选择目前不会传到 Configure 页(下一步会接 `useRouter` 的 state 透传)。
- 顶部导航的 GitHub 链接固定指向当前仓库,fork 后需要手动改 `AppShell.tsx` 的 `REPO_URL`。

### Next Steps
- 把 QuickStartCard 的 `budget` / `useCases` 通过 `router.go` 透传到 Configure 页,作为初始值。
- 在 `lib/scoring.ts` 引入 `reliability` 维度,并在 Product 类型上补齐字段。
- 把 mock 产品库拆 `client/src/data/products.ts`,与 `lib/mockProducts.ts` 解耦(目前合二为一)。

---

## 2026-05-11 · `refactor/maintainability`

### Changed
- 全量重构以提高可维护性:
  - `lib/dimensions.ts` 成为维度/品类/预设/预算的单一事实来源。
  - 拆出 `lib/mockProducts.ts`(纯数据)、`lib/scoring.ts`(纯函数评分)、`lib/icons.ts`(图标映射)。
  - `Product.scores` 用 `Record<DimensionKey, number>` 强类型。
  - Configure / Result 拆出 13 个小组件;页面只做编排。
  - 删除 `lib/data.ts`、`lib/recommend.ts` 与无用 imports。

### UX Notes
- 视觉与流程保持不变(本次仅结构重构)。

### Known Issues
- 仍保留 cyberpunk 视觉,后续会做消费级 UI 重构(见下一条记录)。

### Next Steps
- 消费级 UI 重构(已于同日完成,见上一条记录)。
