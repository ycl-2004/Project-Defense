"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { usePrefs } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "./github-icon";
import { LocaleToggle, ThemeToggle } from "./preference-controls";
import { cn } from "@/lib/utils";

export const SOURCE_URL = "https://github.com/ycl-2004/Project-Defense";

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
    <header className={cn("no-print relative z-30", className)}>
      <div className={cn("mx-auto flex h-16 items-center gap-3 px-5 sm:px-8", wide ? "max-w-none" : "max-w-6xl")}>
        <Link href="/" className="shrink-0 rounded-xl" aria-label={t.brand.name}>
          <Wordmark name={t.brand.name} latin={t.brand.latin} />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-center">{center}</div>
        <div className="flex shrink-0 items-center gap-1">
          {children}
          <LocaleToggle />
          <ThemeToggle />
          <Button asChild variant="ghost" size="icon" className="size-9 rounded-full text-ink-2 hover:text-ink">
            <a href={SOURCE_URL} target="_blank" rel="noreferrer" aria-label={t.brand.source}>
              <GitHubIcon className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
