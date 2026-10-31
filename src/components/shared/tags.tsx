"use client";

import { CircleAlert, CircleCheck, CircleDashed, CircleMinus, type LucideIcon } from "lucide-react";
import { usePrefs } from "@/components/providers";
import { DIFFICULTIES, type Difficulty, type Layer, type Rating } from "@/lib/domain";
import { cn } from "@/lib/utils";

/** Difficulty as filled dots (●○○ / ●●○ / ●●●) plus its name, so it never relies on colour. */
export function DifficultyTag({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const { t } = usePrefs();
  const level = DIFFICULTIES.indexOf(difficulty) + 1;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-2", className)}>
      <span className="flex gap-[3px]" aria-hidden>
        {DIFFICULTIES.map((_, index) => (
          <span key={index} className={cn("size-[7px] rounded-full", index < level ? "bg-brand" : "bg-line-strong")} />
        ))}
      </span>
      {t.difficulty[difficulty].name}
    </span>
  );
}

export function LayerTag({ layer, index, className }: { layer: Layer; index?: number; className?: string }) {
  const { t } = usePrefs();
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full bg-sunken px-2.5 text-[12.5px] font-medium text-ink-2",
        className,
      )}
    >
      {index !== undefined && <span className="tabular text-ink-3">{index}</span>}
      {t.layer[layer].name}
    </span>
  );
}

export const RATING_STYLE: Record<Rating, { icon: LucideIcon; text: string; soft: string; mark: string }> = {
  clear: { icon: CircleCheck, text: "text-clear", soft: "bg-clear-soft", mark: "bg-clear-mark" },
  partial: { icon: CircleDashed, text: "text-partial", soft: "bg-partial-soft", mark: "bg-partial-mark" },
  misconception: { icon: CircleAlert, text: "text-miss", soft: "bg-miss-soft", mark: "bg-miss-mark" },
  unanswered: { icon: CircleMinus, text: "text-blank", soft: "bg-blank-soft", mark: "bg-blank-mark" },
};

export function RatingBadge({ rating, className }: { rating: Rating; className?: string }) {
  const { t } = usePrefs();
  const style = RATING_STYLE[rating];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium",
        style.soft,
        style.text,
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
      {t.rating[rating]}
    </span>
  );
}
