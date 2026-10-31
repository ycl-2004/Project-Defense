"use client";

import { Download, FileText, Printer, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefs } from "@/components/providers";
import { EmptyState, PageSkeleton } from "@/components/shared/empty-state";
import { GitHubIcon } from "@/components/shared/github-icon";
import { RichText } from "@/components/shared/rich-text";
import { SiteHeader } from "@/components/shared/site-header";
import { PenMark } from "@/components/shared/marks";
import { useHydrated, useSession, type ActiveSession, type SavedReport } from "@/lib/client/session-store";
import { reportMarkdown } from "@/lib/interview/export";
import { totalHints } from "@/lib/interview/machine";
import { layerScores } from "@/lib/interview/scoring";
import { MESSAGES } from "@/lib/i18n/messages";
import { LayerRadar, LayerScoreList } from "./layer-chart";
import { QuestionReview } from "./question-review";
import { RatingStrip } from "./rating-strip";

export function ReportView() {
  const { t } = usePrefs();
  const hydrated = useHydrated();
  const session = useSession((state) => state.session);
  const saved = useSession((state) => state.report);

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      {!hydrated ? (
        <PageSkeleton />
      ) : !session || !saved ? (
        <EmptyState icon={<FileText className="size-5" strokeWidth={1.5} />} title={t.report.noReport} body={t.report.noReportLead} action={t.report.start} href="/" />
      ) : (
        <ReportBody session={session} saved={saved} />
      )}
    </div>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule-strong pb-2">
        <h2 className="font-serif text-[22px] font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

function ReportBody({ session, saved }: { session: ActiveSession; saved: SavedReport }) {
  const { t, f, locale } = usePrefs();
  const router = useRouter();
  const { report, createdAt } = saved;
  const { interview, repo, part, difficulty } = session;
  const { plan, threads } = interview;
  const ids = useMemo(() => plan.map((question) => question.id), [plan]);
  const [open, setOpen] = useState<string[]>([]);
  const beforePrint = useRef<string[] | null>(null);

  const ratedById = new Map(report.questions.map((question) => [question.id, question]));
  const threadById = new Map(threads.map((thread) => [thread.questionId, thread]));
  const scores = layerScores(plan, report);
  const ratings = plan.map((question) => ratedById.get(question.id)?.rating ?? "unanswered");
  const date = new Date(createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en", { year: "numeric", month: "long", day: "numeric" });

  // Printing shows every question; the open/closed state comes back afterwards.
  useEffect(() => {
    const expand = () => {
      setOpen((current) => {
        beforePrint.current = current;
        return ids;
      });
    };
    const restore = () => {
      if (beforePrint.current) setOpen(beforePrint.current);
      beforePrint.current = null;
    };
    window.addEventListener("beforeprint", expand);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", expand);
      window.removeEventListener("afterprint", restore);
    };
  }, [ids]);

  function exportMarkdown() {
    const markdown = reportMarkdown({ report, plan, threads, part, repo, difficulty, createdAt }, MESSAGES[session.locale]);
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `defense-report-${repo.repo}-${createdAt.slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function print() {
    beforePrint.current = open;
    setOpen(ids);
    window.requestAnimationFrame(() => window.setTimeout(() => window.print(), 50));
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-14 px-5 pb-24 pt-6 sm:px-8 lg:pt-10">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <a
            href={`https://github.com/${repo.owner}/${repo.repo}/tree/${repo.sha}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit max-w-full items-center gap-2 text-[13px] text-ink-2 hover:text-ink"
          >
            <GitHubIcon className="size-4 shrink-0" />
            <span className="truncate font-mono">
              {repo.owner}/{repo.repo} · {repo.sha.slice(0, 7)}
            </span>
          </a>
          <h1 className="font-serif text-[36px] font-semibold leading-[1.2] text-ink sm:text-[46px]">{t.report.title}</h1>
          <p className="text-[14.5px] text-ink-2">
            {f(t.report.meta, { part: part.title, difficulty: t.difficulty[difficulty].name, count: plan.length })}
            <span> · {f(t.report.generatedAt, { date })}</span>
          </p>
        </div>
        <div className="no-print flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={exportMarkdown}
            className="inline-flex h-10 items-center gap-2 border-b border-rule-strong text-[14px] text-ink-2 hover:border-ink hover:text-ink"
          >
            <Download className="size-4" strokeWidth={1.5} />
            {t.report.exportMd}
          </button>
          <button
            type="button"
            onClick={print}
            className="inline-flex h-10 items-center gap-2 border-b border-rule-strong text-[14px] text-ink-2 hover:border-ink hover:text-ink"
          >
            <Printer className="size-4" strokeWidth={1.5} />
            {t.report.print}
          </button>
          <button
            type="button"
            onClick={() => router.push("/setup")}
            className="inline-flex h-11 items-center gap-2 bg-ink px-5 text-[15px] font-medium text-paper transition-opacity hover:opacity-90"
          >
            <RotateCcw className="size-4" strokeWidth={1.5} />
            {t.report.again}
          </button>
        </div>
      </header>

      <section className="break-inside-avoid border-y border-rule-strong py-7">
        <h2 className="text-[13px] font-medium text-ink-2">{t.report.summary}</h2>
        <p className="mt-3 max-w-[40em] font-hand text-[18px] leading-[1.8] text-pen">
          <RichText text={report.summary} />
        </p>
        <div className="mt-7 border-t border-rule pt-6">
          <h3 className="mb-4 text-[13px] font-medium text-ink-2">{t.report.ratings}</h3>
          <RatingStrip ratings={ratings} />
        </div>
      </section>

      <Section title={t.report.layers}>
        <div className="grid break-inside-avoid grid-cols-1 items-center gap-8 md:grid-cols-2 print:grid-cols-2">
          <LayerRadar scores={scores} className="mx-auto max-w-[340px]" />
          <div className="flex flex-col gap-4">
            <LayerScoreList scores={scores} />
            <p className="text-[12.5px] leading-[1.7] text-ink-3">{t.report.layersNote}</p>
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2">
        <ObservationColumn rating="clear" title={t.report.strengths} items={report.strengths} />
        <ObservationColumn rating="misconception" title={t.report.misconceptions} items={report.misconceptions} empty={t.report.noMisconceptions} />
      </div>

      <Section title={t.report.questions}>
        <AccordionPrimitive.Root type="multiple" value={open} onValueChange={setOpen} className="flex flex-col border-t border-rule">
          {plan.map((question, index) => {
            const rated = ratedById.get(question.id);
            return rated ? (
              <QuestionReview
                key={question.id}
                number={index + 1}
                question={question}
                thread={threadById.get(question.id)}
                rated={rated}
                repo={repo}
              />
            ) : null;
          })}
        </AccordionPrimitive.Root>
      </Section>

      <Section title={t.report.studyNext}>
        <ol className="flex flex-col border-t border-rule">
          {report.studyNext.map((item, index) => (
            <li key={item.topic} className="flex break-inside-avoid gap-4 border-b border-rule py-4">
              <span className="tabular w-7 shrink-0 font-serif text-[22px] font-semibold leading-[1.3] text-ink-3">{index + 1}</span>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h3 className="font-serif text-[17px] font-semibold leading-[1.6] text-ink">
                  <RichText text={item.topic} />
                </h3>
                <p className="text-[14px] leading-[1.75] text-ink-2">
                  <RichText text={item.why} />
                </p>
                {item.files.length > 0 && (
                  <p className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] text-ink-2">
                    {item.files.map((file) => (
                      <span key={file} className="max-w-full truncate">
                        {file}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <section className="relative break-inside-avoid border border-pen p-6 sm:p-8">
        <h2 className="absolute -top-3 left-5 bg-paper px-2 text-[14px] font-medium text-pen">{t.report.mentor}</h2>
        <p className="text-[14px] text-ink-2">{t.report.mentorLead}</p>
        <p className="mt-4 font-serif text-[21px] font-semibold leading-[1.65] text-ink">
          <RichText text={report.mentorNextStep.task} />
        </p>
        <p className="mt-3 text-[14.5px] leading-[1.75] text-ink-2">
          <RichText text={report.mentorNextStep.why} />
        </p>
      </section>

      <footer className="flex flex-col gap-3 border-t border-rule pt-6 text-[13px] leading-[1.75] text-ink-3">
        <span className="tabular">{f(t.report.hintsTotal, { count: totalHints(threads) })}</span>
        <p className="flex gap-2.5">
          <PenMark rating="clear" className="mt-1 size-3.5" />
          {t.report.disclaimer}
        </p>
      </footer>
    </main>
  );
}

function ObservationColumn({ rating, title, items, empty }: { rating: "clear" | "misconception"; title: string; items: string[]; empty?: string }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="flex items-center gap-2 border-b border-rule-strong pb-2 font-serif text-[19px] font-semibold text-ink">
        <PenMark rating={rating} className="size-5" />
        {title}
      </h2>
      {items.length ? (
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item} className="border-b border-rule py-3 text-[14.5px] leading-[1.75] text-ink">
              <RichText text={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-3 text-[14.5px] text-ink-2">{empty}</p>
      )}
    </section>
  );
}
