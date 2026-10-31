"use client";

import { LoaderCircle } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { LIMITS } from "@/lib/config";
import { cn } from "@/lib/utils";

const LINE = 28;

/** A ruled writing field: the student's words go down in ballpoint blue on the book's rules. */
export function Composer({
  value,
  onChange,
  onSend,
  onHint,
  onSkip,
  busy,
  canHint,
  compact,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onHint: () => void;
  onSkip: () => void;
  busy: "turn" | "hint" | null;
  canHint: boolean;
  compact?: boolean;
}) {
  const { t, f } = usePrefs();
  const ready = value.trim().length > 0 && !busy;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSend();
      }}
    >
      <label htmlFor="answer" className="flex items-baseline justify-between text-[13px] text-ink-2">
        <span className="font-medium">{t.interview.answerLabel}</span>
        {value.length > LIMITS.maxAnswerChars * 0.8 && (
          <span className="tabular">{f(t.interview.charCount, { count: value.length, max: LIMITS.maxAnswerChars })}</span>
        )}
      </label>
      <textarea
        id="answer"
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, LIMITS.maxAnswerChars))}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            if (ready) onSend();
          }
        }}
        placeholder={compact ? t.interview.answerPlaceholderMobile : t.interview.answerPlaceholder}
        disabled={busy === "turn"}
        rows={compact ? 2 : 3}
        className="block max-h-[34vh] w-full resize-none border-y border-rule-strong bg-surface px-1 text-[16px] text-ballpoint outline-none transition-colors [field-sizing:content] focus:border-ballpoint disabled:opacity-60"
        style={{
          lineHeight: `${LINE}px`,
          minHeight: LINE * (compact ? 2 : 3) + 2,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 1}px, var(--rule) ${LINE - 1}px, var(--rule) ${LINE}px)`,
          backgroundAttachment: "local",
        }}
      />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onHint}
          disabled={!canHint || !!busy}
          className="inline-flex h-9 items-center gap-1.5 px-2 text-[14px] text-ink-2 underline decoration-rule-strong underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink disabled:opacity-40"
        >
          {busy === "hint" && <LoaderCircle className="size-4 animate-spin" strokeWidth={1.5} />}
          {t.interview.hint}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={!!busy}
          className={cn(
            "inline-flex h-9 items-center px-2 text-[14px] text-ink-2 underline decoration-rule-strong underline-offset-[6px] transition-colors hover:text-ink hover:decoration-ink disabled:opacity-40",
          )}
        >
          {t.interview.skip}
        </button>
        <span className="ml-auto hidden pr-3 text-[13px] text-ink-3 md:inline">{t.interview.sendShortcut}</span>
        <button
          type="submit"
          disabled={!ready}
          className="ml-auto inline-flex h-10 items-center gap-2 bg-ink px-5 text-[14.5px] font-medium text-paper transition-opacity hover:opacity-90 disabled:border disabled:border-rule-strong disabled:bg-paper disabled:text-ink-2 md:ml-0"
        >
          {busy === "turn" && <LoaderCircle className="size-4 animate-spin" strokeWidth={1.5} />}
          {t.interview.send}
        </button>
      </div>
    </form>
  );
}
