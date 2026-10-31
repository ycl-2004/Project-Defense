"use client";

import { ArrowUpRight, FileCode2 } from "lucide-react";
import { usePrefs } from "@/components/providers";
import type { Citation } from "@/lib/domain";
import { cn } from "@/lib/utils";

/** "src/app/page.tsx · lines 12–30". Clicking it brings the code panel to those lines. */
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
      <FileCode2 className="size-3.5 shrink-0 text-brand" aria-hidden />
      <span className="min-w-0 truncate font-mono text-[12px] text-ink">{citation.path}</span>
      <span className="shrink-0 text-[12px] text-ink-3">· {range}</span>
      {href && <ArrowUpRight className="size-3.5 shrink-0 text-ink-3" aria-hidden />}
    </>
  );
  const classes = cn(
    "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 transition-colors duration-150",
    (href || onClick) && "hover:border-line-strong hover:bg-sunken",
    className,
  );
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes} title={t.common.openOnGitHub}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {body}
      </button>
    );
  }
  return <span className={classes}>{body}</span>;
}
