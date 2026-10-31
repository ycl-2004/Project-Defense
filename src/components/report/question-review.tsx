"use client";

import { ArrowUpRight, ChevronDown, Lightbulb } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { ThreadExchanges } from "@/components/interview/thread-view";
import { usePrefs } from "@/components/providers";
import { CodeView } from "@/components/shared/code-view";
import { RichText } from "@/components/shared/rich-text";
import { DifficultyTag, LayerTag, RatingBadge, RATING_STYLE } from "@/components/shared/tags";
import type { Citation, PlannedQuestion, RepoRef, ReportQuestion, Thread } from "@/lib/domain";
import { githubBlobUrl } from "@/lib/github/url";
import { followUpsUsed } from "@/lib/interview/machine";
import { cn } from "@/lib/utils";

export function QuestionReview({
  number,
  question,
  thread,
  rated,
  repo,
}: {
  number: number;
  question: PlannedQuestion;
  thread: Thread | undefined;
  rated: ReportQuestion;
  repo: RepoRef;
}) {
  const { t, f } = usePrefs();
  const { snippet } = question;
  const openOnGitHub = (citation: Citation) =>
    window.open(githubBlobUrl(repo, citation.path, citation.startLine, citation.endLine), "_blank", "noreferrer");
  const RatingIcon = RATING_STYLE[rated.rating].icon;

  return (
    <AccordionPrimitive.Item value={question.id} className="rounded-2xl border border-line bg-surface transition-shadow data-[state=open]:shadow-card">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="group flex w-full break-inside-avoid items-start gap-4 rounded-2xl p-4 text-left sm:p-5">
          <span className="tabular mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-sunken text-[13px] font-semibold text-ink-2">{number}</span>
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="text-[15.5px] font-medium leading-[1.6] text-ink [text-wrap:pretty] group-data-[state=closed]:line-clamp-2">
              <RichText text={question.question} />
            </span>
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <LayerTag layer={question.layer} />
              <DifficultyTag difficulty={question.difficulty} />
              {thread && followUpsUsed(thread) > 0 && (
                <span className="text-[12.5px] text-ink-3">
                  {t.report.followUp} × {followUpsUsed(thread)}
                </span>
              )}
              {thread && thread.hints.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[12.5px] text-ink-3">
                  <Lightbulb className="size-3.5" />
                  {f(t.report.hintsUsed, { count: thread.hints.length })}
                </span>
              )}
            </span>
          </span>
          <RatingBadge rating={rated.rating} className="hidden sm:inline-flex" />
          <ChevronDown className="no-print mt-1 size-4 shrink-0 text-ink-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="flex flex-col gap-6 border-t border-line px-4 pb-6 pt-5 sm:px-5 sm:pl-[68px]">
          <RatingBadge rating={rated.rating} className="self-start sm:hidden" />
          <p className="text-[14px] leading-[1.7] text-ink-2">
            <span className="font-medium text-ink">
              {t.report.focus}
              {t.common.colon}
            </span>
            <RichText text={question.focus} />
          </p>

          <div className="break-inside-avoid overflow-hidden rounded-2xl border border-line bg-code-bg">
            <div className="flex h-10 items-center justify-between gap-3 border-b border-line px-4">
              <span className="truncate font-mono text-[12px] text-ink-2">
                {snippet.path} · {f(t.common.lines, { start: snippet.startLine, end: snippet.endLine })}
              </span>
              <a
                href={githubBlobUrl(repo, snippet.path, snippet.startLine, snippet.endLine)}
                target="_blank"
                rel="noreferrer"
                className="no-print inline-flex shrink-0 items-center gap-1 text-[12px] text-ink-2 hover:text-ink"
              >
                GitHub
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>
            <CodeView code={snippet.code} path={snippet.path} firstLine={snippet.startLine} wrap className="max-h-[320px]" />
          </div>

          {thread && <ThreadExchanges thread={thread} onCite={openOnGitHub} />}

          <div className="grid break-inside-avoid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-sunken p-4">
              <div className="text-[13px] font-semibold text-ink">{t.report.evidence}</div>
              <p className="mt-1.5 text-[14px] leading-[1.75] text-ink-2">
                <RichText text={rated.evidence} />
              </p>
            </div>
            <div className={cn("rounded-2xl p-4", RATING_STYLE[rated.rating].soft)}>
              <div className={cn("flex items-center gap-1.5 text-[13px] font-semibold", RATING_STYLE[rated.rating].text)}>
                <RatingIcon className="size-3.5" strokeWidth={2.25} />
                {t.report.feedback}
              </div>
              <p className="mt-1.5 text-[14px] leading-[1.75] text-ink">
                <RichText text={rated.comment} />
              </p>
            </div>
          </div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
