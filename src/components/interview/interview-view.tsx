"use client";

import { ChevronRight, Code2, LogOut, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePrefs } from "@/components/providers";
import { EmptyState, PageSkeleton } from "@/components/shared/empty-state";
import { RichText, mentionedLines } from "@/components/shared/rich-text";
import { SiteHeader } from "@/components/shared/site-header";
import { api, errorCodeOf, type ClientErrorCode } from "@/lib/client/api";
import { useHydrated, useSession, type ActiveSession } from "@/lib/client/session-store";
import { useIsDesktop } from "@/lib/client/use-media";
import type { Citation, PlannedQuestion, Thread } from "@/lib/domain";
import {
  activeExchange,
  activeThread,
  addHint,
  applyDecision,
  followUpsUsed,
  recordAnswer,
  skipQuestion,
} from "@/lib/interview/machine";
import { cn } from "@/lib/utils";
import { CodePanel, type CodeFocus } from "./code-panel";
import { Composer } from "./composer";
import { FinishedCard } from "./finished-card";
import { InterviewProgress } from "./progress-bar";
import { QuestionHead, QuestionText, ThreadExchanges } from "./thread-view";

const MAX_HINTS_PER_QUESTION = 3;

/** The latest code the conversation pointed at: a follow-up's citation, else the question's. */
function latestCitation(question: PlannedQuestion, thread: Thread | undefined): Citation {
  const followUp = thread?.exchanges.findLast((exchange) => exchange.snippet && exchange.kind === "followup");
  return followUp?.snippet ?? question.snippet;
}

export function InterviewView() {
  const { t } = usePrefs();
  const hydrated = useHydrated();
  const session = useSession((state) => state.session);

  if (!hydrated) {
    return (
      <div className="min-h-dvh">
        <SiteHeader wide />
        <PageSkeleton />
      </div>
    );
  }
  if (!session) {
    return (
      <div className="min-h-dvh">
        <SiteHeader />
        <EmptyState icon={<MessagesSquare className="size-5" strokeWidth={1.5} />} title={t.interview.noInterview} body={t.interview.noInterviewLead} action={t.setup.goHome} href="/" />
      </div>
    );
  }
  return <Workspace session={session} />;
}

