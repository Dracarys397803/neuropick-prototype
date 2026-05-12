/**
 * NEUROPICK 维度与品类的「单一事实来源」。
 *
 * 想新增一个评分维度或一个新品类时，只需在这里改动；
 * UI、评分、Mock 数据全部 map 自这份配置。
 */

// ---------- 维度 ----------

export type DimensionKey = string;

export type Dimension = {
  /** 维度的唯一 key（也用于 Product.scores 的字段名） */
  key: DimensionKey;
  /** 用户可见的中文名 */
  label: string;
  /** 配置页面用的简短描述 */
  desc: string;
  /** lucide-react 图标名（在 ICON_MAP 里登记） */
  icon: string;
};

// ---------- 品类 ----------

export type CategoryKey = "laptop" | "phone" | "headphone";

export type CategoryStatus = "available" | "coming-soon";

export type CategoryMeta = {
  key: CategoryKey;
  /** 品类显示名 */
  label: string;
  /** Hero 区下方的一句话 */
  tagline: string;
  /** Home 页用的导航图标 */
  navIcon: string;
  /** 是否已开放配置流程 */
  status: CategoryStatus;
  /** 该品类下的所有评分维度 */
  dimensions: Dimension[];
  /** 预设画像，用户一键应用 */
  presets: Preset[];
  /** 预算 slider 的范围 */
  budget: BudgetConfig;
};

export type Preset = {
  name: string;
  weights: Record<DimensionKey, number>;
};

export type BudgetConfig = {
  min: number;
  max: number;
  defaultMax: number;
};

// ---------- 数据 ----------

/** 维度复用：常用维度抽出来减少重复 */
const D = {
  performance: { key: "performance", label: "性能", desc: "CPU/GPU 综合算力，重度任务表现", icon: "Cpu" },
  battery:     { key: "battery",     label: "续航", desc: "日常负载下的离电使用时长",   icon: "BatteryCharging" },
  portability: { key: "portability", label: "便携性", desc: "重量、厚度、出行友好度",   icon: "Feather" },
  display:     { key: "display",     label: "屏幕", desc: "色准、刷新率、亮度、护眼",   icon: "Monitor" },
  build:       { key: "build",       label: "做工", desc: "材质、键盘手感、整体质感",   icon: "Hammer" },
  value:       { key: "value",       label: "性价比", desc: "同价位段的综合竞争力",     icon: "Coins" },
  camera:      { key: "camera",      label: "影像", desc: "主摄、长焦、视频综合表现",   icon: "Camera" },
  handfeel:    { key: "handfeel",    label: "手感", desc: "重量、握持、单手友好度",     icon: "Feather" },
  anc:         { key: "anc",         label: "降噪", desc: "通勤、办公场景下的降噪深度", icon: "Headphones" },
  sound:       { key: "sound",       label: "音质", desc: "三频均衡、解析、声场",       icon: "Music" },
  comfort:     { key: "comfort",     label: "佩戴", desc: "长时间佩戴的舒适度",         icon: "Feather" },
  ecosystem:   { key: "ecosystem",   label: "生态", desc: "多设备切换、空间音频等",     icon: "Network" },
} as const satisfies Record<string, Dimension>;

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "laptop",
    label: "笔记本电脑",
    tagline: "办公、创作、游戏，按你的预算和用途挑一台合适的。",
    navIcon: "Laptop",
    status: "available",
    dimensions: [D.performance, D.battery, D.display, D.portability, D.value],
    presets: [
      { name: "性能优先", weights: { performance: 5, battery: 2, portability: 1, display: 3, value: 3 } },
      { name: "便携优先", weights: { performance: 2, battery: 4, portability: 5, display: 3, value: 3 } },
      { name: "创作设计", weights: { performance: 4, battery: 3, portability: 2, display: 5, build: 4, value: 2 } },
      { name: "性价比党", weights: { performance: 3, battery: 3, portability: 3, display: 3, build: 2, value: 5 } },
    ],
    budget: { min: 3000, max: 25000, defaultMax: 18000 },
  },
  {
    key: "phone",
    label: "智能手机",
    tagline: "影像、性能、续航、手感，按你的取舍排序。",
    navIcon: "Smartphone",
    status: "coming-soon",
    dimensions: [D.performance, D.camera, D.battery, D.display, D.handfeel, D.value],
    presets: [
      { name: "性能游戏", weights: { performance: 5, camera: 2, battery: 4, display: 4, handfeel: 3, value: 3 } },
      { name: "拍照旗舰", weights: { performance: 3, camera: 5, battery: 3, display: 4, handfeel: 3, value: 2 } },
      { name: "续航党",   weights: { performance: 3, camera: 2, battery: 5, display: 3, handfeel: 3, value: 4 } },
      { name: "性价比",   weights: { performance: 3, camera: 3, battery: 3, display: 3, handfeel: 3, value: 5 } },
    ],
    budget: { min: 1500, max: 12000, defaultMax: 6000 },
  },
  {
    key: "headphone",
    label: "无线耳机",
    tagline: "降噪、音质、佩戴、生态，按使用场景挑选。",
    navIcon: "Headphones",
    status: "coming-soon",
    dimensions: [D.anc, D.sound, D.comfort, D.battery, D.ecosystem, D.value],
    presets: [
      { name: "通勤降噪", weights: { anc: 5, sound: 3, comfort: 4, battery: 3, ecosystem: 2, value: 3 } },
      { name: "听歌为主", weights: { anc: 2, sound: 5, comfort: 3, battery: 3, ecosystem: 2, value: 3 } },
      { name: "生态体验", weights: { anc: 3, sound: 3, comfort: 3, battery: 3, ecosystem: 5, value: 3 } },
      { name: "百元尝鲜", weights: { anc: 3, sound: 3, comfort: 3, battery: 3, ecosystem: 2, value: 5 } },
    ],
    budget: { min: 200, max: 3500, defaultMax: 1500 },
  },
];

// ---------- Helpers ----------

export function getCategory(key: string): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

/** 把维度数组转为 0 分基准的权重对象，便于 useState 初始化 */
export function emptyWeights(dims: Dimension[]): Record<string, number> {
  return Object.fromEntries(dims.map((d) => [d.key, 3]));
}

export const formatPrice = (p: number) => "¥" + p.toLocaleString("zh-CN");
