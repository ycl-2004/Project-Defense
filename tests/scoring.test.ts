import { expect, it } from "vitest";
import type { PlannedQuestion, Rating } from "@/lib/domain";
import { layerScores, ratingCounts } from "@/lib/interview/scoring";

const snippet = { path: "a.ts", startLine: 1, endLine: 1, code: "x" };
const question = (id: string, layer: PlannedQuestion["layer"]): PlannedQuestion => ({
  id, layer, difficulty: "easy", question: "", focus: "", snippet,
});
const plan = [question("q1", "explain"), question("q2", "code"), question("q3", "code"), question("q4", "apply")];
const rated = (ratings: Record<string, Rating>) => ({
  questions: Object.entries(ratings).map(([id, rating]) => ({ id, rating, evidence: "", comment: "" })),
});

it("derives 1-5 layer scores from ratings and leaves unasked layers empty", () => {
  const scores = layerScores(plan, rated({ q1: "clear", q2: "partial", q3: "misconception", q4: "unanswered" }));
  expect(Object.fromEntries(scores.map((score) => [score.layer, score.score]))).toEqual({
    explain: 5,
    code: 2.5,
    decision: null,
    failure: null,
    apply: 1,
  });
});

it("treats a question missing from the report as unanswered", () => {
  expect(layerScores(plan, rated({}))[0].score).toBe(1);
});

it("counts ratings", () => {
  expect(ratingCounts(rated({ q1: "clear", q2: "clear", q3: "partial" }))).toEqual({
    clear: 2, partial: 1, misconception: 0, unanswered: 0,
  });
});
