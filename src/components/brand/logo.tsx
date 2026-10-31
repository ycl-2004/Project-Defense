import { cn } from "@/lib/utils";

/** A speech bubble holding a pair of code brackets: talking about your own code. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="9" fill="var(--brand)" />
      <path
        d="M9 8.5h14a3 3 0 0 1 3 3v7.2a3 3 0 0 1-3 3h-7l-4.6 3.6v-3.6H9a3 3 0 0 1-3-3v-7.2a3 3 0 0 1 3-3z"
        fill="var(--on-brand)"
      />
      <path
        d="M13.4 12.4 11 15.1l2.4 2.7M18.6 12.4l2.4 2.7-2.4 2.7"
        fill="none"
        stroke="var(--brand)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ name, latin, className }: { name: string; latin: string; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-semibold tracking-[0.01em] text-ink">{name}</span>
        <span className="mt-1 font-display text-[11px] font-medium tracking-[0.04em] text-ink-3">{latin}</span>
      </span>
    </span>
  );
}
