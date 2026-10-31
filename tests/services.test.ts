import { describe, expect, it } from "vitest";
import type { PlannedQuestion, Thread } from "@/lib/domain";
import { analyzeRepo, buildReport, nextTurn, startInterview } from "@/lib/server/services";
import { FakeGitHub, lines, REPO, ScriptedLLM } from "./fakes";

const repoFiles = {
  "README.md": "# Syllabus helper",
  "src/extract.ts": lines(60, "extract"),
  "src/upload.ts": lines(30, "upload"),
  "node_modules/x/index.js": "ignored",
  "logo.png": "binary",
};

const cite = (path: string, startLine: number, endLine: number) => ({ path, startLine, endLine });

describe("analyzeRepo", () => {
  it("keeps only files that exist and numbers the Parts", async () => {
    const llm = new ScriptedLLM([
      {
        project: { name: "Syllabus", oneLiner: "o", stack: ["TS"], summary: "s" },
        parts: [
          { title: "Extract", summary: "s", files: ["src/extract.ts", "src/ghost.ts"] },
          { title: "Ghost", summary: "s", files: ["nowhere.ts"] },
          { title: "Upload", summary: "s", files: ["src/upload.ts"] },
        ],
      },
    ]);
    const result = await analyzeRepo({ github: new FakeGitHub(repoFiles), llm }, { url: "kid/syllabus", locale: "en" });
    expect(result.parts).toEqual([
      { id: "p1", title: "Extract", summary: "s", files: ["src/extract.ts"] },
      { id: "p2", title: "Upload", summary: "s", files: ["src/upload.ts"] },
    ]);
    expect(result.fileCount).toBe(3);
    const prompt = llm.requests[0].user;
    expect(prompt).toContain("src/extract.ts");
    expect(prompt).not.toContain("node_modules");
    expect(prompt).toContain("# Syllabus helper");
  });
});

describe("startInterview", () => {
  const part = { title: "Extract", summary: "s", files: ["src/extract.ts", "src/upload.ts"] };
  const question = (path: string, start: number, end: number) => ({
    layer: "decision", question: "Why?", focus: "f", citation: cite(path, start, end),
  });

  it("asks again when a citation does not match the real file, then cuts snippets from the file", async () => {
    const llm = new ScriptedLLM([
      { questions: Array.from({ length: 5 }, () => question("src/extract.ts", 70, 80)) },
      { questions: Array.from({ length: 5 }, (_, index) => question("src/extract.ts", index + 1, index + 3)) },
    ]);
    const result = await startInterview(
      { github: new FakeGitHub(repoFiles), llm },
      { repo: REPO, part, difficulty: "tricky", count: 5, locale: "zh" },
    );
    expect(result.plan.map((q) => q.layer)).toEqual(["explain", "code", "decision", "failure", "apply"]);
    expect(result.plan[0]).toMatchObject({ id: "q1", difficulty: "tricky", snippet: { code: "extract 1\nextract 2\nextract 3" } });
    expect(llm.requests[0].user).toContain(" 1| extract 1");
    expect(llm.requests[0].user).toContain("Simplified Chinese");
  });

  it("rejects Part files that are not readable source in the repo", async () => {
    const llm = new ScriptedLLM([]);
    await expect(
      startInterview(
        { github: new FakeGitHub(repoFiles), llm },
        { repo: REPO, part: { title: "x", summary: "", files: ["logo.png"] }, difficulty: "easy", count: 5, locale: "en" },
      ),
    ).rejects.toMatchObject({ code: "bad_request" });
  });

  it("lets the model pick files for a Part the student described", async () => {
    const llm = new ScriptedLLM([
      { title: "Upload flow", summary: "s", files: ["src/upload.ts"] },
      { questions: Array.from({ length: 5 }, () => question("src/upload.ts", 1, 2)) },
    ]);
    const result = await startInterview(
      { github: new FakeGitHub(repoFiles), llm },
      { repo: REPO, part: { description: "how files get uploaded" }, difficulty: "easy", count: 5, locale: "en" },
    );
    expect(result.part).toMatchObject({ id: "custom", title: "Upload flow", files: ["src/upload.ts"] });
    expect(llm.requests[0].thinking).toBe(false);
  });
});

