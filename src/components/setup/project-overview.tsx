"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePrefs } from "@/components/providers";
import { GitHubIcon } from "@/components/shared/github-icon";
import type { Analysis } from "@/lib/client/session-store";

/** The exercise book's title page: repo, name, one-liner, stack, summary, and an apparatus line. */
export function ProjectOverview({ analysis }: { analysis: Analysis }) {
  const { t, f } = usePrefs();
  const { repo, overview } = analysis;
  const repoUrl = `https://github.com/${repo.owner}/${repo.repo}/tree/${repo.sha}${repo.subdir ? `/${repo.subdir}` : ""}`;

  return (
    <aside className="flex flex-col gap-5">
      <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-[13.5px] text-ink-2 underline decoration-rule-strong underline-offset-[6px] hover:text-ink hover:decoration-ink">
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        {t.setup.otherRepo}
      </Link>
      <div className="border border-rule-strong p-5 sm:p-6">
        <a href={repoUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-2 text-[13px] text-ink-2 hover:text-ink">
          <GitHubIcon className="size-4 shrink-0" />
          <span className="truncate font-mono">
            {repo.owner}/{repo.repo}
            {repo.subdir ? `/${repo.subdir}` : ""}
          </span>
        </a>
        <h1 className="mt-4 font-serif text-[32px] font-semibold leading-[1.2] text-ink">{overview.name}</h1>
        <p className="mt-3 text-[16px] leading-[1.7] text-ink">{overview.oneLiner}</p>
        {overview.stack.length > 0 && (
          <ul className="mt-4 flex flex-wrap items-center gap-y-1 text-[13px] text-ink-2">
            {overview.stack.map((item) => (
              <li key={item} className="border-l border-rule-strong px-3 first:border-l-0 first:pl-0">
                {item}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 line-clamp-3 text-[14px] leading-[1.8] text-ink-2 lg:line-clamp-none">{overview.summary}</p>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-rule pt-3 text-[12.5px] text-ink-3">
          <span className="font-mono">
            {repo.ref} · {repo.sha.slice(0, 7)}
          </span>
          <span className="tabular">{f(t.setup.files, { count: analysis.fileCount })}</span>
        </div>
      </div>
    </aside>
  );
}
