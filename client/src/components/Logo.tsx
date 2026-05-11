export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={"inline-flex items-center gap-2 cursor-pointer " + className}
      data-testid="link-logo-home"
      aria-label="NEUROPICK 首页"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="30" height="30" rx="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M9 23V9h2l6 9V9h2v14h-2l-6-9v9H9z"
          fill="currentColor"
        />
        <circle cx="24" cy="9" r="2" fill="hsl(var(--primary))" />
      </svg>
      <span className="font-mono text-sm font-semibold tracking-[0.2em]">NEUROPICK</span>
    </span>
  );
}
