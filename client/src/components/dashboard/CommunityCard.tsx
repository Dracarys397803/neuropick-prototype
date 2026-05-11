import { MessageSquare, ChevronRight, ThumbsUp, MessageCircle, PenSquare } from "lucide-react";
import { COMMUNITY_FEED } from "@/data/communityFeed";
import { useToast } from "@/hooks/use-toast";

const PALETTE = [
  "hsl(210 70% 55%)",
  "hsl(28 90% 56%)",
  "hsl(265 70% 60%)",
  "hsl(340 70% 60%)",
];

/**
 * 右侧栏「社区动态」mock —— 列表 + 点赞 / 评论数。
 * 当前为静态展示，所有点击都弹「敬请期待」。
 */
export function CommunityCard() {
  const { toast } = useToast();
  const ping = () => toast({ title: "社区 · 敬请期待" });

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <MessageSquare className="size-3.5 text-primary" />
          社区动态
        </h3>
        <button
          type="button"
          onClick={ping}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          查看全部
          <ChevronRight className="size-3" />
        </button>
      </div>

      <ul className="divide-y" data-testid="community-list">
        {COMMUNITY_FEED.map((p, i) => (
          <li
            key={p.id}
            className="flex items-start gap-3 py-2.5"
            data-testid={`community-item-${i}`}
          >
            <div
              className="size-9 shrink-0 rounded-full grid place-items-center text-white text-xs font-bold"
              style={{ background: PALETTE[i % PALETTE.length] }}
              aria-hidden
            >
              {p.author.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <button
                type="button"
                onClick={ping}
                className="text-sm font-medium text-foreground/90 hover:text-primary text-left truncate w-full"
              >
                {p.title}
              </button>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                <span>{p.author}</span>
                <span className="px-1.5 py-px rounded bg-muted text-foreground/70 font-mono text-[10px]">
                  Lv.{p.level}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <ThumbsUp className="size-3" /> {p.likes}
                </span>
                <span className="inline-flex items-center gap-0.5">
                  <MessageCircle className="size-3" /> {p.comments}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={ping}
        className="w-full mt-2 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition"
        data-testid="button-create-post"
      >
        <PenSquare className="size-3.5" />
        发布新动态
      </button>
    </div>
  );
}
