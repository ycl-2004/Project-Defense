import { describe, expect, it } from "vitest";
import type { PlannedQuestion, Report, Thread } from "@/lib/domain";
import { MESSAGES } from "@/lib/i18n/messages";
import { reportMarkdown } from "@/lib/interview/export";
import { REPO } from "./fakes";

const plan: PlannedQuestion[] = [
  {
    id: "q1", layer: "explain", difficulty: "hard", question: "What happens on upload?", focus: "flow",
    snippet: { path: "src/a.ts", startLine: 3, endLine: 4, code: "const md = `x`;\nconst fence = '```';" },
  },
  {
    id: "q2", layer: "failure", difficulty: "hard", question: "What if it fails?", focus: "errors",
    snippet: { path: "src/b.py", startLine: 1, endLine: 1, code: "raise Error()" },
  },
];
const threads: Thread[] = [
  {
    questionId: "q1", hints: ["look at line 3"],
    exchanges: [
      { kind: "main", prompt: "What happens on upload?", difficulty: "hard", answer: "It parses.\nThen saves." },
      { kind: "followup", prompt: "Saves where?", difficulty: "tricky", answer: "In the DB." },
    ],
  },
  { questionId: "q2", hints: [], exchanges: [{ kind: "main", prompt: "What if it fails?", difficulty: "hard", skipped: true }] },
];
const report: Report = {
  summary: "Solid on the flow.",
  questions: [
    { id: "q1", rating: "clear", evidence: "Said it parses.", comment: "Nice." },
    { id: "q2", rating: "unanswered", evidence: "Skipped.", comment: "Try it." },
  ],
  strengths: ["Explained parsing"],
  misconceptions: [],
  studyNext: [{ topic: "Error handling", why: "Skipped q2", files: ["src/b.py"] }],
  mentorNextStep: { task: "Add a retry", why: "Shows understanding" },
};
const doc = { report, plan, threads, part: { title: "Upload" }, repo: REPO, difficulty: "hard" as const, createdAt: "2026-10-30T12:00:00Z" };

describe("reportMarkdown", () => {
  const md = reportMarkdown(doc, MESSAGES.en);

  it("covers every section with layer scores derived from the ratings", () => {
    for (const heading of ["# Understanding report", "## Summary", "## Five layers", "## Question by question", "## Learn next", "## For the mentor: next check"]) {
      expect(md).toContain(heading);
    }
    expect(md).toContain("| Explain the feature | 5 / 5 |");
    expect(md).toContain("| Handle failure | 1 / 5 |");
    expect(md).toContain("| Understand decisions | Not asked |");
  });

  it("keeps answers as quotes, numbers follow-ups and marks skipped questions", () => {
    expect(md).toContain("> It parses.\n> Then saves.");
    expect(md).toContain("**Follow-up 1**: Saves where?");
    expect(reportMarkdown(doc, MESSAGES.zh)).toContain("**题目**：What happens on upload?");
    expect(md).toContain("> (skipped)");
    expect(md).toContain("_1 hints used_");
  });

  it("uses a fence longer than any backticks inside the code and links to the pinned lines", () => {
    expect(md).toContain("````typescript\nconst md = `x`;");
    expect(md).toContain(`https://github.com/kid/syllabus/blob/${REPO.sha}/src/a.ts#L3-L4`);
    expect(md).toContain("```python\nraise Error()\n```");
  });

  it("ends with the disclaimer and writes Chinese labels for a Chinese report", () => {
    expect(md.trim().endsWith(MESSAGES.en.report.disclaimer)).toBe(true);
    expect(reportMarkdown(doc, MESSAGES.zh)).toContain("## 逐题回顾");
  });
});
