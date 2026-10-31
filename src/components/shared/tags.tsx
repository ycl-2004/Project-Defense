"use client";

import { usePrefs } from "@/components/providers";
import { DIFFICULTIES, type Difficulty, type Layer, type Rating } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { PenMark } from "./marks";

/** Difficulty as one to three filled squares plus its name, so it never relies on colour. */
export function DifficultyTag({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const { t } = usePrefs();
  const level = DIFFICULTIES.indexOf(difficulty) + 1;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] text-ink-2", className)}>
      <span className="flex gap-[3px]" aria-hidden>
        {DIFFICULTIES.map((_, index) => (
          <span key={index} className={cn("size-[7px] border border-current", index < level ? "bg-current" : "bg-transparent opacity-40")} />
        ))}
      </span>
      {t.difficulty[difficulty].name}
    </span>
  );
}

export function LayerTag({ layer, className }: { layer: Layer; className?: string }) {
  const { t } = usePrefs();
  return <span className={cn("inline-flex items-center text-[13px] text-ink-2", className)}>{t.layer[layer].name}</span>;
}

export function RatingBadge({ rating, className }: { rating: Rating; className?: string }) {
  const { t } = usePrefs();
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[13.5px] font-medium text-ink", className)}>
      <PenMark rating={rating} />
      {t.rating[rating]}
    </span>
  );
}
