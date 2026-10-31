"use client";

import { ArrowRight, CornerDownRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePrefs } from "@/components/providers";
import { GitHubIcon } from "@/components/shared/github-icon";
import { SOURCE_URL } from "@/components/shared/site-header";
import { ProgressLine } from "@/components/shared/thinking";
import { api, errorCodeOf, type ClientErrorCode } from "@/lib/client/api";
import { useSession } from "@/lib/client/session-store";

/** The answer line of the spread: the student writes their repository on the rule, in ballpoint. */
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
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void analyze(url);
        }}
        className="flex flex-col gap-2"
      >
        <label htmlFor="repo-url" className="text-[13px] font-medium text-ink-2">
          {t.home.label}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex min-w-0 flex-1 items-center gap-3 border-b border-ink pb-1 transition-colors focus-within:border-ballpoint">
            <GitHubIcon className="size-[18px] shrink-0 text-ink-3" />
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
              className="h-11 min-w-0 flex-1 bg-transparent text-[17px] text-ballpoint outline-none disabled:opacity-60"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-ink px-6 text-[15px] font-medium text-paper transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending && <LoaderCircle className="size-4 animate-spin" strokeWidth={1.5} />}
            {pending ? t.home.submitting : t.home.submit}
            {!pending && <ArrowRight className="size-4" strokeWidth={1.5} />}
          </button>
        </div>
      </form>

      {pending ? (
        <div className="flex flex-col gap-2" aria-live="polite">
          <ProgressLine className="max-w-sm" />
          <p className="text-[13.5px] text-ink-2">{t.home.reading}</p>
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-pen">
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
        className="inline-flex w-fit items-center gap-2 text-[14.5px] text-ink underline decoration-pen decoration-1 underline-offset-[6px] transition-colors hover:text-pen disabled:opacity-50"
      >
        <CornerDownRight className="size-4 text-pen" strokeWidth={1.5} />
        {t.home.demo}
      </button>
    </div>
  );
}
