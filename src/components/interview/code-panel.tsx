"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { CodeView, type RailKey } from "@/components/shared/code-view";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFile } from "@/lib/client/use-file";
import type { RepoRef } from "@/lib/domain";
import { languageFromPath } from "@/lib/github/filter";
import { githubBlobUrl } from "@/lib/github/url";
import { cn } from "@/lib/utils";

export type CodeFocus = { path: string; startLine?: number; endLine?: number };

/** The whole cited file, the cited range bracketed on the centre rail and scrolled into view. */
export function CodePanel({
  repo,
  files,
  focus,
  onFocus,
  keys,
  refs,
  notes,
  className,
}: {
  repo: RepoRef;
  files: string[];
  focus: CodeFocus;
  onFocus: (focus: CodeFocus) => void;
  /** Rail keys for this file (question and follow-up keys). */
  keys: (RailKey & { path: string })[];
  /** Lines the current prompt names, for this file. */
  refs: number[];
  /** The mentor's margin notes for this file. */
  notes: { path: string; line: number; text: string }[];
  className?: string;
}) {
  const { t, f } = usePrefs();
  const file = useFile(repo, focus.path);
  const highlight = focus.startLine && focus.endLine ? { start: focus.startLine, end: focus.endLine } : undefined;
  const allFiles = files.includes(focus.path) ? files : [focus.path, ...files];
  const lang = languageFromPath(focus.path);

  return (
    <section className={cn("flex min-h-0 flex-col bg-surface", className)} aria-label={t.interview.code}>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-rule pl-4 pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex min-w-0 items-center gap-1.5 px-1 py-1 text-left transition-colors hover:bg-sunken">
            <span className="truncate font-mono text-[12.5px] text-ink">{focus.path}</span>
            <ChevronDown className="size-3.5 shrink-0 text-ink-3" strokeWidth={1.5} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[60vh] w-[min(30rem,90vw)] overflow-y-auto">
            <DropdownMenuLabel className="text-[12px] text-ink-3">{t.interview.files}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={focus.path} onValueChange={(path) => onFocus({ path })}>
              {allFiles.map((path) => (
                <DropdownMenuRadioItem key={path} value={path} className="font-mono text-[12.5px]">
                  {path}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <a
          href={githubBlobUrl(repo, focus.path, focus.startLine, focus.endLine)}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex shrink-0 items-center gap-1 px-2 py-1 text-[12.5px] text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
        >
          {t.common.openOnGitHub}
          <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
        </a>
      </div>

      {file.status === "ready" ? (
        <CodeView
          code={file.content}
          path={focus.path}
          highlight={highlight}
          refs={refs}
          rail={keys.filter((key) => key.path === focus.path)}
          notes={notes.filter((note) => note.path === focus.path)}
          wrap
          follow
          className="min-h-0 flex-1"
        />
      ) : file.status === "error" ? (
        <p className="p-6 text-[14px] text-ink-2">{t.interview.codeFailed}</p>
      ) : (
        <div className="flex flex-1 flex-col gap-3 p-5" aria-label={t.interview.loadingCode}>
          {[72, 48, 64, 36, 80, 52, 60, 30].map((width, index) => (
            <span key={index} className="h-2.5 animate-pulse bg-sunken" style={{ width: `${width}%` }} />
          ))}
        </div>
      )}

      <div className="flex h-9 shrink-0 items-center justify-between border-t border-rule px-4 text-[13px] text-ink-3">
        <span className="apparatus text-[16px]">{lang}</span>
        {highlight && (
          <span className="tabular text-pen">{f(t.interview.citedRange, { start: highlight.start, end: highlight.end })}</span>
        )}
      </div>
    </section>
  );
}
