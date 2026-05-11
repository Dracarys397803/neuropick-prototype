/**
 * 推荐逻辑展示用的 6 个维度 —— Home 页底部 ScoringExplain 区域。
 *
 * 这是「面向消费者」的解释文案，比 lib/dimensions.ts 里
 * 偏开发者的 desc 更白话，不卷参数，只说判断标准。
 */
export type ScoringExplainItem = {
  id: string;
  label: string;
  /** 一句话工具说明，不堆形容词 */
  blurb: string;
  /** lucide 图标名（已在 lib/icons.ts 登记） */
  icon: string;
};

export const SCORING_EXPLAIN: ScoringExplainItem[] = [
  { id: "performance", label: "性能",   blurb: "看处理器、显卡和内存能不能跑你常用的软件。",          icon: "Cpu" },
  { id: "battery",     label: "续航",   blurb: "看日常用法下，离电能撑多久。",                       icon: "BatteryCharging" },
  { id: "display",     label: "屏幕",   blurb: "看色准、亮度和刷新率，决定看着累不累。",              icon: "Monitor" },
  { id: "portability", label: "便携",   blurb: "看重量和厚度，要不要每天背着走。",                    icon: "Feather" },
  { id: "value",       label: "价格",   blurb: "看同价位段里同配置能给你什么。",                      icon: "Coins" },
  { id: "reliability", label: "可靠性", blurb: "看品牌口碑、售后政策和长期使用反馈。",                icon: "ShieldCheck" },
];
