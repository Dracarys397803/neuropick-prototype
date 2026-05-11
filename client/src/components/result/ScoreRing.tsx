type Props = { pct: number; compact?: boolean };

export function ScoreRing({ pct, compact }: Props) {
  const size = compact ? 44 : 56;
  const stroke = compact ? 4 : 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary) / 0.6))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className={`font-mono font-semibold tabular-nums ${compact ? "text-xs" : "text-sm"}`}>
          {pct}
        </div>
      </div>
    </div>
  );
}
