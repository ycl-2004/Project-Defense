import { cn } from "@/lib/utils";

/** Three soft dots and a label: the coach is working on something the user just did. */
export function Thinking({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-[13.5px] text-ink-2", className)} role="status">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((index) => (
          <span key={index} className="size-1.5 animate-thinking rounded-full bg-brand" style={{ animationDelay: `${index * 160}ms` }} />
        ))}
      </span>
      {label}
    </span>
  );
}

export function ProgressLine({ className }: { className?: string }) {
  return (
    <span className={cn("block h-1 overflow-hidden rounded-full bg-sunken", className)} aria-hidden>
      <span className="block h-full w-2/5 animate-indeterminate rounded-full bg-brand" />
    </span>
  );
}
