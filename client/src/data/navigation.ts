/**
 * 侧栏 & 顶部导航配置 ——
 * 单一来源；可用项点击触发对应动作，敬请期待项统一弹 toast。
 */
export type NavItem = {
  id: string;
  label: string;
  icon: string;          // lucide 图标名
  available: boolean;
};

/** 左侧侧栏（垂直） */
export const SIDE_NAV: NavItem[] = [
  { id: "home",      label: "首页",     icon: "Home",        available: true  },
  { id: "advisor",   label: "选购助手", icon: "Compass",     available: true  },
  { id: "compare",   label: "对比",     icon: "Scale",       available: false },
  { id: "favorites", label: "收藏",     icon: "Heart",       available: false },
  { id: "reviews",   label: "评测库",   icon: "FileText",    available: false },
  { id: "community", label: "社区",     icon: "MessageCircle", available: false },
  { id: "ranking",   label: "排行榜",   icon: "Trophy",      available: false },
  { id: "profile",   label: "个人中心", icon: "UserCircle",  available: false },
];

/** 顶部导航（水平） */
export const TOP_NAV: NavItem[] = [
  { id: "advisor",   label: "选购助手", icon: "Compass",       available: true  },
  { id: "compare",   label: "对比",     icon: "Scale",         available: false },
  { id: "reviews",   label: "评测库",   icon: "FileText",      available: false },
  { id: "ranking",   label: "排行榜",   icon: "Trophy",        available: false },
  { id: "community", label: "社区",     icon: "MessageCircle", available: false },
];
