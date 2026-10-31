"use client";

import { Compass } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { EmptyState } from "@/components/shared/empty-state";
import { SiteHeader } from "@/components/shared/site-header";

export default function NotFound() {
  const { locale } = usePrefs();
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <EmptyState
        icon={<Compass className="size-5" />}
        title="404"
        body={locale === "zh" ? "这个页面不存在。" : "This page doesn't exist."}
        action={locale === "zh" ? "回到首页" : "Back to start"}
        href="/"
      />
    </div>
  );
}