const planned: PlannedQuestion = {
  id: "q1", layer: "code", difficulty: "easy", question: "What does it do?", focus: "f",
  snippet: { ...cite("src/extract.ts", 1, 2), code: "extract 1\nextract 2" },
};
const context = (thread: Thread) => ({
  repo: REPO, part: { title: "Extract", summary: "s", files: ["src/extract.ts"] }, locale: "en" as const, question: planned, thread,
});
const answered = (followUps: number): Thread => ({
  questionId: "q1",
  hints: [],
  exchanges: [
    { kind: "main", prompt: "What does it do?", difficulty: "easy", answer: "it extracts" },
    ...Array.from({ length: followUps }, () => ({ kind: "followup" as const, prompt: "more?", difficulty: "easy" as const, answer: "yes" })),
  ],
});

describe("nextTurn", () => {
  it("returns a follow-up with a raised difficulty and a real snippet", async () => {
    const llm = new ScriptedLLM([
      { decision: "followup", followUp: { question: "What is saved?", harder: true, citation: cite("src/extract.ts", 5, 6) } },
    ]);
    const decision = await nextTurn({ github: new FakeGitHub(repoFiles), llm }, context(answered(0)));
    expect(decision).toEqual({
      type: "followup",
      prompt: "What is saved?",
      difficulty: "hard",
      snippet: { ...cite("src/extract.ts", 5, 6), code: "extract 5\nextract 6" },
    });
    expect(llm.requests[0].thinking).toBe(false);
  });

  it("drops a broken follow-up citation instead of failing", async () => {
    const llm = new ScriptedLLM([{ decision: "followup", followUp: { question: "Q", harder: false, citation: cite("nope.ts", 1, 2) } }]);
    const decision = await nextTurn({ github: new FakeGitHub(repoFiles), llm }, context(answered(0)));
    expect(decision).toEqual({ type: "followup", prompt: "Q", difficulty: "easy" });
  });

  it("moves on without calling the model once two follow-ups are used", async () => {
    const llm = new ScriptedLLM([]);
    await expect(nextTurn({ github: new FakeGitHub(repoFiles), llm }, context(answered(2)))).resolves.toEqual({ type: "next" });
    expect(llm.requests).toHaveLength(0);
  });

  it("refuses a turn whose latest question has no answer", async () => {
    const thread: Thread = { questionId: "q1", hints: [], exchanges: [{ kind: "main", prompt: "p", difficulty: "easy" }] };
    await expect(nextTurn({ github: new FakeGitHub(repoFiles), llm: new ScriptedLLM([]) }, context(thread))).rejects.toMatchObject({
      code: "bad_request",
    });
  });
});

describe("buildReport", () => {
  it("forces unanswered for skipped questions and asks again when a question is not rated", async () => {
    const report = (ids: string[]) => ({
      summary: "s",
      questions: ids.map((id) => ({ id, rating: "clear", evidence: "e", comment: "c" })),
      strengths: [], misconceptions: [], studyNext: [], mentorNextStep: { task: "t", why: "w" },
    });
    const llm = new ScriptedLLM([report(["q1"]), report(["q1", "q2"])]);
    const plan = [planned, { ...planned, id: "q2" }];
    const threads: Thread[] = [
      answered(0),
      { questionId: "q2", hints: [], exchanges: [{ kind: "main", prompt: "p", difficulty: "easy", skipped: true }] },
    ];
    const result = await buildReport({ github: new FakeGitHub(repoFiles), llm }, { ...context(answered(0)), plan, threads });
    expect(result.questions.map((q) => q.rating)).toEqual(["clear", "unanswered"]);
  });
});
