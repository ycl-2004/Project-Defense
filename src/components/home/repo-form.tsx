"use client";

import { ArrowRight, CornerDownRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePrefs } from "@/components/providers";
import { GitHubIcon } from "@/components/shared/github-icon";
import { SOURCE_URL } from "@/components/shared/site-header";
import { ProgressLine } from "@/components/shared/thinking";
import { Button } from "@/components/ui/button";
import { api, errorCodeOf, type ClientErrorCode } from "@/lib/client/api";
import { useSession } from "@/lib/client/session-store";

export function RepoForm() {
  const { t, locale } = usePrefs();
  const router = useRouter();
  const setAnalysis = useSession((state) => state.setAnalysis);
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ClientErrorCode | null>(null);

  async function analyze(target: string) {
    if (pending) return;
    if (!target.trim()) {
      document.getElementById("repo-url")?.focus();
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await api.analyze({ url: target.trim(), locale });
      setAnalysis({ url: target.trim(), ...result });
      router.push("/setup");
    } catch (caught) {
      setError(errorCodeOf(caught));
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void analyze(url);
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="repo-url" className="text-[13.5px] font-medium text-ink-2">
          {t.home.label}
        </label>
        <div className="flex flex-col gap-2 rounded-2xl border border-line-strong bg-surface p-2 shadow-card transition-[border-color,box-shadow] duration-200 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-soft sm:flex-row sm:items-center sm:pl-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 pl-2 sm:pl-0">
            <GitHubIcon className="size-5 shrink-0 text-ink-3" />
            <input
              id="repo-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.home.placeholder}
              autoComplete="off"
              spellCheck={false}
              inputMode="url"
              disabled={pending}
              aria-invalid={!!error}
              aria-describedby="repo-hint"
              className="h-12 min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3 disabled:opacity-60"
            />
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="h-12 rounded-xl px-5 text-[15px] font-medium hover:bg-brand-strong"
          >
            {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
            {pending ? t.home.submitting : t.home.submit}
            {!pending && <ArrowRight className="size-4" />}
          </Button>
        </div>
      </form>

      {pending ? (
        <div className="flex flex-col gap-2 pt-1" aria-live="polite">
          <ProgressLine className="max-w-sm" />
          <p className="text-[13.5px] text-ink-2">{t.home.reading}</p>
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-miss">
          <span>{t.errors[error]}</span>
          <button type="button" onClick={() => void analyze(url)} className="font-medium underline underline-offset-4">
            {t.common.retry}
          </button>
        </div>
      ) : (
        <p id="repo-hint" className="text-[13.5px] text-ink-3">
          {t.home.hint}
        </p>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setUrl(SOURCE_URL);
          void analyze(SOURCE_URL);
        }}
        className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg text-[14.5px] font-medium text-brand-ink transition-colors hover:text-brand disabled:opacity-50"
      >
        <CornerDownRight className="size-4" />
        {t.home.demo}
      </button>
    </div>
  );
}