function Workspace({ session }: { session: ActiveSession }) {
  const { t, f } = usePrefs();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const report = useSession((state) => state.report);
  const setInterview = useSession((state) => state.setInterview);
  const setReport = useSession((state) => state.setReport);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<"turn" | "hint" | "report" | null>(null);
  const [error, setError] = useState<ClientErrorCode | null>(null);
  const [manualFocus, setManualFocus] = useState<{ key: string; focus: CodeFocus } | null>(null);
  const [showCode, setShowCode] = useState(false);
  const currentRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const { interview, repo, part, locale } = session;
  const partRef = { title: part.title, summary: part.summary, files: part.files };
  const thread = activeThread(interview);
  const exchange = activeExchange(interview);
  const question = interview.plan[Math.min(interview.index, interview.plan.length - 1)];
  const earlier = interview.threads.slice(0, interview.finished ? undefined : -1);

  // The code panel follows the conversation until the user picks something else for this turn.
  const turnKey = `${interview.index}:${thread?.exchanges.length ?? 0}:${interview.finished}`;
  const cited = latestCitation(question, thread);
  const focus: CodeFocus =
    manualFocus?.key === turnKey ? manualFocus.focus : { path: cited.path, startLine: cited.startLine, endLine: cited.endLine };
  const cite = (citation: Citation) => {
    setManualFocus({ key: turnKey, focus: { path: citation.path, startLine: citation.startLine, endLine: citation.endLine } });
    setShowCode(true);
  };

  // The rail: the question's key at its first cited line, a key per follow-up that cites code.
  const railKeys = interview.finished
    ? []
    : [
        { path: question.snippet.path, line: question.snippet.startLine, label: f(t.interview.railQuestion, { n: interview.index + 1 }), filled: true },
        ...(thread?.exchanges ?? [])
          .filter((item) => item.kind === "followup" && item.snippet)
          .map((item, index) => ({ path: item.snippet!.path, line: item.snippet!.startLine, label: f(t.interview.railFollowUp, { n: index + 1 }) })),
      ];
  // Lines the question and its latest follow-up name stay circled for the whole question.
  const inQuestionFile = !interview.finished && focus.path === question.snippet.path;
  const followUpPrompt = exchange?.kind === "followup" ? exchange.prompt : "";
  const refs = inQuestionFile ? [...new Set([...mentionedLines(question.question), ...mentionedLines(followUpPrompt)])] : [];
  const questionRefs = refs;
  const notes = !interview.finished && question.note ? [{ path: question.snippet.path, ...question.note }] : [];

  const awaitingDecision = !interview.finished && !!exchange?.answer;
  const hasReport = !!report && report.createdAt >= session.startedAt;

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [interview.index]);

  useEffect(() => {
    if (thread && thread.exchanges.length + thread.hints.length > 1) endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [thread, busy]);

  async function requestTurn() {
    const state = useSession.getState().session?.interview;
    const current = state && activeThread(state);
    if (!state || !current) return;
    setBusy("turn");
    setError(null);
    try {
      const decision = await api.turn({ repo, part: partRef, locale, question: state.plan[state.index], thread: current });
      const latest = useSession.getState().session?.interview;
      if (latest) setInterview(applyDecision(latest, decision));
    } catch (caught) {
      setError(errorCodeOf(caught));
    } finally {
      setBusy(null);
    }
  }

  function send() {
    if (!draft.trim() || busy) return;
    setInterview(recordAnswer(interview, draft));
    setDraft("");
    void requestTurn();
  }

  async function hint() {
    if (!thread || busy) return;
    setBusy("hint");
    setError(null);
    try {
      const result = await api.hint({ repo, part: partRef, locale, question, thread });
      const latest = useSession.getState().session?.interview;
      if (latest) setInterview(addHint(latest, result.hint));
    } catch (caught) {
      setError(errorCodeOf(caught));
    } finally {
      setBusy(null);
    }
  }

  function skip() {
    if (busy) return;
    setInterview(skipQuestion(interview));
    setDraft("");
    setError(null);
  }

  async function writeReport() {
    if (busy) return;
    setBusy("report");
    setError(null);
    try {
      const result = await api.report({ repo, part: partRef, locale, plan: interview.plan, threads: interview.threads });
      setReport(result);
      router.push("/report");
    } catch (caught) {
      setError(errorCodeOf(caught));
      setBusy(null);
    }
  }

  const followUpTotal = interview.threads.reduce((sum, item) => sum + followUpsUsed(item), 0);
  const errorText = error ? t.errors[error] : null;
  const codePanel = (className?: string) => (
    <CodePanel
      repo={repo}
      files={part.files}
      focus={focus}
      onFocus={(next) => setManualFocus({ key: turnKey, focus: next })}
      keys={railKeys}
      refs={refs}
      notes={notes}
      className={className}
    />
  );

  const conversation = (
    <>
      {earlier.length > 0 && <EarlierQuestions threads={earlier} plan={interview.plan} onCite={cite} />}

      {interview.finished ? (
        <div ref={currentRef} className="scroll-mt-10">
          <FinishedCard
            questions={interview.plan.length}
            followUps={followUpTotal}
            writing={busy === "report"}
            error={errorText}
            onWrite={() => void writeReport()}
            hasReport={hasReport}
            onOpenReport={() => router.push("/report")}
          />
        </div>
      ) : (
        thread && (
          <div ref={currentRef} key={question.id} className="flex scroll-mt-10 flex-col gap-7 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className="flex flex-col gap-5">
              <QuestionHead question={question} number={interview.index + 1} total={interview.plan.length} />
              <QuestionText question={question} refs={questionRefs} onCite={cite} />
            </div>
            {!isDesktop && (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowCode((value) => !value)}
                  className="inline-flex h-10 items-center gap-2 self-start border border-rule-strong px-3.5 text-[14px] text-ink"
                  aria-expanded={showCode}
                >
                  <Code2 className="size-4" strokeWidth={1.5} />
                  {showCode ? t.interview.hideCode : t.interview.showCode}
                </button>
                {showCode && codePanel("h-[58vh] border border-rule-strong")}
              </div>
            )}
            <ThreadExchanges thread={thread} onCite={cite} thinking={busy === "turn"} hinting={busy === "hint"} refs={exchange?.kind === "followup" ? refs : undefined} />
            <div ref={endRef} />
          </div>
        )
      )}
    </>
  );

  const composer = !interview.finished && (
    <div className="flex flex-col gap-2">
      {errorText && (
        <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-pen">
          <span>{errorText}</span>
          {awaitingDecision && (
            <button type="button" className="font-medium underline underline-offset-4" onClick={() => void requestTurn()}>
              {t.common.retry}
            </button>
          )}
        </div>
      )}
      {awaitingDecision && busy !== "turn" && !errorText ? (
        <button type="button" onClick={() => void requestTurn()} className="inline-flex h-12 items-center justify-center gap-2 bg-ink text-[15px] font-medium text-paper">
          {t.common.retry}
          <ChevronRight className="size-4" strokeWidth={1.5} />
        </button>
      ) : (
        <Composer
          value={draft}
          onChange={setDraft}
          onSend={send}
          onHint={() => void hint()}
          onSkip={skip}
          busy={busy === "report" ? null : busy}
          canHint={(thread?.hints.length ?? 0) < MAX_HINTS_PER_QUESTION}
          compact={!isDesktop}
        />
      )}
    </div>
  );

  const progress = <InterviewProgress plan={interview.plan} threads={interview.threads} index={interview.index} finished={interview.finished} />;
  const header = (
    <SiteHeader wide center={isDesktop ? progress : undefined}>
      <Link href="/setup" className="inline-flex h-8 items-center gap-1.5 px-2 text-[13.5px] text-ink-2 transition-colors hover:bg-sunken hover:text-ink">
        <LogOut className="size-4" strokeWidth={1.5} />
        <span className="hidden sm:inline">{t.interview.leave}</span>
      </Link>
    </SiteHeader>
  );

  if (isDesktop) {
    return (
      <div className="flex h-dvh flex-col bg-paper">
        {header}
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
          {codePanel("border-r border-rule-strong")}
          <div className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-10 pb-8 pt-7 [mask-image:linear-gradient(to_bottom,transparent,black_16px,black_calc(100%-16px),transparent)]">
              <div className="mx-auto flex max-w-[620px] flex-col gap-9">{conversation}</div>
            </div>
            {composer && <div className="mx-auto w-full max-w-[700px] shrink-0 px-10 pb-6 pt-2">{composer}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      {header}
      <div className="border-b border-rule px-5 py-3">{progress}</div>
      <main className={cn("flex flex-1 flex-col gap-8 px-5 pt-6", composer ? "pb-6" : "pb-10")}>{conversation}</main>
      {composer && <div className="sticky bottom-0 z-10 border-t border-rule-strong bg-paper/95 px-4 pb-3 pt-3 backdrop-blur-md">{composer}</div>}
    </div>
  );
}

function EarlierQuestions({ threads, plan, onCite }: { threads: Thread[]; plan: PlannedQuestion[]; onCite: (citation: Citation) => void }) {
  const { t } = usePrefs();
  return (
    <section className="flex flex-col" aria-label={t.interview.earlier}>
      <h3 className="pb-2 text-[12.5px] font-medium text-ink-3">{t.interview.earlier}</h3>
      {threads.map((thread) => {
        const index = plan.findIndex((item) => item.id === thread.questionId);
        const question = plan[index];
        if (!question) return null;
        const skipped = thread.exchanges.some((exchange) => exchange.skipped);
        return (
          <details key={thread.questionId} className="group border-t border-rule last:border-b">
            <summary className="flex cursor-pointer list-none items-center gap-3 py-3 [&::-webkit-details-marker]:hidden">
              <span className="grid size-[20px] shrink-0 place-items-center bg-ink font-serif text-[11.5px] text-paper tabular">{index + 1}</span>
              <span className="min-w-0 flex-1 truncate text-[14px] text-ink-2">
                <RichText text={question.question} />
              </span>
              {skipped && <span className="shrink-0 border border-rule-strong px-1.5 text-[11.5px] text-ink-3">{t.interview.skipped}</span>}
              <ChevronRight className="size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-90" strokeWidth={1.5} />
            </summary>
            <div className="flex flex-col gap-5 pb-6 pt-1">
              <QuestionText question={question} onCite={onCite} size="small" />
              <ThreadExchanges thread={thread} onCite={onCite} />
            </div>
          </details>
        );
      })}
    </section>
  );
}
