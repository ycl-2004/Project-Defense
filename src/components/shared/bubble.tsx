import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A turn in the conversation. The student's turns sit right on paper; the coach's sit left on the brand wash. */
export function Bubble({
  side,
  label,
  badge,
  children,
  className,
}: {
  side: "you" | "coach";
  label?: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const you = side === "you";
  return (
    <div className={cn("flex flex-col gap-1", you ? "items-end" : "items-start", className)}>
      {(label || badge) && (
        <span className="flex items-center gap-2 px-1 text-[12px] text-ink-3">
          {label}
          {badge}
        </span>
      )}
      <div
        className={cn(
          "max-w-[92%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[14.5px] leading-[1.65]",
          you ? "rounded-br-md bg-sunken text-ink" : "rounded-bl-md bg-brand-soft text-ink",
        )}
      >
        {children}
      </div>
    </div>
  );
}
