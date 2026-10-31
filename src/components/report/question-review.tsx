"use client";

import { ArrowUpRight, ChevronDown, Lightbulb } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { ThreadExchanges } from "@/components/interview/thread-view";
import { usePrefs } from "@/components/providers";
import { CodeView } from "@/components/shared/code-view";
import { RichText } from "@/components/shared/rich-text";
import { DifficultyTag, LayerTag, RatingBadge } from "@/components/shared/tags";
import { PenMark } from "@/components/shared/marks";
import type { Citation, PlannedQuestion, RepoRef, ReportQuestion, Thread } from "@/lib/domain";
import { githubBlobUrl } from "@/lib/github/url";
import { followUpsUsed } from "@/lib/interview/machine";

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

  return (
    <AccordionPrimitive.Item value={question.id} className="border-b border-rule">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="group flex w-full break-inside-avoid items-start gap-4 py-4 text-left">
          <span className="tabular mt-1 grid size-7 shrink-0 place-items-center border border-rule-strong text-[13px] text-ink-2">{number}</span>
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="font-serif text-[16.5px] font-semibold leading-[1.7] text-ink [text-wrap:pretty] group-data-[state=closed]:line-clamp-2">
              <RichText text={question.question} />
            </span>
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <LayerTag layer={question.layer} />
              <DifficultyTag difficulty={question.difficulty} />
              {thread && followUpsUsed(thread) > 0 && (
                <span className="text-[13px] text-pen">
                  {t.report.followUp} × {followUpsUsed(thread)}
                </span>
              )}
              {thread && thread.hints.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[13px] text-ink-2">
                  <Lightbulb className="size-3.5" strokeWidth={1.5} />
                  {f(t.report.hintsUsed, { count: thread.hints.length })}
                </span>
              )}
              <RatingBadge rating={rated.rating} className="sm:hidden" />
            </span>
          </span>
          <RatingBadge rating={rated.rating} className="mt-1 hidden sm:inline-flex" />
          <ChevronDown
            className="no-print mt-1.5 size-4 shrink-0 text-ink-3 transition-transform duration-200 group-data-[state=open]:rotate-180"
            strokeWidth={1.5}
          />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="flex flex-col gap-6 pb-7 pt-1 sm:pl-11">
          <p className="text-[14px] leading-[1.75] text-ink-2">
            <span className="font-medium text-ink">
              {t.report.focus}
              {t.common.colon}
            </span>
            <RichText text={question.focus} />
          </p>

          <div className="break-inside-avoid border border-rule-strong">
            <div className="flex h-10 items-center justify-between gap-3 border-b border-rule px-4">
              <span className="truncate font-mono text-[12px] text-ink-2">
                {snippet.path} · {f(t.common.lines, { start: snippet.startLine, end: snippet.endLine })}
              </span>
              <a
                href={githubBlobUrl(repo, snippet.path, snippet.startLine, snippet.endLine)}
                target="_blank"
                rel="noreferrer"
                className="no-print inline-flex shrink-0 items-center gap-1 text-[12.5px] text-ink-2 hover:text-ink"
              >
                GitHub
                <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
              </a>
            </div>
            <CodeView
              code={snippet.code}
              path={snippet.path}
              firstLine={snippet.startLine}
              highlight={{ start: snippet.startLine, end: snippet.endLine }}
              wrap
              className="max-h-[320px]"
            />
          </div>

          {thread && <ThreadExchanges thread={thread} onCite={openOnGitHub} />}

          <div className="grid break-inside-avoid gap-6 border-t border-rule pt-5 sm:grid-cols-2">
            <div>
              <div className="text-[13px] font-medium text-ink">{t.report.evidence}</div>
              <p className="mt-1.5 text-[14px] leading-[1.75] text-ink-2">
                <RichText text={rated.evidence} />
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-pen">
                <PenMark rating={rated.rating} className="size-4" />
                {t.report.feedback}
              </div>
              <p className="mt-1.5 font-hand text-[17px] leading-[1.8] text-pen">
                <RichText text={rated.comment} />
              </p>
            </div>
          </div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
