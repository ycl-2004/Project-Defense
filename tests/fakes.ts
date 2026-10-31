import type { FileInfo, RepoRef } from "@/lib/domain";
import { AppError } from "@/lib/errors";
import type { ParsedRepoUrl } from "@/lib/github/url";
import { checkReply, type JsonLLM, type JsonRequest } from "@/lib/llm/client";
import type { RepoReader } from "@/lib/server/services";

export const REPO: RepoRef = { owner: "kid", repo: "syllabus", ref: "main", sha: "abc1234def", subdir: "" };

/** In-memory repository: path -> content. */
export class FakeGitHub implements RepoReader {
  readonly fetched: string[] = [];
  constructor(readonly contents: Record<string, string>) {}

  async resolve(parsed: ParsedRepoUrl): Promise<RepoRef> {
    if (parsed.repo === "missing") throw new AppError("repo_not_found");
    return { ...REPO, owner: parsed.owner, repo: parsed.repo };
  }

  async tree(): Promise<FileInfo[]> {
    return Object.entries(this.contents).map(([path, content]) => ({ path, size: content.length }));
  }

  async files(_ref: RepoRef, paths: string[]): Promise<Map<string, string>> {
    this.fetched.push(...paths);
    return new Map(paths.map((path) => [path, this.contents[path] ?? ""]));
  }
}

/**
 * Replays scripted model replies and applies the same parse / schema / validate checks as the real
 * client, so retry behaviour is exercised without a network.
 */
export class ScriptedLLM implements JsonLLM {
  readonly requests: JsonRequest<unknown>[] = [];
  constructor(private readonly replies: unknown[]) {}

  async completeJson<T>(request: JsonRequest<T>): Promise<T> {
    this.requests.push(request as JsonRequest<unknown>);
    let problem = "no scripted reply";
    for (let attempt = 0; attempt < 3; attempt++) {
      const reply = this.replies.shift();
      if (reply === undefined) break;
      const outcome = checkReply(typeof reply === "string" ? reply : JSON.stringify(reply), request);
      if (outcome.ok) return outcome.data;
      problem = outcome.problem;
    }
    throw new AppError("llm_failed", problem);
  }
}

export function lines(count: number, prefix = "line"): string {
  return Array.from({ length: count }, (_, index) => `${prefix} ${index + 1}`).join("\n");
}
