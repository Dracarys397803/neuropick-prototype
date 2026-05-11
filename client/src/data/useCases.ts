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
  { id: "coding",    label: "编程开发" },
  { id: "gaming",    label: "游戏" },
  { id: "creative",  label: "创意设计" },
  { id: "video",     label: "影音娱乐" },
  { id: "travel",    label: "出行便携" },
  { id: "daily",     label: "日常使用" },
  { id: "other",     label: "其他" },
];
