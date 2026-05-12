# Changelog

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。日期使用 UTC+8(Asia/Shanghai)。

---

## 2026-05-12 · `ui/consumer-app-redesign` (推荐结果页 UI 升级)

### Added
- **第 4-10 名单列横向卡片列表**:在 Top 3 重点推荐区域下方新增「第 4-10 名」区块,做成「一行一个」的单列横向卡片,按排名从上到下排列。每行包含:排名编号 `#N` · 缩略图 · 品牌+产品名+一句话说明 · 价格+2-4 个亮点标签 · 圆形匹配分数 · `对比` / `查看详情` 按钮。窄屏(<768px)下卡片内部允许换行,但仍严格保持「一张卡片一行」结构,不会变成多列网格。
- **`LaptopThumbnail` 组件**:用 SVG 绘制更像真实笔记本的小图(上盖+屏幕+高光+底座梯形+键盘井+触控板),用 `product.accent` 上色统一三张卡片的视觉风格,彻底替换原本的 emoji 占位。
- **`TopRecommendationCard` / `RankedListItem` 两个独立组件**:把推荐区块拆出去,Top 3 用大卡(带 banner 缩略图+维度条+优缺点+CTA),4-10 名用紧凑横向行卡。Result 页只负责数据切片和布局,不再混进单卡 markup。
- **mock 笔记本库扩到 11 款**:在原有 7 款基础上补 Zenbook S 14 / Spectre x360 14 / Swift Edge 16 / MateBook X Pro,让 Top 3 + 4-10 名页面有完整 10 行数据。

### Changed
- **笔记本默认预算从 ¥10,000 调到 ¥18,000**:之前默认预算只能放进 4 款笔记本,触发不到「Top 3 + 4-10 名」的设计意图。提高后 10/11 款落在预算内,产品列表完整。
- **「查看详情」当前是占位**:点按后弹 toast「敬请期待 - 详情页正在路上」,把后续真实详情页路由的 TODO 显式留出来。

### Removed
- `client/src/components/result/ProductCard.tsx`:被 `TopRecommendationCard` + `RankedListItem` 完全取代,无残留引用。

### Validation (Playwright e2e)
- 1440×900:Top 3 出现 3 张大卡(`card-top-*`),第 4-10 名容器 `[data-testid="ranked-list"]` 渲染 7 行(`row-ranked-*`),每行可定位到对比按钮 + 查看详情链接 + 缩略图 SVG。
- 768×1024:依然 7 行,每行宽度填满列表容器(524 px),`row[i+1].y > row[i].y + row[i].height`,严格单列堆叠,无并排。
- 视觉:三张 Top 3 缩略图配色风格一致(屏幕+底座轮廓清晰),4-10 名缩略图与 Top 3 同源同风格。

---

## 2026-05-12 · `ui/consumer-app-redesign` (slider 独立补丁)

### Fixed
- **拖一个 slider 会让其他 slider 的拇指也动**:上个补丁用「动态 max = 100 - 其他维度之和」防超界,逻辑上对,但拇指位置 = value/max,max 一变别人的拇指也跳,看起来像「拖 A 带动 B/C/D」。
  现在所有 slider 的 `max` 恒为 100,拇指位置始终与真实百分比一致;越界护栏下沉到 `onChange` 里做 `value = min(输入, 100 - 其他启用维度之和)`,拖到满额就停在边界,其他 slider 纹丝不动。

### Validation (Playwright e2e, 1440×900)
- 默认 100/100,拖 perf 到 80 → 被 clamp 回 30,其他 4 项 value 和 thumb 位置完全不变。
- battery 从 20 调到 5 (total 掊到 85) → perf 可从 30 拖到 45 (掊回 100)。
- 五根 slider 的 thumbPct 都严格等于「本维度百分比 / 100」。

---

## 2026-05-12 · `ui/consumer-app-redesign` (修复补丁)

### Fixed
- **结果页返回会跳到旧版 Configure 页**:`reconfigure` 跳的是 `configure` 路由 = 旧版问卷页(死页面)。已彻底删除 `configure` 路由 + `Configure.tsx` + 旧 `components/configure/` + `AppShell.tsx` + 残留 `components/home/`。Result 页的「返回首页 / 重新调整」全部回到新版 dashboard 首页。
- **首页缺少 100 分约束**:权重 slider 可拖过 100,且按钮一直可点。现在每个 slider 的 max 动态等于「100 - 其他启用维度之和」,从交互层根本不可能超 100;total ≠ 100 时按钮 disabled + 提示「还需要分配 X 分」或「已超出 X 分」。
- **右侧栏在主流桌面尺寸看不到**:之前用 `xl:grid-cols-[1fr_320px]`(1280px 才触发),很多 13–14 寸笔记本宽度不到。改成 `lg:` 断点(1024px),桌面端必出现。
- **关闭维度后总分残留**:之前关掉一个维度,如果它带着权重,再开回来还是带着旧权重,容易做出 >100 的状态。现在关掉时立即清零该维度的权重。

### Changed
- 默认权重改为正好 100 分:performance 30 + battery 20 + display 20 + portability 15 + value 15 = 100。
- Result 页改用新版 dashboard 壳(TopBar + SideNav),不再用 legacy AppShell,导航连贯性打通。
- `Result.tsx` 中 `onReconfigure` 重命名为 `onBackHome`,语义更清晰。

