import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The exercise book's rules under the student's own writing, one per 28px line. */
const RULED: React.CSSProperties = {
  backgroundImage: "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, var(--rule) 27px, var(--rule) 28px)",
};

/**
 * One turn of the defense. The student writes in ballpoint blue; the mentor writes in red pen,
 * in a teacher's hand (Kai). No bubbles: turns are set like an exercise book, label then text.
 */
export function Turn({
  who,
  label,
  aside,
  children,
  className,
}: {
  who: "student" | "mentor" | "hint";
  label: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className={cn("flex items-center gap-3 text-[13px]", who === "student" ? "text-ink-2" : "text-pen")}>
        <span className="font-medium">{label}</span>
        {aside}
      </div>
      <div
        className={cn(
          "whitespace-pre-wrap break-words",
          who === "student" && "text-[15.5px] leading-[28px] text-ballpoint",
          who === "mentor" && "font-hand text-[17px] leading-[1.75] text-pen",
          who === "hint" && "font-hand text-[16px] leading-[1.75] text-ink-2",
        )}
        style={who === "student" ? RULED : undefined}
      >
        {children}
      </div>
    </div>
  );
}
