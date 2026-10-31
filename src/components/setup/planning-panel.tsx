"use client";

import { FileSearch, ListChecks, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { usePrefs } from "@/components/providers";
import { ProgressLine } from "@/components/shared/thinking";

/** Shown while the plan is written (20-60 s). The elapsed counter keeps the wait honest. */
export function PlanningPanel({ count }: { count: number }) {
  const { t, f, locale } = usePrefs();
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const icons = [FileSearch, Sparkles, ListChecks];
  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-lift sm:p-8" role="status" aria-live="polite">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[22px] font-semibold text-ink">{t.setup.planningTitle}</h2>
        <span className="tabular text-[13px] text-ink-3">{locale === "zh" ? `${seconds} 秒` : `${seconds}s`}</span>
      </div>
      <ProgressLine className="mt-5" />
      <ol className="mt-6 flex flex-col gap-3.5">
        {t.setup.planningSteps.map((step, index) => {
          const Icon = icons[index];
          return (
            <li key={step} className="flex items-center gap-3 text-[15px] text-ink">
              <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand-ink">
                <Icon className="size-4" />
              </span>
              {f(step, { count })}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 text-[13.5px] text-ink-3">{t.setup.planningNote}</p>
    </div>
  );
}
