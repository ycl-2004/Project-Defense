"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { usePrefs } from "@/components/providers";
import { CitationChip } from "@/components/shared/citation-chip";
import { CodeView } from "@/components/shared/code-view";
import { RichText } from "@/components/shared/rich-text";
import { DifficultyTag } from "@/components/shared/tags";
import { Thinking } from "@/components/shared/thinking";
import { Turn } from "@/components/shared/turn";

const SAMPLE_PATH = "src/app/api/upload/route.ts";
const SAMPLE_CODE = `export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("syllabus");
  if (!(file instanceof File) || file.type !== "application/pdf") {
    return Response.json({ error: "Please upload a PDF" }, { status: 400 });
  }
  const text = await extractText(file);
  const deadlines = await askAI(
    \`List every deadline in this syllabus as JSON: \${text}\`,
  );
  return Response.json({ deadlines });
}`;
const FIRST = 12;
const QUESTION = { path: SAMPLE_PATH, startLine: 12, endLine: 23 };
const FOLLOW_UP = { path: SAMPLE_PATH, startLine: 15, endLine: 17 };

const rise = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } };

/** The code page of the spread: a real excerpt with the mentor's marks and the centre rail. */
export function DemoCode({ stage }: { stage: number }) {
  const { t, f } = usePrefs();
  const followed = stage >= 3;
  const range = followed ? FOLLOW_UP : QUESTION;
  return (
    <figure className="flex flex-col border border-rule-strong bg-surface">
      <figcaption className="flex h-10 items-center justify-between gap-3 border-b border-rule px-4 text-[12.5px]">
        <span className="truncate font-mono text-ink">{SAMPLE_PATH}</span>
        <span className="hidden shrink-0 text-ink-3 sm:inline">{t.home.demoCaption}</span>
      </figcaption>
      <CodeView
        code={SAMPLE_CODE}
        path={SAMPLE_PATH}
        firstLine={FIRST}
        highlight={{ start: range.startLine, end: range.endLine }}
        rail={[
          { line: QUESTION.startLine, label: f(t.interview.railQuestion, { n: 1 }), filled: !followed },
          ...(followed ? [{ line: FOLLOW_UP.startLine, label: f(t.interview.railFollowUp, { n: 1 }), filled: true }] : []),
        ]}
        notes={followed ? [{ line: FOLLOW_UP.endLine, text: t.home.demoNote }] : []}
        wrap
        className="max-h-[320px]"
      />
    </figure>
  );
}

/** The question page: the coach's question pinned to the code, the student's answer, the follow-up. */
export function DemoConversation({ stage }: { stage: number }) {
  const { t, f } = usePrefs();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-rule pb-2 text-[13px] text-ink-2">
        <span>
          <span className="font-medium text-ink tabular">{f(t.interview.progress, { current: 1, total: 6 })}</span>
          <span className="px-2 text-rule-strong">/</span>
          {t.layer.explain.name}
        </span>
        <DifficultyTag difficulty="hard" />
      </div>
      <p className="font-serif text-[19px] font-semibold leading-[1.7] text-ink">{t.home.previewQuestion}</p>
      <CitationChip citation={QUESTION} className="-ml-1 self-start" />
      <div className="flex min-h-[170px] flex-col gap-5">
        <AnimatePresence initial={false}>
          {stage >= 1 && (
            <motion.div key="answer" {...rise}>
              <Turn who="student" label={t.interview.you}>
                {t.home.previewAnswer}
              </Turn>
            </motion.div>
          )}
          {stage === 2 && (
            <motion.div key="thinking" {...rise} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
              <Thinking label={t.home.previewThinking} />
            </motion.div>
          )}
          {stage >= 3 && (
            <motion.div key="followup" {...rise}>
              <Turn who="mentor" label={f(t.interview.followUp, { count: 1, max: 2 })} aside={<CitationChip citation={FOLLOW_UP} className="h-6" />}>
                <RichText text={t.home.previewFollowUp} />
              </Turn>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** One authored moment: answer, the coach reads, the follow-up lands and the bracket moves to the lines it is about. */
export function useDemoStage(): number {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const timers = [1100, 2300, 3700].map((delay, index) => window.setTimeout(() => setStage(index + 1), delay));
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);
  return reduce ? 3 : stage;
}
