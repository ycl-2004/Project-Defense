"use client";

import { usePrefs } from "@/components/providers";
import type { PlannedQuestion } from "@/lib/domain";
import { cn } from "@/lib/utils";

/** One segment per main question: done, current, upcoming. */
export function InterviewProgress({ plan, index, finished }: { plan: PlannedQuestion[]; index: number; finished: boolean }) {
  const { t, f } = usePrefs();
  const current = plan[Math.min(index, plan.length - 1)];
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline gap-2 text-[13px]">
        <span className="tabular font-medium text-ink">
          {f(t.interview.progress, { current: Math.min(index + 1, plan.length), total: plan.length })}
        </span>
        {!finished && current && <span className="truncate text-ink-3">· {t.layer[current.layer].name}</span>}
      </div>
      <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={plan.length} aria-valuenow={finished ? plan.length : index}>
        {plan.map((question, position) => (
          <span
            key={question.id}
            className={cn(
              "h-1.5 w-6 rounded-full transition-colors duration-300 sm:w-9",
              finished || position < index ? "bg-brand" : position === index ? "bg-brand/45" : "bg-line-strong",
            )}
          />
        ))}
      </div>
    </div>
  );
}
