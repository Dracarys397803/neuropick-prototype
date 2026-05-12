/**
 * NEUROPICK 维度与品类的「单一事实来源」(纯数据,无 UI 依赖)。
 *
 * 这份文件在 client 与 server 之间共享。
 * 不要在这里 import 任何 lucide-react / dom / vite 相关的东西 ——
 * server 在 Node 下加载它,任何浏览器侧依赖都会让构建炸掉。
 *
 * UI 端读取 `icon` 字段并通过自己的 ICON_MAP 转成 lucide 图标组件。
 */

// ---------- 维度 ----------

export type DimensionKey = string;

export type Dimension = {
  /** 维度的唯一 key(也用于 Product.scores 的字段名) */
  key: DimensionKey;
  /** 用户可见的中文名 */
  label: string;
  /** 配置页面用的简短描述 */
  desc: string;
  /** lucide-react 图标名(在 client 端 ICON_MAP 里登记) */
  icon: string;
};

// ---------- 品类 ----------

export type CategoryKey = "laptop" | "phone" | "headphone";

/**
 * 品类元数据 —— 字段保持最小集,只放当前 UI / 评分实际会读取的内容。
 */
export type CategoryMeta = {
  key: CategoryKey;
  label: string;
  dimensions: Dimension[];
  budget: BudgetConfig;
};

export type BudgetConfig = {
  min: number;
  max: number;
  defaultMax: number;
};

// ---------- 数据 ----------

const D = {
  performance: { key: "performance", label: "性能", desc: "CPU/GPU 综合算力,重度任务表现", icon: "Cpu" },
  battery:     { key: "battery",     label: "续航", desc: "日常负载下的离电使用时长",      icon: "BatteryCharging" },
  portability: { key: "portability", label: "便携性", desc: "重量、厚度、出行友好度",      icon: "Feather" },
  display:     { key: "display",     label: "屏幕", desc: "色准、刷新率、亮度、护眼",      icon: "Monitor" },
  build:       { key: "build",       label: "做工", desc: "材质、键盘手感、整体质感",      icon: "Hammer" },
  value:       { key: "value",       label: "性价比", desc: "同价位段的综合竞争力",        icon: "Coins" },
  camera:      { key: "camera",      label: "影像", desc: "主摄、长焦、视频综合表现",      icon: "Camera" },
  handfeel:    { key: "handfeel",    label: "手感", desc: "重量、握持、单手友好度",        icon: "Feather" },
  anc:         { key: "anc",         label: "降噪", desc: "通勤、办公场景下的降噪深度",    icon: "Headphones" },
  sound:       { key: "sound",       label: "音质", desc: "三频均衡、解析、声场",          icon: "Music" },
  comfort:     { key: "comfort",     label: "佩戴", desc: "长时间佩戴的舒适度",            icon: "Feather" },
  ecosystem:   { key: "ecosystem",   label: "生态", desc: "多设备切换、空间音频等",        icon: "Network" },
} as const satisfies Record<string, Dimension>;

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "laptop",
    label: "笔记本电脑",
    dimensions: [D.performance, D.battery, D.display, D.portability, D.value],
    budget: { min: 3000, max: 25000, defaultMax: 18000 },
  },
  {
    key: "phone",
    label: "智能手机",
    dimensions: [D.performance, D.camera, D.battery, D.display, D.handfeel, D.value],
    budget: { min: 1500, max: 12000, defaultMax: 6000 },
  },
  {
    key: "headphone",
    label: "无线耳机",
    dimensions: [D.anc, D.sound, D.comfort, D.battery, D.ecosystem, D.value],
    budget: { min: 200, max: 3500, defaultMax: 1500 },
  },
];

// ---------- Helpers (纯函数) ----------

export function getCategory(key: string): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

/**
 * 把启用维度的权重打成完整 Record(关闭维度补 0)。
 * Home / RecommendationPreview / Result 三处都要做同样的事,统一抽到这里。
 */
export function buildDimWeights(
  dimensions: Dimension[],
  weights: Record<string, number>,
  disabled: ReadonlySet<string> = new Set()
): Record<DimensionKey, number> {
  return dimensions.reduce<Record<DimensionKey, number>>((acc, d) => {
    acc[d.key] = disabled.has(d.key) ? 0 : (weights[d.key] ?? 0);
    return acc;
  }, {} as Record<DimensionKey, number>);
}

export const formatPrice = (p: number) => "¥" + p.toLocaleString("zh-CN");
