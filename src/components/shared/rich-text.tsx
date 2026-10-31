import { Fragment, type ReactNode } from "react";
import { RefMark } from "./marks";

const LINE_MENTION = /(第\s*(\d+)\s*(?:[-–—~至到]\s*(\d+)\s*)?行|lines?\s+(\d+)(?:\s*[-–—]\s*(\d+))?)/gi;

/** Line numbers a text names ("第 276 行", "lines 12–14"), in order of first mention. */
export function mentionedLines(text: string): number[] {
  const found: number[] = [];
  for (const match of text.matchAll(LINE_MENTION)) {
    const line = Number(match[2] ?? match[4]);
    if (Number.isFinite(line) && !found.includes(line)) found.push(line);
  }
  return found;
}

function withRefs(text: string, refs: number[] | undefined, keyBase: string): ReactNode[] {
  if (!refs?.length) return [text];
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINE_MENTION)) {
    const line = Number(match[2] ?? match[4]);
    const n = refs.indexOf(line) + 1;
    const end = (match.index ?? 0) + match[0].length;
    if (n > 0) {
      out.push(text.slice(last, end), <RefMark key={`${keyBase}-${end}`} n={n} className="mx-0.5 -translate-y-[0.35em]" />);
      last = end;
    }
  }
  out.push(text.slice(last));
  return out;
}

/**
 * Model text with `backticked` identifiers set as inline code, and line mentions tied to the
 * circled marks in the code. Nothing is ever parsed as HTML.
 */
export function RichText({ text, refs }: { text: string; refs?: number[] }) {
  const parts = text.split(/(`[^`\n]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
          <code key={index} className="bg-sunken px-1 py-px font-mono text-[0.84em] font-normal text-ink [overflow-wrap:anywhere]">
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={index}>{withRefs(part, refs, String(index))}</Fragment>
        ),
      )}
    </>
  );
}
