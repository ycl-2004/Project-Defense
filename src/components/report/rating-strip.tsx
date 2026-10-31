"use client";

import { usePrefs } from "@/components/providers";
import { PenMark } from "@/components/shared/marks";
import { RATINGS, type Rating } from "@/lib/domain";
import { cn } from "@/lib/utils";

/** The teacher's marks down the margin: one square per question in order, then a legend with mark, label and count. */
export function RatingStrip({ ratings, className }: { ratings: Rating[]; className?: string }) {
  const { t, f } = usePrefs();
  const counts = Object.fromEntries(RATINGS.map((rating) => [rating, ratings.filter((item) => item === rating).length]));

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <ol className="flex flex-wrap gap-2" aria-label={t.report.ratings}>
        {ratings.map((rating, index) => (
          <li
            key={index}
            className="flex w-11 flex-col items-center gap-1"
            aria-label={`${f(t.interview.progress, { current: index + 1, total: ratings.length })} · ${t.rating[rating]}`}
          >
            <span className="grid size-11 place-items-center border border-rule-strong">
              <PenMark rating={rating} className="size-6" />
            </span>
            <span className="tabular text-[12px] text-ink-3" aria-hidden>
              {index + 1}
            </span>
          </li>
        ))}
      </ol>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {RATINGS.map((rating) => (
          <li key={rating} className="flex items-center gap-1.5 text-[13px] text-ink-2">
            <PenMark rating={rating} className="size-4" />
            {t.rating[rating]}
            <span className="tabular font-medium text-ink">{counts[rating]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
