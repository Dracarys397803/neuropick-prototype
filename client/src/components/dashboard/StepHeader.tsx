type Props = {
  /** 步骤序号（从 1 开始） */
  index: number;
  title: string;
  /** 标题后面的辅助说明（可选） */
  hint?: React.ReactNode;
  /** 右侧自定义区（如「已分配 82/100」） */
  trailing?: React.ReactNode;
};

/**
 * 配置卡片里的单步骤标题：圆形序号 + 大标题 + 提示。
 */
export function StepHeader({ index, title, hint, trailing }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="size-6 grid place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
        {index}
      </span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      {trailing && <div className="ml-auto">{trailing}</div>}
    </div>
  );
}
