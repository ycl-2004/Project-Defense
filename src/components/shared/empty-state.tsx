import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({ title, body, action, href, icon }: { title: string; body: string; action: string; href: string; icon?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-6 py-24 text-center">
      {icon && <div className="mb-5 grid size-11 place-items-center border border-rule-strong text-ink-2">{icon}</div>}
      <h1 className="font-serif text-[26px] font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-[15px] leading-[1.75] text-ink-2">{body}</p>
      <Link href={href} className="mt-7 inline-flex h-11 items-center bg-ink px-5 text-[15px] font-medium text-paper transition-opacity hover:opacity-90">
        {action}
      </Link>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-10 sm:px-8" aria-hidden>
      <div className="h-8 w-1/3 animate-pulse bg-sunken" />
      <div className="h-4 w-2/3 animate-pulse bg-sunken" />
      <div className="mt-6 h-40 animate-pulse bg-sunken" />
      <div className="h-40 animate-pulse bg-sunken" />
    </div>
  );
}
