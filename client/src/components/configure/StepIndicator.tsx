const STEPS = [
  { n: 1, label: "权重" },
  { n: 2, label: "预算" },
] as const;

export function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      {STEPS.map((s, idx) => (
        <div key={s.n} className="flex items-center gap-2">
          <div
            className={`size-7 rounded-full grid place-items-center border ${
              step >= s.n
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground"
            }`}
          >
            {s.n}
          </div>
          <span className={step >= s.n ? "text-foreground" : "text-muted-foreground"}>
            {s.label}
          </span>
          {idx < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
        </div>
      ))}
    </div>
  );
}
