"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePrefs } from "@/components/providers";
import { CitationChip } from "@/components/shared/citation-chip";
import { RichText } from "@/components/shared/rich-text";
import { DifficultyTag } from "@/components/shared/tags";
import { Thinking } from "@/components/shared/thinking";
import { Turn } from "@/components/shared/turn";
import { LIMITS } from "@/lib/config";
import type { Citation, PlannedQuestion, Thread } from "@/lib/domain";
import { cn } from "@/lib/utils";

const rise = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
};

/** The running head over a question: number and layer on the left, difficulty on the right. */
export function QuestionHead({ question, number, total }: { question: PlannedQuestion; number: number; total: number }) {
  const { t, f } = usePrefs();
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule pb-2.5 text-[13px] text-ink-2">
      <span className="flex items-center gap-2">
        <span className="font-medium text-ink tabular">{f(t.interview.progress, { current: number, total })}</span>
        <span className="text-rule-strong" aria-hidden>
          /
        </span>
        <span>{t.layer[question.layer].name}</span>
      </span>
      <DifficultyTag difficulty={question.difficulty} />
    </div>
  );
}

export function QuestionText({
  question,
  refs,
  onCite,
  size = "large",
}: {
  question: PlannedQuestion;
  refs?: number[];
  onCite: (citation: Citation) => void;
  size?: "large" | "small";
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2
        className={cn(
          "font-serif font-semibold text-ink",
          size === "large" ? "text-[19px] leading-[1.75] sm:text-[22px]" : "text-[16px] leading-[1.7]",
        )}
      >
        <RichText text={question.question} refs={refs} />
      </h2>
      <CitationChip citation={question.snippet} onClick={() => onCite(question.snippet)} className="-ml-1 self-start" />
    </div>
  );
}

/** Answers, follow-ups and hints after a question's main prompt. */
export function ThreadExchanges({
  thread,
  onCite,
  thinking,
  hinting,
  refs,
}: {
  thread: Thread;
  onCite: (citation: Citation) => void;
  thinking?: boolean;
  hinting?: boolean;
  refs?: number[];
}) {
  const { t, f } = usePrefs();
  const followUpNumber = (index: number) =>
    thread.exchanges.slice(0, index + 1).filter((exchange) => exchange.kind === "followup").length;
  const lastIndex = thread.exchanges.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence initial={false}>
        {thread.exchanges.map((exchange, index) => (
          <motion.div key={index} {...rise} className="flex flex-col gap-6">
            {exchange.kind === "followup" && (
              <Turn
                who="mentor"
                label={f(t.interview.followUp, { count: followUpNumber(index), max: LIMITS.maxFollowUps })}
                aside={
                  exchange.snippet && <CitationChip citation={exchange.snippet} onClick={() => onCite(exchange.snippet!)} className="h-6" />
                }
              >
                <RichText text={exchange.prompt} refs={index === lastIndex ? refs : undefined} />
              </Turn>
            )}
            {exchange.answer && (
              <Turn who="student" label={t.interview.you}>
                <RichText text={exchange.answer} />
              </Turn>
            )}
            {exchange.skipped && (
              <span className="self-start border border-rule-strong px-2 py-0.5 text-[12.5px] text-ink-2">{t.interview.skipped}</span>
            )}
          </motion.div>
        ))}
        {thread.hints.map((hint, index) => (
          <motion.div key={`hint-${index}`} {...rise}>
            <Turn who="hint" label={t.interview.hintLabel}>
              <RichText text={hint} />
            </Turn>
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
