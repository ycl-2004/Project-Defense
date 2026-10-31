import { describe, expect, it } from "vitest";
import { LIMITS } from "@/lib/config";
import { numberLines, resolveCitation } from "@/lib/interview/citations";
import { lines } from "./fakes";

const files = new Map([
  ["a.ts", lines(100)],
  ["blank.ts", "code\n\n\n\nmore"],
]);

describe("resolveCitation", () => {
  it("cuts the cited lines from the real file", () => {
    const result = resolveCitation({ path: "a.ts", startLine: 3, endLine: 5 }, files);
    expect(result).toEqual({ ok: true, snippet: { path: "a.ts", startLine: 3, endLine: 5, code: "line 3\nline 4\nline 5" } });
  });

  it("trims long ranges and ranges past the end of the file", () => {
    const long = resolveCitation({ path: "a.ts", startLine: 10, endLine: 90 }, files);
    expect(long.ok && long.snippet.endLine).toBe(10 + LIMITS.maxSnippetLines - 1);
    const pastEnd = resolveCitation({ path: "a.ts", startLine: 95, endLine: 140 }, files);
    expect(pastEnd.ok && pastEnd.snippet.endLine).toBe(100);
  });

  it.each([
    [{ path: "nope.ts", startLine: 1, endLine: 2 }, "not in the provided files"],
    [{ path: "a.ts", startLine: 101, endLine: 102 }, "outside"],
    [{ path: "a.ts", startLine: 9, endLine: 4 }, "before startLine"],
    [{ path: "blank.ts", startLine: 2, endLine: 4 }, "blank"],
  ])("rejects %j", (citation, reason) => {
    const result = resolveCitation(citation, files);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.reason).toContain(reason);
  });
});

it("numbers lines with aligned widths and handles CRLF", () => {
  expect(numberLines(lines(10).replace(/\n/g, "\r\n")).split("\n").slice(8)).toEqual([" 9| line 9", "10| line 10"]);
});
