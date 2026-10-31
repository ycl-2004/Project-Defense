import { AppError } from "@/lib/errors";
import type { FileInfo, RepoRef } from "@/lib/domain";
import { refCandidates, rawFileUrl, type ParsedRepoUrl } from "./url";

type Fetch = typeof fetch;

/**
 * Reads public repositories with three API calls (repo, commit, tree) and fetches file bodies from
 * raw.githubusercontent.com, which is not counted against the REST rate limit.
 */
export class GitHubClient {
  private readonly fileCache = new Map<string, Promise<string>>();

  constructor(
    private readonly token?: string,
    private readonly fetchImpl: Fetch = fetch,
  ) {}

  async resolve(parsed: ParsedRepoUrl): Promise<RepoRef> {
    const repo = await this.api<{ default_branch: string; private: boolean }>(
      `/repos/${parsed.owner}/${parsed.repo}`,
    );
    if (repo.private) throw new AppError("repo_not_found", "private");

    if (parsed.refPath.length === 0) {
      const sha = await this.commitSha(parsed.owner, parsed.repo, repo.default_branch);
      if (!sha) throw new AppError("empty_repo", "no commits");
      return { owner: parsed.owner, repo: parsed.repo, ref: repo.default_branch, sha, subdir: "" };
    }

    for (const candidate of refCandidates(parsed)) {
      const sha = await this.commitSha(parsed.owner, parsed.repo, candidate.ref);
      if (sha) return { owner: parsed.owner, repo: parsed.repo, ref: candidate.ref, sha, subdir: candidate.subdir };
    }
    throw new AppError("repo_not_found", `ref ${parsed.refPath.join("/")}`);
  }

  /** All blobs at the pinned commit, repo-relative paths. */
  async tree(ref: RepoRef): Promise<FileInfo[]> {
    const body = await this.api<{ tree: { path: string; type: string; size?: number }[]; truncated: boolean }>(
      `/repos/${ref.owner}/${ref.repo}/git/trees/${ref.sha}?recursive=1`,
    );
    return body.tree
      .filter((entry) => entry.type === "blob")
      .map((entry) => ({ path: entry.path, size: entry.size ?? 0 }));
  }

  file(ref: RepoRef, path: string): Promise<string> {
    const key = `${ref.owner}/${ref.repo}@${ref.sha}:${path}`;
    let pending = this.fileCache.get(key);
    if (!pending) {
      pending = this.fetchRaw(rawFileUrl(ref, path));
      pending.catch(() => this.fileCache.delete(key));
      this.fileCache.set(key, pending);
    }
    return pending;
  }

  async files(ref: RepoRef, paths: string[]): Promise<Map<string, string>> {
    const bodies = await Promise.all(paths.map((path) => this.file(ref, path)));
    return new Map(paths.map((path, index) => [path, bodies[index]]));
  }

  private async commitSha(owner: string, repo: string, ref: string): Promise<string | undefined> {
    try {
      const commit = await this.api<{ sha: string }>(`/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`);
      return commit.sha;
    } catch (error) {
      if (error instanceof AppError && (error.code === "repo_not_found" || error.code === "empty_repo")) return undefined;
      throw error;
    }
  }

  /**
   * The core REST quota for the configured token (not counted against it). GitHub grants 5,000
   * requests per hour to a valid token and 60 without one; `rejected` means the token was refused.
   */
  async rateLimit(): Promise<{ limit: number; remaining: number; rejected: boolean }> {
    const response = await this.request("/rate_limit");
    if (response.status === 401) return { limit: 0, remaining: 0, rejected: true };
    if (!response.ok) throw new AppError("upstream", `github ${response.status} /rate_limit`);
    const body = (await response.json()) as { resources: { core: { limit: number; remaining: number } } };
    return { ...body.resources.core, rejected: false };
  }

  private async request(path: string): Promise<Response> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "project-defense",
    };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    try {
      return await this.fetchImpl(`https://api.github.com${path}`, { headers });
    } catch (error) {
      throw new AppError("upstream", `github fetch failed: ${String(error)}`);
    }
  }

  private async api<T>(path: string): Promise<T> {
    const response = await this.request(path);
    if (response.ok) return (await response.json()) as T;
    if (response.status === 404) throw new AppError("repo_not_found", path);
    if (response.status === 409) throw new AppError("empty_repo", path);
    if (response.status === 422) throw new AppError("repo_not_found", path);
    if (
      response.status === 429 ||
      (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0")
    ) {
      throw new AppError("rate_limited", path);
    }
    throw new AppError("upstream", `github ${response.status} ${path}`);
  }

  private async fetchRaw(url: string): Promise<string> {
    let response: Response;
    try {
      response = await this.fetchImpl(url);
    } catch (error) {
      throw new AppError("upstream", `raw fetch failed: ${String(error)}`);
    }
    if (!response.ok) throw new AppError("upstream", `raw ${response.status} ${url}`);
    return response.text();
  }
}
