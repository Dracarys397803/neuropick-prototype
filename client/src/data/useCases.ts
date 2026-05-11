/**
 * 「主要用途」chips —— Home 页 Quick Start Card 用。
 * 未来要接真实推荐时，这里的 id 会用作产品标签匹配的依据。
 */
export type UseCase = {
  id: string;
  label: string;
};

export const LAPTOP_USE_CASES: UseCase[] = [
  { id: "office",    label: "办公" },
  { id: "study",     label: "学习" },
  { id: "coding",    label: "编程" },
  { id: "gaming",    label: "游戏" },
  { id: "video",     label: "视频剪辑" },
  { id: "travel",    label: "轻薄出差" },
];
