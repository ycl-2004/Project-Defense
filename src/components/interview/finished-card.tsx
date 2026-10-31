"use client";

import { ArrowRight, Flag, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { usePrefs } from "@/components/providers";
import { ProgressLine } from "@/components/shared/thinking";
import { Button } from "@/components/ui/button";

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
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-lift sm:p-8">
      <span className="grid size-11 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
        <Flag className="size-5" />
      </span>
      <h2 className="mt-5 font-display text-[24px] font-semibold text-ink">{t.interview.finishedTitle}</h2>
      <p className="mt-2 text-[15px] leading-[1.75] text-ink-2">{f(t.interview.finishedBody, { questions, followUps })}</p>

      {writing ? (
        <div className="mt-6 flex flex-col gap-3" role="status" aria-live="polite">
          <div className="flex items-center justify-between text-[14px] text-ink">
            <span className="inline-flex items-center gap-2">
              <LoaderCircle className="size-4 animate-spin text-brand" />
              {t.interview.writingReport}
            </span>
            <span className="tabular text-[13px] text-ink-3">{locale === "zh" ? `${seconds} 秒` : `${seconds}s`}</span>
          </div>
          <ProgressLine />
          <p className="text-[13.5px] text-ink-3">{t.interview.writingNote}</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <Button onClick={hasReport ? onOpenReport : onWrite} className="h-12 w-full rounded-xl text-[15px] hover:bg-brand-strong sm:w-auto sm:self-start sm:px-6">
            {hasReport ? t.report.title : t.interview.writeReport}
            <ArrowRight className="size-4" />
          </Button>
          {error && (
            <p role="alert" className="text-[14px] text-miss">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
