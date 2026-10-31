"use client";

import { ArrowLeft, GitCommitHorizontal } from "lucide-react";
import Link from "next/link";
import { usePrefs } from "@/components/providers";
import { GitHubIcon } from "@/components/shared/github-icon";
import type { Analysis } from "@/lib/client/session-store";

export function ProjectOverview({ analysis }: { analysis: Analysis }) {
  const { t, f } = usePrefs();
  const { repo, overview } = analysis;
  const repoUrl = `https://github.com/${repo.owner}/${repo.repo}/tree/${repo.sha}${repo.subdir ? `/${repo.subdir}` : ""}`;

  return (
    <aside className="flex flex-col gap-5">
      <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-[13.5px] font-medium text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" />
        {t.setup.otherRepo}
      </Link>
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
        <a
          href={repoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-2 text-[13px] text-ink-2 hover:text-ink"
        >
          <GitHubIcon className="size-4 shrink-0" />
          <span className="truncate font-mono">
            {repo.owner}/{repo.repo}
            {repo.subdir ? `/${repo.subdir}` : ""}
          </span>
        </a>
        <h1 className="mt-3 font-display text-[26px] font-semibold leading-[1.2] text-ink">{overview.name}</h1>
        <p className="mt-2 text-[15px] leading-[1.7] text-ink">{overview.oneLiner}</p>
        {overview.stack.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {overview.stack.map((item) => (
              <li key={item} className="rounded-full bg-sunken px-2.5 py-1 text-[12.5px] font-medium text-ink-2">
                {item}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 line-clamp-3 text-[14px] leading-[1.75] text-ink-2 lg:line-clamp-none">{overview.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4 text-[12.5px] text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <GitCommitHorizontal className="size-3.5" />
            <span className="font-mono">
              {repo.ref} · {repo.sha.slice(0, 7)}
            </span>
          </span>
          <span className="tabular">{f(t.setup.files, { count: analysis.fileCount })}</span>
        </div>
      </div>
    </aside>
  );
}
