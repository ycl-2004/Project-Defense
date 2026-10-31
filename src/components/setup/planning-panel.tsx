"use client";

import { FileSearch, ListChecks, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { usePrefs } from "@/components/providers";
import { ProgressLine } from "@/components/shared/thinking";

/** Shown while the plan is written (10-20 s). The elapsed counter keeps the wait honest. */
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
    <section className="border-y border-rule-strong py-6" role="status" aria-live="polite">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-[24px] font-semibold text-ink">{t.setup.planningTitle}</h2>
        <span className="tabular text-[13px] text-ink-3">{locale === "zh" ? `${seconds} 秒` : `${seconds}s`}</span>
      </div>
      <ProgressLine className="mt-5" />
      <ol className="mt-2 flex flex-col">
        {t.setup.planningSteps.map((step, index) => {
          const Icon = icons[index];
          return (
            <li key={step} className="flex items-center gap-4 border-b border-rule py-3.5 text-[15px] text-ink last:border-b-0">
              <span className="grid size-[22px] shrink-0 place-items-center border border-rule-strong text-ink-2">
                <Icon className="size-3.5" strokeWidth={1.5} />
              </span>
              {f(step, { count })}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[13.5px] text-ink-3">{t.setup.planningNote}</p>
    </section>
  );
}
