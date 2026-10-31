import { describe, expect, it } from "vitest";
import { githubBlobUrl, parseRepoUrl, refCandidates } from "@/lib/github/url";

describe("parseRepoUrl", () => {
  it.each([
    ["https://github.com/vercel/next.js", "vercel", "next.js"],
    ["github.com/vercel/next.js.git", "vercel", "next.js"],
    ["  http://www.github.com/a-b/c_d/  ", "a-b", "c_d"],
    ["owner/repo", "owner", "repo"],
  ])("reads owner and repo from %s", (input, owner, repo) => {
    expect(parseRepoUrl(input)).toMatchObject({ owner, repo, refPath: [] });
  });

  it("keeps the path after /tree/ for later ref resolution", () => {
    expect(parseRepoUrl("https://github.com/o/r/tree/feature/x/src/app")).toEqual({
      owner: "o",
      repo: "r",
      refPath: ["feature", "x", "src", "app"],
      pointsAtFile: false,
    });
  });

  it.each(["", "https://gitlab.com/o/r", "https://github.com/onlyowner", "https://github.com/o/r/tree/", "not a url at all"])(
    "rejects %j",
    (input) => {
      expect(() => parseRepoUrl(input)).toThrowError(expect.objectContaining({ code: "invalid_url" }));
    },
  );
});

describe("refCandidates", () => {
  it("tries the shortest ref first and keeps the rest as sub-directory", () => {
    expect(refCandidates(parseRepoUrl("github.com/o/r/tree/feature/x/src"))).toEqual([
      { ref: "feature", subdir: "x/src" },
      { ref: "feature/x", subdir: "src" },
      { ref: "feature/x/src", subdir: "" },
    ]);
  });

  it("never treats the file of a /blob/ link as a directory", () => {
    expect(refCandidates(parseRepoUrl("github.com/o/r/blob/main/src/page.tsx"))).toEqual([
      { ref: "main", subdir: "src" },
      { ref: "main/src", subdir: "" },
    ]);
  });
});

it("builds GitHub links pinned to a commit with a line range", () => {
  expect(githubBlobUrl({ owner: "o", repo: "r", sha: "abc" }, "src/my file.ts", 3, 9)).toBe(
    "https://github.com/o/r/blob/abc/src/my%20file.ts#L3-L9",
  );
});
