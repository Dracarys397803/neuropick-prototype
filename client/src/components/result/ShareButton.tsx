import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard 不可用时静默失败，原型阶段无需提示 */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 px-3 h-9 rounded-md border bg-card hover-elevate text-sm"
      data-testid="button-share-report"
    >
      {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
      {copied ? "已复制" : "复制报告链接"}
    </button>
  );
}
