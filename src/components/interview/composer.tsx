"use client";

import { ArrowUp, Lightbulb, LoaderCircle, SkipForward } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { LIMITS } from "@/lib/config";
import { cn } from "@/lib/utils";

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
      className="rounded-3xl border border-line-strong bg-surface p-2 shadow-card transition-[border-color,box-shadow] duration-200 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand-soft"
      onSubmit={(event) => {
        event.preventDefault();
        if (ready) onSend();
      }}
    >
      <label htmlFor="answer" className="sr-only">
        {t.interview.answerLabel}
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
        className="block max-h-[36vh] min-h-[72px] w-full resize-none bg-transparent px-3 py-2.5 text-[15.5px] leading-[1.65] text-ink outline-none [field-sizing:content] placeholder:text-ink-3 disabled:opacity-60"
      />
      <div className="flex items-center gap-1 px-1 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onHint}
          disabled={!canHint || !!busy}
          className="h-9 gap-1.5 rounded-xl px-2.5 text-[13.5px] text-ink-2 hover:text-ink"
        >
          {busy === "hint" ? <LoaderCircle className="size-4 animate-spin" /> : <Lightbulb className="size-4" />}
          <span className={cn(compact && "sr-only sm:not-sr-only")}>{t.interview.hint}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSkip}
          disabled={!!busy}
          className="h-9 gap-1.5 rounded-xl px-2.5 text-[13.5px] text-ink-2 hover:text-ink"
        >
          <SkipForward className="size-4" />
          <span className={cn(compact && "sr-only sm:not-sr-only")}>{t.interview.skip}</span>
        </Button>
        <span className="ml-auto hidden text-[12px] text-ink-3 tabular md:inline">
          {value.length > LIMITS.maxAnswerChars * 0.8
            ? f(t.interview.charCount, { count: value.length, max: LIMITS.maxAnswerChars })
            : t.interview.sendShortcut}
        </span>
        <Button type="submit" disabled={!ready} className="ml-auto h-10 gap-1.5 rounded-xl px-4 text-[14.5px] hover:bg-brand-strong md:ml-2">
          {busy === "turn" ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          {t.interview.send}
        </Button>
      </div>
    </form>
  );
}