### Added
- 权重区右上角 100 分徽章 + 三态颜色(under: amber / ok: emerald / over: red)。
- 权重进度条:0..100 用绿色,>100 部分红色独立显示。
- 「平均分配」按钮:一键把 100 分均分到所有启用维度。
- 「重置」按钮:恢复默认权重 + 全部开启。

### Removed
- `client/src/pages/Configure.tsx`(旧问卷页,死代码)。
- `client/src/components/AppShell.tsx`(旧 shell,被 dashboard 替换)。
- `client/src/components/configure/`(5 个旧问卷子组件)。
- `client/src/components/home/`(上次 redesign 中间产物 3 个组件)。
- `client/src/components/CategoryCard.tsx`、`client/src/data/scoringExplain.ts`(无引用)。
- router 的 `configure` 视图类型。

### Validation (Playwright e2e, 1440×900)
- 首页:推荐预览 ✓ + 社区动态 ✓ + 徽章 100/100 ✓ + 按钮可点。
- 拖动 perf 试图到 99 → 被 max=30 钳制回 30,总分始终 ≤ 100。
- 关闭便携 → 总分 85,按钮 disabled,提示「还需要分配 15 分」。
- 重开便携(已清零)→ 总分仍 85,按钮 disabled。
- 平均分配 → 100,按钮可点。
- 生成 → Result(SideNav + TopBar 都在)→ 顶部「返回首页」/ 底部「回到首页重新调整」/ Logo / SideNav-advisor 四个入口都回到 Home。
- 手机品类点击 → toast「手机 · 敬请期待」。
- 移动端 390×800:SideNav `display:none`,顶导 nav hidden,右侧栏 stack 到主卡下方。
- 控制台 0 errors。

---

## 2026-05-12 · `ui/consumer-app-redesign`

### Changed
- **首页改成 dashboard 布局**:左侧 SideNav(8 项)+ 顶部 TopBar(5 项 + 搜索/通知/头像/主题/GitHub)+ 中间 4 步配置卡 + 右侧 Top-3 实时预览 + 社区动态。
- 笔记本评分维度从 6 个精简到 5 个(去掉 build),与设计稿一致:performance / battery / display / portability / value。
- 默认权重改为 0–100 刻度(performance 30 / battery 20 / display 15 / portability 10 / value 7),与截图同步。
- `lib/scoring.ts`:`scoreProducts(cat, weights, budget, disabledDims?)` 新增可选参数,被关闭的维度真正不参与打分。
- `lib/router.tsx` + `pages/Result.tsx` + `App.tsx`:result 视图透传 `disabledDims?: string[]`。
- `pages/Home.tsx` 彻底重写为 dashboard 编排页,只做 layout + 状态串联。

### Added
- `components/dashboard/SideNav.tsx`:8 项左侧导航,首页 / 选购助手 可用,其余 toast「敬请期待」。
- `components/dashboard/TopBar.tsx`:Logo + 5 项顶部导航 + 搜索框 + 通知 + 头像 + 主题切换 + GitHub。
- `components/dashboard/StepHeader.tsx`:统一的「编号圆圈 + 标题 + 提示 + 右侧 slot」步骤头。
- `components/dashboard/ProductTypeGrid.tsx`:6 个品类网格,只有笔记本可点,其它即将。
- `components/dashboard/BudgetRange.tsx`:带气泡显示当前预算的 slider。
- `components/dashboard/UseCaseChips.tsx`:多选 chip,选中显示 ✓。
- `components/dashboard/WeightAllocator.tsx`:每个维度一行 slider + 百分比 + 开关 + 配色条;导出 `useWeightTotal()` 助手。
- `components/dashboard/RecommendationPreview.tsx`:右侧实时 Top-3 卡,直接复用 `scoreProducts()`。
- `components/dashboard/CommunityCard.tsx`:右侧 mock 社区动态列表。
- `data/navigation.ts`:`SIDE_NAV` 8 项 + `TOP_NAV` 5 项。
- `data/productTypes.ts`:6 个品类元数据(笔记本 available,其它 即将)。
- `data/communityFeed.ts`:4 条 mock 帖。
- `data/useCases.ts` 扩到 9 项:办公/学习/编程/游戏/创作/视频/出差/日常/其他。
- `lib/icons.ts` 补充:Tablet / Watch / Gamepad2 / Home / Compass / Scale / Heart / FileText / MessageCircle / Trophy / UserCircle。

### UX Notes
- 维度开关是真开关:关掉「便携性」后总分从 82 掉到 72,Top-3 排序立刻刷新。
- 自定义维度按钮只展开输入框,**前端态**,不会污染评分逻辑。
- 所有未开放入口(其它品类、其它导航、自定义维度提交等)统一走 `useToast()` 弹「xxx · 敬请期待」,行为一致。
- 默认主题改为 light,可在 TopBar 切换。
- 移动端(390px):左侧 SideNav 折叠隐藏,产品类型 2 列网格,所有控件可点。

### Known Issues
- Configure / Result 页仍走 legacy `AppShell`,没套新 dashboard 壳,导航连贯性待打通。
- mock 产品库只有 7 款笔记本,Top-3 切换幅度有限。
- 自定义维度仅 UI,不参与评分。

### Next Steps
- 让 Configure / Result 也用 TopBar + SideNav 统一壳。
- mock 产品库扩到 10–15 款笔记本,让权重/预算调节差异更明显。
- 自定义维度接入评分(允许给手输维度临时打分或用 fallback)。
- 启用 GitHub Pages 拿一个稳定预览链接(workflow 已就绪)。

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
