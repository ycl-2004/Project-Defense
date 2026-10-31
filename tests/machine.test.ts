import { describe, expect, it } from "vitest";
import type { PlannedQuestion } from "@/lib/domain";
import {
  activeExchange,
  addHint,
  applyDecision,
  canFollowUp,
  recordAnswer,
  skipQuestion,
  startInterview,
  totalHints,
} from "@/lib/interview/machine";

const snippet = { path: "a.ts", startLine: 1, endLine: 2, code: "x" };
const plan: PlannedQuestion[] = ["q1", "q2"].map((id) => ({
  id,
  layer: "explain",
  difficulty: "easy",
  question: `question ${id}`,
  focus: "f",
  snippet,
}));
const followUp = { type: "followup" as const, prompt: "why?", difficulty: "hard" as const };

describe("interview machine", () => {
  it("opens the first question", () => {
    const state = startInterview(plan);
    expect(activeExchange(state)).toMatchObject({ kind: "main", prompt: "question q1" });
  });

  it("records trimmed answers and ignores empty ones", () => {
    const state = recordAnswer(startInterview(plan), "  because  ");
    expect(activeExchange(state)?.answer).toBe("because");
    expect(recordAnswer(state, "   ")).toBe(state);
  });

  it("allows at most two follow-ups, then moves on", () => {
    let state = startInterview(plan);
    state = applyDecision(recordAnswer(state, "a"), followUp);
    state = applyDecision(recordAnswer(state, "b"), followUp);
    expect(state.threads[0].exchanges).toHaveLength(3);
    expect(canFollowUp(state.threads[0])).toBe(false);

    state = applyDecision(recordAnswer(state, "c"), followUp);
    expect(state.index).toBe(1);
    expect(activeExchange(state)?.prompt).toBe("question q2");
  });

  it("skip marks the question and advances; the last question finishes", () => {
    let state = skipQuestion(startInterview(plan));
    expect(state.threads[0].exchanges[0].skipped).toBe(true);
    state = applyDecision(recordAnswer(state, "done"), { type: "next" });
    expect(state.finished).toBe(true);
    expect(activeExchange(state)).toBeUndefined();
  });

  it("counts hints across questions", () => {
    let state = addHint(startInterview(plan), "look at line 3");
    state = addHint(skipQuestion(state), "think about errors");
    expect(totalHints(state.threads)).toBe(2);
  });
});
