"use client";

import { ArrowUpRight, ChevronDown, FileCode2 } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { CodeView } from "@/components/shared/code-view";
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
import { githubBlobUrl } from "@/lib/github/url";
import { cn } from "@/lib/utils";

export type CodeFocus = { path: string; startLine?: number; endLine?: number };

/** The whole file the current question is about, with the cited lines marked and scrolled into view. */
export function CodePanel({
  repo,
  files,
  focus,
  onFocus,
  className,
}: {
  repo: RepoRef;
  files: string[];
  focus: CodeFocus;
  onFocus: (focus: CodeFocus) => void;
  className?: string;
}) {
  const { t } = usePrefs();
  const file = useFile(repo, focus.path);
  const highlight = focus.startLine && focus.endLine ? { start: focus.startLine, end: focus.endLine } : undefined;
  const allFiles = files.includes(focus.path) ? files : [focus.path, ...files];

  return (
    <section className={cn("flex min-h-0 flex-col overflow-hidden rounded-3xl border border-line bg-code-bg", className)} aria-label={t.interview.code}>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3 pl-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex min-w-0 items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-sunken">
            <FileCode2 className="size-4 shrink-0 text-brand" />
            <span className="truncate font-mono text-[12.5px] text-ink">{focus.path}</span>
            <ChevronDown className="size-3.5 shrink-0 text-ink-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[60vh] w-[min(28rem,90vw)] overflow-y-auto rounded-xl">
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
          className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
        >
          GitHub
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>

      {file.status === "ready" ? (
        <CodeView code={file.content} path={focus.path} highlight={highlight} follow className="min-h-0 flex-1" />
      ) : file.status === "error" ? (
        <p className="p-6 text-[14px] text-ink-2">{t.interview.codeFailed}</p>
      ) : (
        <div className="flex flex-col gap-2.5 p-5" aria-label={t.interview.loadingCode}>
          {[72, 48, 64, 36, 80, 52, 60, 30].map((width, index) => (
            <span key={index} className="h-3 animate-pulse rounded bg-sunken" style={{ width: `${width}%` }} />
          ))}
        </div>
      )}
    </section>
  );
}
