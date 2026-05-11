/**
 * 「选择产品类型」grid —— 首页第一步。
 *
 * 只有 laptop 是 available；其他几项保留视觉占位、点击给出「敬请期待」。
 * 后续真正开放某品类时,只需要把 available 改 true,并到 lib/dimensions.ts
 * 把对应 CategoryMeta 的 status 改成 "available"。
 */
export type ProductType = {
  id: string;
  label: string;
  icon: string;        // lucide 图标名（来自 lib/icons.ts 注册）
  available: boolean;
};

export const PRODUCT_TYPES: ProductType[] = [
  { id: "laptop",   label: "笔记本电脑", icon: "Laptop",     available: true  },
  { id: "phone",    label: "手机",       icon: "Smartphone", available: false },
  { id: "earbuds",  label: "耳机",       icon: "Headphones", available: false },
  { id: "tablet",   label: "平板电脑",   icon: "Tablet",     available: false },
  { id: "watch",    label: "智能手表",   icon: "Watch",      available: false },
  { id: "console",  label: "游戏主机",   icon: "Gamepad2",   available: false },
];
