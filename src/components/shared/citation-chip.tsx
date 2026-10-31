"use client";

import { ArrowUpRight } from "lucide-react";
import { usePrefs } from "@/components/providers";
import type { Citation } from "@/lib/domain";
import { cn } from "@/lib/utils";

function baseName(path: string) {
  return path.slice(path.lastIndexOf("/") + 1);
}

/** "[ DictationCoordinator.swift · 第 273–301 行 ]" in red pen brackets. Clicking it brings the code to those lines. */
export function CitationChip({
  citation,
  href,
  onClick,
  className,
}: {
  citation: Citation;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const { t, f } = usePrefs();
  const range =
    citation.startLine === citation.endLine
      ? f(t.common.line, { start: citation.startLine })
      : f(t.common.lines, { start: citation.startLine, end: citation.endLine });
  const body = (
    <>
      <span className="text-pen" aria-hidden>
        [
      </span>
      <span className="min-w-0 truncate font-mono text-[12.5px] text-ink" title={citation.path}>
        {baseName(citation.path)}
      </span>
      <span className="shrink-0 text-[13px] text-ink-2 tabular">· {range}</span>
      <span className="text-pen" aria-hidden>
        ]
      </span>
      {href && <ArrowUpRight className="size-3.5 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />}
    </>
  );
  // The visible chip shows the file name; assistive tech gets the full path.
  const label = `${citation.path} · ${range}`;
  const classes = cn(
    "inline-flex h-7 max-w-full items-center gap-1.5 px-1 transition-colors",
    (href || onClick) && "hover:bg-pen-wash",
    className,
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes} title={t.common.openOnGitHub} aria-label={label}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} aria-label={label}>
        {body}
      </button>
    );
  }
  return <span className={classes}>{body}</span>;
}
