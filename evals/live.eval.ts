import { describe, expect, it } from "vitest";
import { splitLines } from "@/lib/interview/citations";
import { startInterview as openSession, recordAnswer, activeThread } from "@/lib/interview/machine";
import { getDeps } from "@/lib/server/deps";
import { analyzeRepo, nextTurn, startInterview } from "@/lib/server/services";

/**
 * Real APIs, real money (a few cents). Checks what unit tests cannot: that the model's Parts name
 * real files, every question cites lines that exist, and a vague answer gets a follow-up.
 */
const REPOS = ["https://github.com/ycl-2004/Project-Defense", "https://github.com/vercel/ms"];

describe.each(REPOS)("live: %s", (url) => {
  it("analyses, plans five cited questions and follows up on a vague answer", async () => {
    const deps = getDeps();
    const timer = (start: number) => `${((Date.now() - start) / 1000).toFixed(1)}s`;

    let start = Date.now();
    const analysis = await analyzeRepo(deps, { url, locale: "zh" });
    console.log(`analyse ${timer(start)} · ${analysis.parts.length} parts: ${analysis.parts.map((part) => part.title).join(" | ")}`);
    expect(analysis.parts.length).toBeGreaterThan(0);

    const part = analysis.parts[0];
    start = Date.now();
    const { plan } = await startInterview(deps, { repo: analysis.repo, part, difficulty: "hard", count: 5, locale: "zh" });
    console.log(`plan ${timer(start)}`);
    expect(plan).toHaveLength(5);

    const files = await deps.github.files(analysis.repo, [...new Set(plan.map((question) => question.snippet.path))]);
    for (const question of plan) {
      const lines = splitLines(files.get(question.snippet.path) ?? "");
      const cut = lines.slice(question.snippet.startLine - 1, question.snippet.endLine).join("\n");
      console.log(`  ${question.id} ${question.layer}: ${question.question.slice(0, 90)}`);
      expect(cut).toBe(question.snippet.code);
    }

    const state = recordAnswer(openSession(plan), "我也不太确定，大概就是调用了一下这个函数吧。");
    start = Date.now();
    const decision = await nextTurn(deps, { repo: analysis.repo, part, locale: "zh", question: plan[0], thread: activeThread(state)! });
    console.log(`turn ${timer(start)} · ${decision.type}${decision.type === "followup" ? `: ${decision.prompt.slice(0, 90)}` : ""}`);
    expect(decision.type).toBe("followup");
  });
});
