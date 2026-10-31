import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title, body, action, href, icon }: { title: string; body: string; action: string; href: string; icon?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      {icon && <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-sunken text-ink-2">{icon}</div>}
      <h1 className="font-display text-[24px] font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-[15px] leading-[1.7] text-ink-2">{body}</p>
      <Button asChild className="mt-6 h-11 rounded-xl px-5">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:px-8" aria-hidden>
      <div className="h-8 w-1/3 animate-pulse rounded-lg bg-sunken" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-sunken" />
      <div className="mt-6 h-40 animate-pulse rounded-2xl bg-sunken" />
      <div className="h-40 animate-pulse rounded-2xl bg-sunken" />
    </div>
  );
}
