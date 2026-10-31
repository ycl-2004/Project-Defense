"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ThemedToken } from "shiki/core";
import { highlightLines } from "@/lib/client/highlight";
import { languageFromPath } from "@/lib/github/filter";
import { splitLines } from "@/lib/interview/citations";
import { cn } from "@/lib/utils";

function useTokens(code: string, lang: string): ThemedToken[][] | null {
  const key = `${lang}\u0000${code}`;
  const [result, setResult] = useState<{ key: string; tokens: ThemedToken[][] | null }>();
  useEffect(() => {
    let alive = true;
    highlightLines(code, lang)
      .then((tokens) => alive && setResult({ key, tokens }))
      .catch(() => alive && setResult({ key, tokens: null }));
    return () => {
      alive = false;
    };
  }, [code, lang, key]);
  return result?.key === key ? result.tokens : null;
}

export type CodeViewProps = {
  code: string;
  path: string;
  /** Line number of the first line of `code` (snippets start in the middle of a file). */
  firstLine?: number;
  /** Absolute line numbers to mark. */
  highlight?: { start: number; end: number };
  wrap?: boolean;
  /** Scroll the marked lines into view whenever they change. */
  follow?: boolean;
  className?: string;
};

/**
 * Line-numbered code with Shiki colours. Plain text renders first, so nothing shifts when the
 * colours arrive. Marked lines get a full-width wash, never a side bar.
 */
export function CodeView({ code, path, firstLine = 1, highlight, wrap, follow, className }: CodeViewProps) {
  const lines = useMemo(() => splitLines(code), [code]);
  const tokens = useTokens(code, languageFromPath(path));
  const scroller = useRef<HTMLDivElement>(null);
  const gutter = `${String(firstLine + lines.length - 1).length + 2.4}ch`;

  useEffect(() => {
    if (!follow || !highlight || !scroller.current) return;
    const container = scroller.current;
    const target = container.querySelector<HTMLElement>(`[data-line="${highlight.start}"]`);
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    container.scrollTo({ top: Math.max(0, target.offsetTop - container.clientHeight / 4), behavior: reduce ? "auto" : "smooth" });
  }, [follow, highlight?.start, highlight, code]);

  return (
    <div
      ref={scroller}
      className={cn("relative overflow-auto overscroll-contain font-mono text-[12.5px] leading-[1.75] text-ink", className)}
    >
      <div className={cn("py-3", wrap ? "w-full" : "min-w-max")}>
        {lines.map((line, index) => {
          const number = firstLine + index;
          const marked = !!highlight && number >= highlight.start && number <= highlight.end;
          return (
            <div
              key={number}
              data-line={number}
              className={cn("grid pr-5", marked && "animate-mark-in bg-code-mark")}
              style={{ gridTemplateColumns: `${gutter} minmax(0, 1fr)` }}
            >
              <span
                aria-hidden
                className={cn("select-none pr-4 text-right tabular", marked ? "font-medium text-brand-ink" : "text-ink-3/80")}
              >
                {number}
              </span>
              <span className={wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"}>
                {tokens?.[index]
                  ? tokens[index].map((token, tokenIndex) => (
                      <span key={tokenIndex} className="shiki-token" style={token.htmlStyle as React.CSSProperties}>
                        {token.content}
                      </span>
                    ))
                  : line || " "}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
