"use client";

import { CircleAlert, CircleCheck, Download, FileText, Printer, RotateCcw, ShieldCheck, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefs } from "@/components/providers";
import { EmptyState, PageSkeleton } from "@/components/shared/empty-state";
import { GitHubIcon } from "@/components/shared/github-icon";
import { RichText } from "@/components/shared/rich-text";
import { SiteHeader } from "@/components/shared/site-header";
import { Button } from "@/components/ui/button";
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
        <EmptyState icon={<FileText className="size-5" />} title={t.report.noReport} body={t.report.noReportLead} action={t.report.start} href="/" />
      ) : (
        <ReportBody session={session} saved={saved} />
      )}
    </div>
  );
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[22px] font-semibold text-ink">{title}</h2>
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
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-5 pb-24 pt-6 sm:px-8 lg:pt-10">
      {/* Title */}
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
          <h1 className="font-display text-[34px] font-semibold leading-[1.15] text-ink sm:text-[42px]">{t.report.title}</h1>
          <p className="text-[14.5px] text-ink-2">
            {f(t.report.meta, { part: part.title, difficulty: t.difficulty[difficulty].name, count: plan.length })}
            <span className="text-ink-3"> · {f(t.report.generatedAt, { date })}</span>
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportMarkdown} className="h-10 rounded-xl border-line-strong px-3.5">
            <Download className="size-4" />
            {t.report.exportMd}
          </Button>
          <Button variant="outline" onClick={print} className="h-10 rounded-xl border-line-strong px-3.5">
            <Printer className="size-4" />
            {t.report.print}
          </Button>
          <Button onClick={() => router.push("/setup")} className="h-10 rounded-xl px-4 hover:bg-brand-strong">
            <RotateCcw className="size-4" />
            {t.report.again}
          </Button>
        </div>
      </header>

      {/* Summary + ratings */}
      <section className="break-inside-avoid rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <h2 className="text-[13px] font-semibold text-ink-3">{t.report.summary}</h2>
        <p className="mt-3 text-[17px] leading-[1.85] text-ink sm:text-[18px]">
          <RichText text={report.summary} />
        </p>
        <div className="mt-7 border-t border-line pt-6">
          <h3 className="mb-4 text-[13px] font-semibold text-ink-3">{t.report.ratings}</h3>
          <RatingStrip ratings={ratings} />
        </div>
      </section>

      {/* Five layers */}
      <Section title={t.report.layers}>
        <div className="grid break-inside-avoid grid-cols-1 items-center gap-8 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] print:grid-cols-2">
          <LayerRadar scores={scores} className="mx-auto max-w-[340px]" />
          <div className="flex flex-col gap-5">
            <LayerScoreList scores={scores} />
            <p className="text-[12.5px] leading-[1.7] text-ink-3">{t.report.layersNote}</p>
          </div>
        </div>
      </Section>

      {/* Strengths and misconceptions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="break-inside-avoid rounded-3xl border border-line bg-surface p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
            <CircleCheck className="size-[18px] text-clear" strokeWidth={2.25} />
            {t.report.strengths}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {report.strengths.map((item) => (
              <li key={item} className="flex gap-2.5 text-[14.5px] leading-[1.75] text-ink">
                <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-clear-mark" />
                <span>
                  <RichText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="break-inside-avoid rounded-3xl border border-line bg-surface p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-[16px] font-semibold text-ink">
            <CircleAlert className="size-[18px] text-miss" strokeWidth={2.25} />
            {t.report.misconceptions}
          </h2>
          {report.misconceptions.length ? (
            <ul className="mt-4 flex flex-col gap-3">
              {report.misconceptions.map((item) => (
                <li key={item} className="flex gap-2.5 text-[14.5px] leading-[1.75] text-ink">
                  <span className="mt-[11px] size-1.5 shrink-0 rounded-full bg-miss-mark" />
                  <span>
                    <RichText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-[14.5px] text-ink-2">{t.report.noMisconceptions}</p>
          )}
        </section>
      </div>

      {/* Question by question */}
      <Section title={t.report.questions}>
        <AccordionPrimitive.Root type="multiple" value={open} onValueChange={setOpen} className="flex flex-col gap-3">
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

      {/* Learn next */}
      <Section title={t.report.studyNext}>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {report.studyNext.map((item, index) => (
            <li key={item.topic} className="flex break-inside-avoid gap-4 rounded-2xl border border-line bg-surface p-5">
              <span className="tabular font-display text-[22px] font-semibold leading-none text-brand">{index + 1}</span>
              <div className="flex min-w-0 flex-col gap-2">
                <h3 className="text-[15.5px] font-semibold text-ink">
                  <RichText text={item.topic} />
                </h3>
                <p className="text-[14px] leading-[1.75] text-ink-2">
                  <RichText text={item.why} />
                </p>
                {item.files.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.files.map((file) => (
                      <span key={file} className="max-w-full truncate rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[11.5px] text-ink-2">
                        {file}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Mentor */}
      <section className="break-inside-avoid rounded-3xl bg-brand-soft p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-[17px] font-semibold text-brand-ink">
          <Target className="size-[18px]" />
          {t.report.mentor}
        </h2>
        <p className="mt-1 text-[14px] text-ink-2">{t.report.mentorLead}</p>
        <p className="mt-4 font-display text-[19px] font-semibold leading-[1.6] text-ink">
          <RichText text={report.mentorNextStep.task} />
        </p>
        <p className="mt-2 text-[14.5px] leading-[1.75] text-ink-2">
          <RichText text={report.mentorNextStep.why} />
        </p>
      </section>

      <footer className="flex flex-col gap-3 border-t border-line pt-6 text-[13.5px] leading-[1.75] text-ink-2">
        <span className="tabular">{f(t.report.hintsTotal, { count: totalHints(threads) })}</span>
        <p className="flex gap-2.5">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-clear" />
          {t.report.disclaimer}
        </p>
      </footer>
    </main>
  );
}
