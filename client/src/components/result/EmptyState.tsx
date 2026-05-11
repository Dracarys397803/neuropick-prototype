import { AlertTriangle, RotateCcw } from "lucide-react";

type Props = { onBackHome: () => void };

export function EmptyState({ onBackHome }: Props) {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="size-14 rounded-full bg-muted mx-auto grid place-items-center">
        <AlertTriangle className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">预算范围内暂无匹配产品</h3>
      <p className="mt-2 text-sm text-muted-foreground">请回到首页调高预算或调整维度权重,再试一次。</p>
      <button
        type="button"
        onClick={onBackHome}
        className="mt-6 inline-flex items-center gap-2 px-4 h-10 rounded-md border bg-card hover-elevate text-sm"
        data-testid="button-empty-back-home"
      >
        <RotateCcw className="size-4" /> 回到首页重新配置
      </button>
    </div>
  );
}
