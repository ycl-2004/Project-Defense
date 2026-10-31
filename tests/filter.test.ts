import { describe, expect, it } from "vitest";
import { LIMITS } from "@/lib/config";
import { findReadme, isReadableSource, languageFromPath, selectWithinBudget, withinSubdir } from "@/lib/github/filter";

describe("isReadableSource", () => {
  it.each(["src/app/page.tsx", "main.py", "lib/utils.go", "README.md"])("keeps %s", (path) => {
    expect(isReadableSource({ path, size: 1200 })).toBe(true);
  });

  it.each([
    "node_modules/react/index.js",
    "web/dist/bundle.js",
    "package-lock.json",
    "public/logo.png",
    "static/app.min.js",
    "app.js.map",
  ])("skips %s", (path) => {
    expect(isReadableSource({ path, size: 1200 })).toBe(false);
  });

  it("skips empty and oversized files", () => {
    expect(isReadableSource({ path: "a.ts", size: 0 })).toBe(false);
    expect(isReadableSource({ path: "a.ts", size: LIMITS.maxFileBytes + 1 })).toBe(false);
  });
});

it("limits files to a sub-directory without matching sibling prefixes", () => {
  const files = [{ path: "app/a.ts", size: 1 }, { path: "apps/b.ts", size: 1 }];
  expect(withinSubdir(files, "app")).toEqual([{ path: "app/a.ts", size: 1 }]);
  expect(withinSubdir(files, "")).toEqual(files);
});

it("prefers the sub-directory README and falls back to the root one", () => {
  const files = [{ path: "README.md", size: 1 }, { path: "web/readme.markdown", size: 1 }];
  expect(findReadme(files, "web")?.path).toBe("web/readme.markdown");
  expect(findReadme(files, "api")?.path).toBe("README.md");
});

it("keeps order and stops at the file and byte budget", () => {
  const sizes = new Map([["a", 50], ["b", 60], ["c", 30], ["d", 10]]);
  expect(selectWithinBudget(["a", "b", "c", "unknown", "d"], sizes, { files: 3, bytes: 100 })).toEqual(["a", "c", "d"]);
});

it("maps paths to Shiki languages", () => {
  expect(languageFromPath("src/App.tsx")).toBe("tsx");
  expect(languageFromPath("Dockerfile")).toBe("docker");
  expect(languageFromPath("notes.unknown")).toBe("text");
});
