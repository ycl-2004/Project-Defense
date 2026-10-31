"use client";

import { Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePrefs } from "@/components/providers";
import { Bubble } from "@/components/shared/bubble";
import { RichText } from "@/components/shared/rich-text";
import { CitationChip } from "@/components/shared/citation-chip";
import { DifficultyTag, LayerTag } from "@/components/shared/tags";
import { Thinking } from "@/components/shared/thinking";
import { LIMITS } from "@/lib/config";
import type { Citation, PlannedQuestion, Thread } from "@/lib/domain";
import { cn } from "@/lib/utils";

const rise = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.2, 0.8, 0.2, 1] as const },
};

export function FollowUpBadge({ count }: { count: number }) {
  const { t, f } = usePrefs();
  return (
    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11.5px] font-medium text-brand-ink">
      {f(t.interview.followUp, { count, max: LIMITS.maxFollowUps })}
    </span>
  );
}

export function QuestionHeader({
  question,
  number,
  total,
  onCite,
  large,
}: {
  question: PlannedQuestion;
  number: number;
  total: number;
  onCite: (citation: Citation) => void;
  large?: boolean;
}) {
  const { t, f } = usePrefs();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tabular text-[12.5px] text-ink-3">{f(t.interview.progress, { current: number, total })}</span>
        <LayerTag layer={question.layer} />
        <DifficultyTag difficulty={question.difficulty} />
      </div>
      <h2
        className={cn(
          "font-display font-semibold text-ink",
          large ? "text-[19px] leading-[1.65] sm:text-[21px]" : "text-[15.5px] leading-[1.6]",
        )}
      >
        <RichText text={question.question} />
      </h2>
      <CitationChip citation={question.snippet} onClick={() => onCite(question.snippet)} className="self-start" />
    </div>
  );
}

/** The exchanges of one question after its main prompt: answers, follow-ups, hints, and the coach thinking. */
export function ThreadExchanges({
  thread,
  onCite,
  thinking,
  hinting,
}: {
  thread: Thread;
  onCite: (citation: Citation) => void;
  thinking?: boolean;
  hinting?: boolean;
}) {
  const { t } = usePrefs();
  const followUpNumber = (index: number) =>
    thread.exchanges.slice(0, index + 1).filter((exchange) => exchange.kind === "followup").length;
  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {thread.exchanges.map((exchange, index) => {
          return (
            <motion.div key={index} {...rise} className="flex flex-col gap-4">
              {exchange.kind === "followup" && (
                <Bubble side="coach" label={t.interview.coach} badge={<FollowUpBadge count={followUpNumber(index)} />}>
                  <RichText text={exchange.prompt} />
                  {exchange.snippet && (
                    <span className="mt-2.5 flex">
                      <CitationChip citation={exchange.snippet} onClick={() => onCite(exchange.snippet!)} />
                    </span>
                  )}
                </Bubble>
              )}
              {exchange.answer && (
                <Bubble side="you" label={t.interview.you}>
                  <RichText text={exchange.answer} />
                </Bubble>
              )}
              {exchange.skipped && (
                <span className="self-end rounded-full bg-blank-soft px-2.5 py-1 text-[12.5px] font-medium text-blank">{t.interview.skipped}</span>
              )}
            </motion.div>
          );
        })}
        {thread.hints.map((hint, index) => (
          <motion.div
            key={`hint-${index}`}
            {...rise}
            className="flex gap-3 rounded-2xl border border-partial/20 bg-partial-soft px-4 py-3 text-[14.5px] leading-[1.65] text-ink"
          >
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-partial" aria-hidden />
            <span>
              <span className="sr-only">{t.interview.hintLabel}: </span>
              <RichText text={hint} />
            </span>
          </motion.div>
        ))}
        {(thinking || hinting) && (
          <motion.div key="thinking" {...rise} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
            <Thinking label={thinking ? t.interview.thinking : t.interview.hinting} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
