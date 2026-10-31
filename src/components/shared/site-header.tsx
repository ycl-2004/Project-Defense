"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { usePrefs } from "@/components/providers";
import { cn } from "@/lib/utils";
import { GitHubIcon } from "./github-icon";
import { LocaleToggle, ThemeToggle } from "./preference-controls";

export const SOURCE_URL = "https://github.com/ycl-2004/Project-Defense";

/** The running head: one rule under the wordmark, page furniture on the right. */
export function SiteHeader({
  children,
  center,
  className,
  wide,
}: {
  children?: ReactNode;
  center?: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  const { t } = usePrefs();
  return (
    <header className={cn("no-print relative z-30 border-b border-rule-strong bg-paper", className)}>
      <div className={cn("mx-auto flex h-14 items-center gap-4 px-5 sm:px-8", wide ? "max-w-none" : "max-w-6xl")}>
        <Link href="/" className="shrink-0" aria-label={t.brand.name}>
          <Wordmark name={t.brand.name} latin={t.brand.latin} />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-center">{center}</div>
        <div className="flex shrink-0 items-center gap-0.5">
          {children}
          <LocaleToggle />
          <ThemeToggle />
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t.brand.source}
            className="grid size-8 place-items-center text-ink-2 transition-colors hover:bg-sunken hover:text-ink"
          >
            <GitHubIcon className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}

/** A quiet text control for the running head. */
export function HeadControl({ children, className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 px-2 text-[13.5px] text-ink-2 transition-colors hover:bg-sunken hover:text-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
