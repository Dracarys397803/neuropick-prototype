/**
 * 右侧栏「社区动态」mock —— 当前阶段固定假数据，
 * 后续接真实社区时这里替换为接口返回。
 */
export type CommunityPost = {
  id: string;
  title: string;
  author: string;
  level: number;     // Lv.N
  likes: number;
  comments: number;
};

export const COMMUNITY_FEED: CommunityPost[] = [
  { id: "p1", title: "2024 年轻薄本选购指南（附推荐清单）", author: "数码小白",   level: 6, likes: 128, comments: 32 },
  { id: "p2", title: "MacBook Air M3 真实体验分享",        author: "摄影师阿杰", level: 7, likes: 96,  comments: 18 },
  { id: "p3", title: "游戏本怎么选？这几点最重要！",        author: "硬件宅小明", level: 5, likes: 77,  comments: 26 },
  { id: "p4", title: "耳机选购避坑指南！小白必看",          author: "耳机发烧友", level: 6, likes: 64,  comments: 14 },
];
