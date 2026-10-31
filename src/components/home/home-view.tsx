"use client";

import { LogoMark } from "@/components/brand/logo";
import { usePrefs } from "@/components/providers";
import { RatingStrip } from "@/components/report/rating-strip";
import { PenMark } from "@/components/shared/marks";
import { SiteHeader, SOURCE_URL } from "@/components/shared/site-header";
import { DifficultyTag } from "@/components/shared/tags";
import { DIFFICULTIES, LAYERS, type Rating } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { DemoCode, DemoConversation, useDemoStage } from "./demo-spread";
import { RepoForm } from "./repo-form";

const SAMPLE_RATINGS: Rating[] = ["clear", "clear", "partial", "clear", "misconception", "partial"];

function SectionTitle({ children, latin }: { children: React.ReactNode; latin: boolean }) {
  return (
    <h2 className={cn("font-serif text-[28px] font-semibold leading-[1.3] text-ink sm:text-[32px]", latin && "tracking-[-0.01em]")}>{children}</h2>
  );
}

/**
 * The home page is the exercise book opened flat: title and the answer line on the first spread,
 * the code on the left page, the coach's question on the right, one gutter between them.
 */
export function HomeView() {
  const { t, locale } = usePrefs();
  const stage = useDemoStage();
  const latin = locale === "en";

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* The spread */}
        <section className="border-b border-rule-strong">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_1px_minmax(0,0.92fr)]">
            <div className="px-5 pb-8 pt-10 sm:px-8 lg:col-start-1 lg:row-start-1 lg:pb-9 lg:pr-14 lg:pt-12">
              <h1 className={cn("font-serif text-[40px] font-semibold leading-[1.16] text-ink sm:text-[54px] lg:text-[64px]", latin && "tracking-[-0.02em]")}>
                {t.home.title}
              </h1>
              <p className="mt-5 max-w-[32em] text-[16.5px] leading-[1.85] text-ink-2">{t.home.lead}</p>
            </div>
            <div className="px-5 pb-10 sm:px-8 lg:col-start-3 lg:row-start-1 lg:flex lg:items-end lg:pb-9 lg:pl-14 lg:pt-12">
              <div className="w-full">
                <RepoForm />
              </div>
            </div>
            <div className="border-t border-rule px-5 py-8 sm:px-8 lg:col-start-1 lg:row-start-2 lg:pb-14 lg:pr-14 lg:pt-8">
              <DemoCode stage={stage} />
            </div>
            <div className="border-t border-rule px-5 pb-12 pt-8 sm:px-8 lg:col-start-3 lg:row-start-2 lg:pb-14 lg:pl-14 lg:pt-8">
              <DemoConversation stage={stage} />
            </div>
            <div aria-hidden className="hidden bg-rule-strong lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block" />
          </div>
        </section>

        {/* How a session works */}
        <section className="border-b border-rule-strong">
          <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:py-20">
            <SectionTitle latin={latin}>{t.home.howTitle}</SectionTitle>
            <ol className="relative mt-12 grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-10">
              <span aria-hidden className="absolute bottom-0 left-[13.5px] top-0 w-px bg-pen lg:bottom-auto lg:left-0 lg:right-0 lg:top-[13.5px] lg:h-px lg:w-auto" />
              {t.home.steps.map((step, index) => (
                <li key={step.title} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-5 lg:flex lg:flex-col lg:gap-4">
                  <span className="relative z-10 grid size-7 place-items-center border border-pen bg-paper font-serif text-[14px] text-pen tabular">{index + 1}</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif text-[19px] font-semibold text-ink">{step.title}</h3>
                    <p className="text-[15px] leading-[1.8] text-ink-2">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Five layers and difficulty */}
        <section className="border-b border-rule-strong bg-surface">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:py-20">
            <div className="flex flex-col gap-8">
              <div>
                <SectionTitle latin={latin}>{t.home.layersTitle}</SectionTitle>
                <p className="mt-4 text-[16px] leading-[1.8] text-ink-2">{t.home.layersLead}</p>
              </div>
              <div>
                <h3 className="text-[14px] font-medium text-ink">{t.home.difficultyTitle}</h3>
                <dl className="mt-3 border-t border-rule">
                  {DIFFICULTIES.map((difficulty) => (
                    <div key={difficulty} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 border-b border-rule py-3">
                      <dt>
                        <DifficultyTag difficulty={difficulty} className="text-[14px] text-ink" />
                      </dt>
                      <dd className="text-[14.5px] leading-[1.75] text-ink-2 [text-wrap:pretty]">{t.difficulty[difficulty].desc}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <ol className="relative flex flex-col">
              <span aria-hidden className="absolute bottom-6 left-[13px] top-6 w-px bg-pen" />
              {LAYERS.map((layer, index) => (
                <li key={layer} className="relative grid grid-cols-[28px_minmax(0,1fr)] gap-5 border-b border-rule py-5 first:pt-1 last:border-b-0">
                  <span className="relative z-10 mt-0.5 grid size-7 place-items-center border border-pen bg-surface font-serif text-[13px] text-pen tabular">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-serif text-[18px] font-semibold text-ink">{t.layer[layer].name}</div>
                    <p className="mt-1.5 font-hand text-[17px] leading-[1.75] text-pen">{t.home.layerExamples[layer]}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The report */}
        <section className="border-b border-rule-strong">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-start gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 lg:py-20">
            <div>
              <SectionTitle latin={latin}>{t.home.reportTitle}</SectionTitle>
              <p className="mt-4 text-[16px] leading-[1.85] text-ink-2">{t.home.reportBody}</p>
              <p className="mt-8 flex items-start gap-3 border-t border-rule pt-5 text-[15px] text-ink">
                <PenMark rating="clear" className="mt-0.5" />
                {t.home.principle}
              </p>
            </div>

            <article className="border border-rule-strong bg-surface">
              <header className="flex items-baseline justify-between gap-4 border-b border-rule px-6 py-4">
                <span className="font-serif text-[19px] font-semibold text-ink">{t.report.title}</span>
                <span className="text-[13px] text-ink-3">
                  {t.difficulty.hard.name} · {SAMPLE_RATINGS.length}
                </span>
              </header>
              <div className="flex flex-col gap-6 px-6 py-6">
                <RatingStrip ratings={SAMPLE_RATINGS} />
                <p className="font-hand text-[18px] leading-[1.8] text-pen">{t.home.sampleReport.summary}</p>
                <div className="border border-pen px-5 py-4">
                  <div className="text-[13px] font-medium text-pen">{t.report.mentor}</div>
                  <p className="mt-1.5 font-serif text-[16px] leading-[1.75] text-ink">{t.home.sampleReport.mentor}</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>

      <footer>
        <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-3 px-5 py-7 text-[13.5px] text-ink-3 sm:flex-row sm:items-center sm:px-8">
          <span className="flex items-center gap-2.5">
            <LogoMark className="size-5" />
            {t.brand.name} · {t.brand.latin}
          </span>
          <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="underline decoration-rule-strong hover:text-ink">
            {t.home.footer}
          </a>
        </div>
      </footer>
    </div>
  );
}
