"use client";

import { usePrefs } from "@/components/providers";
import { RATING_STYLE } from "@/components/shared/tags";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { RATINGS, type Rating } from "@/lib/domain";
import { cn } from "@/lib/utils";

/** One segment per question, in interview order, plus a legend with icon, label and count. */
export function RatingStrip({ ratings, className }: { ratings: Rating[]; className?: string }) {
  const { t, f } = usePrefs();
  const counts = Object.fromEntries(RATINGS.map((rating) => [rating, ratings.filter((item) => item === rating).length]));

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex h-3 gap-[2px]" role="img" aria-label={ratings.map((rating, index) => `${index + 1}: ${t.rating[rating]}`).join(", ")}>
        {ratings.map((rating, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                className={cn("h-full flex-1 rounded-[4px] outline-offset-2", RATING_STYLE[rating].mark)}
                aria-label={`${f(t.interview.progress, { current: index + 1, total: ratings.length })} · ${t.rating[rating]}`}
              />
            </TooltipTrigger>
            <TooltipContent>
              {f(t.interview.progress, { current: index + 1, total: ratings.length })} · {t.rating[rating]}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {RATINGS.map((rating) => {
          const Icon = RATING_STYLE[rating].icon;
          return (
            <li key={rating} className="flex items-center gap-1.5 text-[13px] text-ink-2">
              <Icon className={cn("size-3.5", RATING_STYLE[rating].text)} strokeWidth={2.25} aria-hidden />
              {t.rating[rating]}
              <span className="tabular font-medium text-ink">{counts[rating]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
