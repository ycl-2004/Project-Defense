"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePrefs } from "@/components/providers";
import { PenMark } from "@/components/shared/marks";
import { ProgressLine } from "@/components/shared/thinking";

export function FinishedCard({
  questions,
  followUps,
  writing,
  error,
  onWrite,
  hasReport,
  onOpenReport,
}: {
  questions: number;
  followUps: number;
  writing: boolean;
  error: string | null;
  onWrite: () => void;
  hasReport: boolean;
  onOpenReport: () => void;
}) {
  const { t, f, locale } = usePrefs();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!writing) return;
    const started = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [writing]);

  return (
    <section className="border-y border-rule-strong py-8">
      <div className="flex items-center gap-3">
        <PenMark rating="clear" className="size-7" />
        <h2 className="font-serif text-[26px] font-semibold text-ink">{t.interview.finishedTitle}</h2>
      </div>
      <p className="mt-3 max-w-[34em] text-[15px] leading-[1.8] text-ink-2">{f(t.interview.finishedBody, { questions, followUps })}</p>

      {writing ? (
        <div className="mt-7 flex flex-col gap-3" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-[14px] text-ink">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin text-pen" strokeWidth={1.5} />
              {t.interview.writingReport}
            </span>
            <span className="tabular text-[13px] text-ink-3">{locale === "zh" ? `${seconds} 秒` : `${seconds}s`}</span>
          </div>
          <ProgressLine />
          <p className="text-[13.5px] text-ink-3">{t.interview.writingNote}</p>
        </div>
      ) : (
        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={hasReport ? onOpenReport : onWrite}
            className="inline-flex h-12 w-full items-center justify-center gap-2 bg-ink px-6 text-[15px] font-medium text-paper transition-opacity hover:opacity-90 sm:w-auto sm:self-start"
          >
            {hasReport ? t.report.title : t.interview.writeReport}
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </button>
          {error && (
            <p role="alert" className="text-[14px] text-pen">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
