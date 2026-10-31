"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { ThemedToken } from "shiki/core";
import { highlightLines } from "@/lib/client/highlight";
import { languageFromPath } from "@/lib/github/filter";
import { splitLines } from "@/lib/interview/citations";
import { cn } from "@/lib/utils";
import { RefMark } from "./marks";

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

/** A key on the centre rail, pinned to one line. */
export type RailKey = { line: number; label: string; filled?: boolean };

export type CodeViewProps = {
  code: string;
  path: string;
  /** Line number of the first line of `code` (snippets start in the middle of a file). */
  firstLine?: number;
  /** Absolute line numbers the current question cites: washed, bracketed on the rail. */
  highlight?: { start: number; end: number };
  /** Lines the question names, underlined in red pen and numbered ①②… in order. */
  refs?: number[];
  /** Draw the centre rail (keys, detents, the bracket) at the right edge. */
  rail?: RailKey[] | true;
  /** The mentor's margin notes, written beside their lines past the rail. */
  notes?: { line: number; text: string }[];
  wrap?: boolean;
  /** Scroll the cited lines into view whenever they change. */
  follow?: boolean;
  className?: string;
};

/**
 * Line-numbered code with the mentor's marks. Plain text renders first so nothing shifts when
 * colours arrive. The rail sticks to the right edge, so it stays put while long lines scroll.
 */
export function CodeView({ code, path, firstLine = 1, highlight, refs = [], rail, notes = [], wrap, follow, className }: CodeViewProps) {
  const lines = useMemo(() => splitLines(code), [code]);
  const tokens = useTokens(code, languageFromPath(path));
  const scroller = useRef<HTMLDivElement>(null);
  const gutter = `${String(firstLine + lines.length - 1).length + 2.6}ch`;
  const keys = rail === true ? [] : (rail ?? []);
  const showRail = !!rail || notes.length > 0;
  // The rail is 56px; a note gutter of 112px joins it only when the mentor wrote a note.
  const railWidth = notes.length > 0 ? "168px" : "56px";
  const refIndex = new Map(refs.map((line, index) => [line, index + 1]));

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
      className={cn("relative overflow-auto overscroll-contain bg-surface font-mono text-[12.5px] leading-[22px] text-ink", className)}
    >
      <div
        className={cn("grid py-3", wrap ? "w-full" : "min-w-max")}
        style={{ gridTemplateColumns: `${gutter} minmax(0, 1fr)${showRail ? ` ${railWidth}` : ""}` }}
      >
        {lines.map((line, index) => {
          const number = firstLine + index;
          const marked = !!highlight && number >= highlight.start && number <= highlight.end;
          const ref = refIndex.get(number);
          const key = keys.find((candidate) => candidate.line === number);
          const isStart = highlight?.start === number;
          const isEnd = highlight?.end === number;
          const note = notes.find((candidate) => candidate.line === number);
          // Wrapped lines hang under their own indentation, not under the gutter.
          const indent = wrap ? (line.match(/^[\t ]*/)?.[0].replace(/\t/g, "  ").length ?? 0) : 0;
          return (
            <Fragment key={number}>
              <span
                data-line={number}
                aria-hidden
                className={cn(
                  "select-none pr-4 text-right tabular",
                  marked ? "animate-mark-in bg-pen-wash font-medium text-pen" : "text-ink-3",
                )}
              >
                {number}
              </span>
              <span
                className={cn("pr-6", marked && "animate-mark-in bg-pen-wash", wrap ? "whitespace-pre-wrap break-words" : "whitespace-pre")}
                style={indent ? { paddingLeft: `${indent}ch`, textIndent: `-${indent}ch` } : undefined}
              >
                <span className={cn(ref && "underline decoration-pen decoration-[1.5px] underline-offset-[5px]")}>
                  {tokens?.[index]
                    ? tokens[index].map((token, tokenIndex) => (
                        <span key={tokenIndex} className="shiki-token" style={token.htmlStyle as React.CSSProperties}>
                          {token.content}
                        </span>
                      ))
                    : line || " "}
                </span>
                {ref && <RefMark n={ref} className="ml-2 align-[-2px]" />}
              </span>
              {showRail && (
                <span className="sticky right-0 border-l border-rule bg-surface" aria-hidden>
                  <span className="relative block h-full">
                    {marked && (
                      <span
                        className={cn(
                          "absolute left-[11px] w-px bg-pen",
                          isStart ? "top-1/2 bottom-0" : isEnd ? "top-0 bottom-1/2" : "inset-y-0",
                          isStart && isEnd && "hidden",
                        )}
                      />
                    )}
                    {(isStart || isEnd) && (
                      <span className="absolute left-[8px] top-1/2 size-[7px] -translate-y-1/2 border border-pen bg-surface" />
                    )}
                    {key && (
                      <span
                        className={cn(
                          "absolute left-[22px] top-1/2 -translate-y-1/2 whitespace-nowrap border px-1 font-sans text-[11px] leading-[16px] tabular",
                          key.filled ? "border-pen bg-pen text-paper" : "border-pen bg-surface text-pen",
                        )}
                      >
                        {key.label}
                      </span>
                    )}
                    {ref && !key && <RefMark n={ref} className="absolute left-[22px] top-1/2 -translate-y-1/2" />}
                    {note && (
                      <>
                        <span className="absolute left-[44px] top-[11px] h-px w-[10px] bg-pen" />
                        <span className="absolute left-[58px] right-1.5 top-[2px] font-hand text-[14px] leading-[18px] text-pen">{note.text}</span>
                      </>
                    )}
                  </span>
                </span>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
