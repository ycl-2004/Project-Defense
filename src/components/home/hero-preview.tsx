"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { usePrefs } from "@/components/providers";
import { Bubble } from "@/components/shared/bubble";
import { CitationChip } from "@/components/shared/citation-chip";
import { CodeView } from "@/components/shared/code-view";
import { DifficultyTag, LayerTag } from "@/components/shared/tags";
import { Thinking } from "@/components/shared/thinking";

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

const MAIN_CITATION = { path: SAMPLE_PATH, startLine: 12, endLine: 23 };
const FOLLOW_UP_LINES = { start: 15, end: 17 };

const rise = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] as const } };

/**
 * The real interview components playing one exchange: question → answer → coach thinks →
 * follow-up, with the code highlight moving to the lines the follow-up is about.
 */
export function HeroPreview() {
  const { t, f } = usePrefs();
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timers = [900, 2100, 3700].map((delay, index) => window.setTimeout(() => setStage(index + 1), delay));
    return () => timers.forEach(window.clearTimeout);
  }, [reduce]);

  const shown = reduce ? 3 : stage;
  const highlight = shown >= 3 ? FOLLOW_UP_LINES : { start: MAIN_CITATION.startLine, end: MAIN_CITATION.endLine };

  return (
    <div className="relative" aria-hidden>
      <div className="absolute -inset-4 -z-10 rounded-[36px] bg-sunken/70 sm:-inset-6 [background-image:radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_100%)]" />

      <div className="flex flex-col lg:relative lg:h-[600px]">
        <motion.div
          {...rise}
          className="overflow-hidden rounded-2xl border border-line bg-code-bg shadow-card lg:absolute lg:right-0 lg:top-0 lg:w-[86%]"
        >
          <div className="flex h-10 items-center justify-between border-b border-line px-4">
            <span className="truncate font-mono text-[12px] text-ink-2">{SAMPLE_PATH}</span>
            <span className="text-[11.5px] text-ink-3">TypeScript</span>
          </div>
          <CodeView code={SAMPLE_CODE} path={SAMPLE_PATH} firstLine={12} highlight={highlight} className="max-h-[260px] lg:max-h-none" />
        </motion.div>

        <motion.div
          {...rise}
          transition={{ ...rise.transition, delay: 0.15 }}
          className="relative z-10 -mt-8 ml-3 rounded-3xl border border-line bg-surface p-5 shadow-lift sm:ml-10 lg:absolute lg:left-0 lg:top-[226px] lg:ml-0 lg:mt-0 lg:w-[78%]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="tabular text-[12.5px] text-ink-3">{f(t.interview.progress, { current: 1, total: 6 })}</span>
            <LayerTag layer="explain" />
            <DifficultyTag difficulty="hard" />
          </div>
          <p className="mt-3 font-display text-[19px] font-semibold leading-[1.45] text-ink">{t.home.previewQuestion}</p>
          <CitationChip citation={MAIN_CITATION} className="mt-3" />

          <div className="mt-4 flex min-h-[148px] flex-col gap-3">
            <AnimatePresence initial={false}>
              {shown >= 1 && (
                <motion.div key="answer" {...rise}>
                  <Bubble side="you" label={t.interview.you}>
                    {t.home.previewAnswer}
                  </Bubble>
                </motion.div>
              )}
              {shown === 2 && (
                <motion.div key="thinking" {...rise} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                  <Thinking label={t.home.previewThinking} />
                </motion.div>
              )}
              {shown >= 3 && (
                <motion.div key="followup" {...rise}>
                  <Bubble
                    side="coach"
                    label={t.interview.coach}
                    badge={
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11.5px] font-medium text-brand-ink">
                        {f(t.interview.followUp, { count: 1, max: 2 })}
                      </span>
                    }
                  >
                    {t.home.previewFollowUp}
                  </Bubble>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
