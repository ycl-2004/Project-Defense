import { describe, expect, it } from "vitest";
import { GitHubClient } from "@/lib/github/client";
import { parseRepoUrl } from "@/lib/github/url";

type Route = { status?: number; body?: unknown; headers?: Record<string, string> };

function fakeFetch(routes: Record<string, Route>) {
  const requested: string[] = [];
  const impl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    requested.push(url);
    const route = routes[url] ?? { status: 404, body: {} };
    const headers = new Headers({ ...(route.headers ?? {}), ...(init?.headers as Record<string, string>) });
    const body = typeof route.body === "string" ? route.body : JSON.stringify(route.body ?? {});
    return new Response(body, { status: route.status ?? 200, headers });
  }) as typeof fetch;
  return { impl, requested };
}

const API = "https://api.github.com/repos/o/r";

describe("GitHubClient.resolve", () => {
  it("pins the default branch to its commit sha", async () => {
    const { impl } = fakeFetch({
      [API]: { body: { default_branch: "main", private: false } },
      [`${API}/commits/main`]: { body: { sha: "sha-main" } },
    });
    await expect(new GitHubClient(undefined, impl).resolve(parseRepoUrl("o/r"))).resolves.toEqual({
      owner: "o", repo: "r", ref: "main", sha: "sha-main", subdir: "",
    });
  });

  it("finds a branch name that contains a slash", async () => {
    const { impl } = fakeFetch({
      [API]: { body: { default_branch: "main", private: false } },
      [`${API}/commits/feature%2Fx`]: { body: { sha: "sha-fx" } },
    });
    const ref = await new GitHubClient(undefined, impl).resolve(parseRepoUrl("github.com/o/r/tree/feature/x/src"));
    expect(ref).toMatchObject({ ref: "feature/x", sha: "sha-fx", subdir: "src" });
  });

  it("maps missing repos and exhausted rate limits to user-facing codes", async () => {
    const missing = fakeFetch({});
    await expect(new GitHubClient(undefined, missing.impl).resolve(parseRepoUrl("o/r"))).rejects.toMatchObject({
      code: "repo_not_found",
    });
    const limited = fakeFetch({ [API]: { status: 403, headers: { "x-ratelimit-remaining": "0" } } });
    await expect(new GitHubClient(undefined, limited.impl).resolve(parseRepoUrl("o/r"))).rejects.toMatchObject({
      code: "rate_limited",
    });
  });
});

describe("GitHubClient files", () => {
  const ref = { owner: "o", repo: "r", ref: "main", sha: "s1", subdir: "" };

  it("lists blobs only", async () => {
    const { impl } = fakeFetch({
      [`${API}/git/trees/s1?recursive=1`]: {
        body: { truncated: false, tree: [{ path: "src", type: "tree" }, { path: "src/a.ts", type: "blob", size: 12 }] },
      },
    });
    await expect(new GitHubClient(undefined, impl).tree(ref)).resolves.toEqual([{ path: "src/a.ts", size: 12 }]);
  });

  it("reads raw files once per commit and path", async () => {
    const { impl, requested } = fakeFetch({ "https://raw.githubusercontent.com/o/r/s1/src/a.ts": { body: "const a = 1" } });
    const client = new GitHubClient("token", impl);
    const first = await client.files(ref, ["src/a.ts"]);
    await client.files(ref, ["src/a.ts"]);
    expect(first.get("src/a.ts")).toBe("const a = 1");
    expect(requested).toHaveLength(1);
  });
});

describe("GitHubClient.rateLimit", () => {
  it("reads the core quota and flags a refused token", async () => {
    const ok = fakeFetch({ "https://api.github.com/rate_limit": { body: { resources: { core: { limit: 5000, remaining: 4998 } } } } });
    await expect(new GitHubClient("t", ok.impl).rateLimit()).resolves.toEqual({ limit: 5000, remaining: 4998, rejected: false });
    const refused = fakeFetch({ "https://api.github.com/rate_limit": { status: 401 } });
    await expect(new GitHubClient("bad", refused.impl).rateLimit()).resolves.toEqual({ limit: 0, remaining: 0, rejected: true });
  });
});
