import { LIMITS } from "@/lib/config";
import type { Difficulty, Exchange, PlannedQuestion, Snippet, Thread } from "@/lib/domain";

/**
 * The interview as pure state transitions. The browser drives it; the server reuses
 * `canFollowUp` so the follow-up cap holds even if a client sends something else.
 */
export type InterviewState = {
  plan: PlannedQuestion[];
  threads: Thread[];
  /** Index into `plan` of the question being discussed. */
  index: number;
  finished: boolean;
};

export type TurnDecision =
  | { type: "next" }
  | { type: "followup"; prompt: string; difficulty: Difficulty; snippet?: Snippet };

export function startInterview(plan: PlannedQuestion[]): InterviewState {
  if (plan.length === 0) throw new Error("empty plan");
  return { plan, threads: [openThread(plan[0])], index: 0, finished: false };
}

export function activeThread(state: InterviewState): Thread | undefined {
  return state.finished ? undefined : state.threads[state.threads.length - 1];
}

export function activeExchange(state: InterviewState): Exchange | undefined {
  const thread = activeThread(state);
  return thread?.exchanges[thread.exchanges.length - 1];
}

export function followUpsUsed(thread: Thread): number {
  return thread.exchanges.filter((exchange) => exchange.kind === "followup").length;
}

export function canFollowUp(thread: Thread): boolean {
  return followUpsUsed(thread) < LIMITS.maxFollowUps;
}

export function recordAnswer(state: InterviewState, answer: string): InterviewState {
  const text = answer.trim().slice(0, LIMITS.maxAnswerChars);
  if (!text) return state;
  return updateActiveExchange(state, (exchange) => ({ ...exchange, answer: text }));
}

export function applyDecision(state: InterviewState, decision: TurnDecision): InterviewState {
  const thread = activeThread(state);
  if (!thread) return state;
  if (decision.type === "followup" && canFollowUp(thread)) {
    const followUp: Exchange = {
      kind: "followup",
      prompt: decision.prompt,
      difficulty: decision.difficulty,
      ...(decision.snippet ? { snippet: decision.snippet } : {}),
    };
    return replaceActiveThread(state, { ...thread, exchanges: [...thread.exchanges, followUp] });
  }
  return advance(state);
}

/** "I don't know" ends the current question; there is nothing to follow up on. */
export function skipQuestion(state: InterviewState): InterviewState {
  if (state.finished) return state;
  return advance(updateActiveExchange(state, (exchange) => ({ ...exchange, skipped: true })));
}

export function addHint(state: InterviewState, hint: string): InterviewState {
  const thread = activeThread(state);
  if (!thread) return state;
  return replaceActiveThread(state, { ...thread, hints: [...thread.hints, hint] });
}

export function totalHints(threads: Thread[]): number {
  return threads.reduce((sum, thread) => sum + thread.hints.length, 0);
}

function openThread(question: PlannedQuestion): Thread {
  return {
    questionId: question.id,
    exchanges: [{ kind: "main", prompt: question.question, difficulty: question.difficulty, snippet: question.snippet }],
    hints: [],
  };
}

function advance(state: InterviewState): InterviewState {
  const nextIndex = state.index + 1;
  if (nextIndex >= state.plan.length) return { ...state, finished: true };
  return { ...state, index: nextIndex, threads: [...state.threads, openThread(state.plan[nextIndex])] };
}

function replaceActiveThread(state: InterviewState, thread: Thread): InterviewState {
  return { ...state, threads: [...state.threads.slice(0, -1), thread] };
}

function updateActiveExchange(state: InterviewState, update: (exchange: Exchange) => Exchange): InterviewState {
  const thread = activeThread(state);
  if (!thread || thread.exchanges.length === 0) return state;
  const exchanges = [...thread.exchanges.slice(0, -1), update(thread.exchanges[thread.exchanges.length - 1])];
  return replaceActiveThread(state, { ...thread, exchanges });
}
