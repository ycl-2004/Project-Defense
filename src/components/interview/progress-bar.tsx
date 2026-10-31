"use client";

import { usePrefs } from "@/components/providers";
import { LIMITS } from "@/lib/config";
import type { PlannedQuestion, Thread } from "@/lib/domain";
import { followUpsUsed } from "@/lib/interview/machine";
import { cn } from "@/lib/utils";

/**
 * The question index as square detents, drawn complete from the first question: answered is
 * filled ink, the current one is filled red, the rest are hairline. Pips under each show follow-ups used.
 */
export function InterviewProgress({
  plan,
  threads,
  index,
  finished,
}: {
  plan: PlannedQuestion[];
  threads: Thread[];
  index: number;
  finished: boolean;
}) {
  const { t, f } = usePrefs();
  const current = Math.min(index, plan.length - 1);
  return (
    <nav aria-label={f(t.interview.progress, { current: current + 1, total: plan.length })} className="flex items-center gap-3">
      <ol className="flex items-start gap-1.5">
        {plan.map((question, position) => {
          const done = finished || position < index;
          const isCurrent = !finished && position === index;
          const thread = threads.find((item) => item.questionId === question.id);
          const used = thread ? followUpsUsed(thread) : 0;
          return (
            <li key={question.id} className="flex flex-col items-center gap-[3px]" aria-current={isCurrent ? "step" : undefined}>
              <span
                className={cn(
                  "grid size-[22px] place-items-center border font-serif text-[12px] tabular",
                  done && "border-ink bg-ink text-paper",
                  isCurrent && "border-pen bg-pen text-paper",
                  !done && !isCurrent && "border-rule-strong text-ink-3",
                )}
              >
                {position + 1}
              </span>
              <span className="flex gap-[2px]" aria-hidden>
                {Array.from({ length: LIMITS.maxFollowUps }, (_, pip) => (
                  <span key={pip} className={cn("size-[4px]", pip < used ? (isCurrent ? "bg-pen" : "bg-ink") : "bg-rule-strong")} />
                ))}
              </span>
            </li>
          );
        })}
      </ol>
      {!finished && plan[current] && (
        <span className="hidden text-[13px] text-ink-2 xl:inline">{t.layer[plan[current].layer].name}</span>
      )}
    </nav>
  );
}
