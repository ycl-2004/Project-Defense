import { cn } from "@/lib/utils";

/** Three red squares and a label: the mentor is reading what the student just wrote. */
export function Thinking({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-[13.5px] text-ink-2", className)} role="status">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span key={index} className="size-1.5 animate-thinking bg-pen" style={{ animationDelay: `${index * 160}ms` }} />
        ))}
      </span>
      {label}
    </span>
  );
}

export function ProgressLine({ className }: { className?: string }) {
  return (
    <span className={cn("block h-px overflow-hidden bg-rule-strong", className)} aria-hidden>
      <span className="block h-px w-2/5 animate-indeterminate bg-pen" />
    </span>
  );
}
