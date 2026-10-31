import { LIMITS } from "@/lib/config";
import type { Citation, Snippet } from "@/lib/domain";

export type CitationCheck = { ok: true; snippet: Snippet } | { ok: false; reason: string };

export function splitLines(content: string): string[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

/**
 * Checks a model-proposed citation against the real file and cuts the snippet from it.
 * The code shown to students therefore always comes from the repository, never from the model.
 * Over-long ranges are trimmed to the first `maxSnippetLines` lines instead of being rejected.
 */
export function resolveCitation(citation: Citation, files: Map<string, string>): CitationCheck {
  const content = files.get(citation.path);
  if (content === undefined) return { ok: false, reason: `file "${citation.path}" is not in the provided files` };

  const lines = splitLines(content);
  const { startLine } = citation;
  if (startLine < 1 || startLine > lines.length) {
    return { ok: false, reason: `startLine ${startLine} is outside "${citation.path}" (1-${lines.length})` };
  }
  if (citation.endLine < startLine) {
    return { ok: false, reason: `endLine ${citation.endLine} is before startLine ${startLine}` };
  }
  const endLine = Math.min(citation.endLine, lines.length, startLine + LIMITS.maxSnippetLines - 1);
  const code = lines.slice(startLine - 1, endLine).join("\n");
  if (!code.trim()) return { ok: false, reason: `lines ${startLine}-${endLine} of "${citation.path}" are blank` };

  return { ok: true, snippet: { path: citation.path, startLine, endLine, code } };
}

/** Prefixes each line with its number, the format the model reads and cites from. */
export function numberLines(content: string): string {
  const lines = splitLines(content);
  const width = String(lines.length).length;
  return lines.map((line, index) => `${String(index + 1).padStart(width, " ")}| ${line}`).join("\n");
}
