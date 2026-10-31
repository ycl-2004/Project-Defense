import type { Rating } from "@/lib/domain";
import { cn } from "@/lib/utils";

/**
 * The mentor's red-pen marks, drawn as strokes: a tick, the half tick Chinese teachers use for
 * "partly right", a cross, and a dash for "not answered". Shape carries the meaning, so colour is
 * never the only signal.
 */
const PATHS: Record<Rating, string> = {
  clear: "M3.5 10.5 7.6 14.2 16.5 4.8",
  partial: "M3.5 10.5 7.6 14.2 16.5 4.8 M10.2 7.2 14.4 11.6",
  misconception: "M4.5 4.5 15.5 15.5 M15.5 4.5 4.5 15.5",
  unanswered: "M5 10 15 10",
};

export function PenMark({ rating, className }: { rating: Rating; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={cn("size-[18px] shrink-0", rating === "unanswered" ? "text-ink-3" : "text-pen", className)}
    >
      <path d={PATHS[rating]} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A circled reference number, the way a teacher ties a margin note to a line. */
export function RefMark({ n, className }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-pen indent-0 font-sans text-[10px] font-semibold leading-none text-pen tabular",
        className,
      )}
    >
      {n}
    </span>
  );
}
