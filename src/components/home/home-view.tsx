"use client";

import { ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { usePrefs } from "@/components/providers";
import { LayerRadar, LayerScoreList } from "@/components/report/layer-chart";
import { RatingStrip } from "@/components/report/rating-strip";
import { SiteHeader, SOURCE_URL } from "@/components/shared/site-header";
import { DifficultyTag } from "@/components/shared/tags";
import { DIFFICULTIES, LAYERS, type Rating } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { HeroPreview } from "./hero-preview";
import { RepoForm } from "./repo-form";

const SAMPLE_RATINGS: Rating[] = ["clear", "clear", "partial", "clear", "misconception", "partial"];

export function HomeView() {
  const { t, locale } = usePrefs();
  const latinTracking = locale === "en" ? "tracking-[-0.022em]" : "";
  const sampleScores = LAYERS.map((layer) => ({ layer, score: t.home.sampleReport.layerScores[layer], questions: 1 }));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-5 pb-20 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-16 lg:pb-28 lg:pt-14">
          <div className="flex flex-col gap-7">
            <h1 className={cn("font-display text-[40px] font-semibold leading-[1.14] text-ink sm:text-[52px] lg:text-[58px]", latinTracking)}>
              {t.home.title}
            </h1>
            <p className="max-w-[34em] text-[17px] leading-[1.75] text-ink-2 sm:text-[18px]">{t.home.lead}</p>
            <RepoForm />
          </div>
          <HeroPreview />
        </section>

        {/* How it works */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <h2 className={cn("font-display text-[28px] font-semibold leading-[1.25] sm:text-[34px]", latinTracking)}>
              {t.home.howTitle}
            </h2>
            <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {t.home.steps.map((step, index) => (
                <li key={step.title} className="border-t border-line-strong pt-6">
                  <span className="font-display text-[40px] font-semibold leading-none text-brand">{index + 1}</span>
                  <h3 className="mt-5 text-[18px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-[1.7] text-ink-2">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Five layers */}
        <section className="border-t border-line bg-surface/60">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16 lg:py-24">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className={cn("font-display text-[28px] font-semibold leading-[1.25] sm:text-[34px]", latinTracking)}>
                {t.home.layersTitle}
              </h2>
              <p className="mt-4 text-[16px] leading-[1.75] text-ink-2">{t.home.layersLead}</p>
              <div className="mt-10 border-t border-line pt-6">
                <h3 className="text-[15px] font-semibold text-ink">{t.home.difficultyTitle}</h3>
                <ul className="mt-4 flex flex-col gap-4">
                  {DIFFICULTIES.map((difficulty) => (
                    <li key={difficulty} className="flex flex-col gap-1">
                      <DifficultyTag difficulty={difficulty} className="text-[14px] text-ink" />
                      <p className="text-[14.5px] leading-[1.7] text-ink-2">{t.difficulty[difficulty].desc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <ol className="flex flex-col gap-3">
              {LAYERS.map((layer, index) => (
                <li
                  key={layer}
                  className="flex gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5 lg:ml-[calc(var(--step)*28px)]"
                  style={{ ["--step" as string]: index }}
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full font-display text-[15px] font-semibold text-brand-ink"
                    style={{ backgroundColor: `color-mix(in oklab, var(--brand) ${10 + index * 7}%, transparent)` }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[16px] font-semibold text-ink">{t.layer[layer].name}</div>
                    <p className="mt-1 text-[15px] leading-[1.7] text-ink-2">“{t.home.layerExamples[layer]}”</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Report preview */}
        <section className="border-t border-line">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 lg:py-24">
            <div>
              <h2 className={cn("font-display text-[28px] font-semibold leading-[1.25] sm:text-[34px]", latinTracking)}>
                {t.home.reportTitle}
              </h2>
              <p className="mt-4 text-[16px] leading-[1.8] text-ink-2">{t.home.reportBody}</p>
              <p className="mt-6 flex items-start gap-2.5 text-[15px] font-medium text-ink">
                <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-clear" aria-hidden />
                {t.home.principle}
              </p>
            </div>

            <div className="rounded-3xl border border-line bg-surface p-6 shadow-lift sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-[18px] font-semibold">{t.report.title}</span>
                <span className="text-[13px] text-ink-3">
                  {t.difficulty.hard.name} · {SAMPLE_RATINGS.length}
                </span>
              </div>
              <RatingStrip ratings={SAMPLE_RATINGS} className="mt-5" />
              <p className="mt-6 text-[15px] leading-[1.75] text-ink">{t.home.sampleReport.summary}</p>
              <div className="mt-6 grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <LayerRadar scores={sampleScores} className="mx-auto" />
                <LayerScoreList scores={sampleScores} />
              </div>
              <div className="mt-6 rounded-2xl bg-brand-soft p-4 sm:p-5">
                <div className="text-[14px] font-semibold text-brand-ink">{t.report.mentor}</div>
                <p className="mt-1.5 text-[14.5px] leading-[1.7] text-ink">{t.home.sampleReport.mentor}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-8 text-[13.5px] text-ink-3 sm:flex-row sm:items-center sm:px-8">
          <span className="flex items-center gap-2">
            <LogoMark className="size-5" />
            {t.brand.name} · {t.brand.latin}
          </span>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="hover:text-ink">
            {t.home.footer}
          </a>
        </div>
      </footer>
    </div>
  );
}
