import { AppError } from "@/lib/errors";

export type ParsedRepoUrl = {
  owner: string;
  repo: string;
  /**
   * Path segments after `/tree/` or `/blob/`. A branch name may itself contain slashes,
   * so the split between ref and sub-directory is resolved later against the GitHub API.
   */
  refPath: string[];
  /** True when the URL pointed at a file (`/blob/`), whose last segment is not a directory. */
  pointsAtFile: boolean;
};

const NAME = /^[A-Za-z0-9_.-]+$/;

/**
 * Accepts `https://github.com/o/r`, `github.com/o/r.git`, `o/r`,
 * and `.../tree/<ref>/<dir>` or `.../blob/<ref>/<file>` links.
 */
export function parseRepoUrl(input: string): ParsedRepoUrl {
  const raw = input.trim();
  if (!raw) throw new AppError("invalid_url", "empty");

  let path: string;
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(raw)) {
    path = raw;
  } else {
    let url: URL;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      throw new AppError("invalid_url", raw);
    }
    const host = url.hostname.toLowerCase();
    if (host !== "github.com" && host !== "www.github.com") {
      throw new AppError("invalid_url", `host ${host}`);
    }
    path = url.pathname;
  }

  const segments = path
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
  if (segments.length < 2) throw new AppError("invalid_url", "missing owner/repo");

  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/i, "");
  if (!NAME.test(owner) || !NAME.test(repo)) throw new AppError("invalid_url", "bad name");

  const kind = segments[2];
  if (kind === "tree" || kind === "blob") {
    const refPath = segments.slice(3);
    if (refPath.length === 0) throw new AppError("invalid_url", "missing ref");
    return { owner, repo, refPath, pointsAtFile: kind === "blob" };
  }
  return { owner, repo, refPath: [], pointsAtFile: false };
}

/**
 * Every way to split `refPath` into (ref, subdir), shortest ref first.
 * For a `/blob/` link the last segment is a file, so it never becomes part of the subdir.
 */
export function refCandidates(parsed: ParsedRepoUrl): { ref: string; subdir: string }[] {
  const { refPath, pointsAtFile } = parsed;
  const dirSegments = pointsAtFile ? refPath.slice(0, -1) : refPath;
  const candidates: { ref: string; subdir: string }[] = [];
  const maxRefLength = pointsAtFile ? refPath.length - 1 : refPath.length;
  for (let length = 1; length <= Math.max(1, maxRefLength); length++) {
    candidates.push({
      ref: refPath.slice(0, length).join("/"),
      subdir: dirSegments.slice(length).join("/"),
    });
  }
  return candidates;
}

export function githubBlobUrl(
  ref: { owner: string; repo: string; sha: string },
  path: string,
  startLine?: number,
  endLine?: number,
): string {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const lines =
    startLine === undefined ? "" : endLine && endLine !== startLine ? `#L${startLine}-L${endLine}` : `#L${startLine}`;
  return `https://github.com/${ref.owner}/${ref.repo}/blob/${ref.sha}/${encodedPath}${lines}`;
}

export function rawFileUrl(ref: { owner: string; repo: string; sha: string }, path: string): string {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${ref.sha}/${encodedPath}`;
}
