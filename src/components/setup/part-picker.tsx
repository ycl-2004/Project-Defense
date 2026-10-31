"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { usePrefs } from "@/components/providers";
import { LIMITS } from "@/lib/config";
import type { Part } from "@/lib/domain";
import { cn } from "@/lib/utils";

export const CUSTOM_PART = "custom";

const LINE = 28;

// Rows overlap by one pixel so neighbouring rules collapse into one; the checked row sits above and shows its ink frame.
const itemClass =
  "group relative -mb-px flex w-full gap-4 border border-x-transparent border-rule px-3 py-4 text-left transition-colors hover:bg-sunken/60 data-[state=checked]:z-10 data-[state=checked]:border-ballpoint data-[state=checked]:bg-ballpoint-wash sm:px-4";

/** Hairline square; checked = the student's own blue tick, drawn as SVG. */
function Detent() {
  return (
    <span className="mt-[3px] grid size-[18px] shrink-0 place-items-center border border-rule-strong bg-surface group-data-[state=checked]:border-ballpoint group-data-[state=checked]:bg-ballpoint">
      <svg viewBox="0 0 12 12" aria-hidden className="size-3 opacity-0 group-data-[state=checked]:opacity-100">
        <path d="M2.2 6.3 4.9 9 9.8 3.2" fill="none" stroke="var(--paper)" strokeWidth="1.5" strokeLinecap="square" />
      </svg>
    </span>
  );
}

function baseName(path: string) {
  return path.slice(path.lastIndexOf("/") + 1);
}

export function PartPicker({
  parts,
  value,
  onChange,
  custom,
  onCustomChange,
}: {
  parts: Part[];
  value: string | null;
  onChange: (value: string) => void;
  custom: string;
  onCustomChange: (value: string) => void;
}) {
  const { t, f } = usePrefs();
  return (
    <RadioGroupPrimitive.Root value={value ?? ""} onValueChange={onChange} aria-label={t.setup.partTitle} className="flex flex-col pb-px">
      {parts.map((part) => (
        <RadioGroupPrimitive.Item key={part.id} value={part.id} className={itemClass}>
          <Detent />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-[16px] font-medium leading-[1.5] text-ink">{part.title}</span>
            <span className="text-[14px] leading-[1.7] text-ink-2">{part.summary}</span>
            <span className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[12px] text-ink-3">
              <span className="min-w-0 break-all font-mono" title={part.files.join("\n")}>
                {part.files.slice(0, 3).map(baseName).join(" · ")}
              </span>
              <span className="tabular shrink-0">{f(t.setup.partFiles, { count: part.files.length })}</span>
            </span>
          </span>
        </RadioGroupPrimitive.Item>
      ))}

      <RadioGroupPrimitive.Item value={CUSTOM_PART} className={cn(itemClass, "flex-col gap-0")}>
        <span className="flex gap-4">
          <Detent />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-[16px] font-medium leading-[1.5] text-ink">{t.setup.custom}</span>
            <span className="text-[14px] leading-[1.7] text-ink-2">{t.setup.customLead}</span>
          </span>
        </span>
      </RadioGroupPrimitive.Item>
      {value === CUSTOM_PART && (
        <div className="relative z-10 -mb-px border border-t-0 border-ballpoint bg-ballpoint-wash px-3 pb-4 pt-1 sm:px-4 sm:pl-[calc(1rem+18px+1rem)]">
          <textarea
            autoFocus
            value={custom}
            onChange={(event) => onCustomChange(event.target.value.slice(0, LIMITS.maxCustomPartChars))}
            placeholder={t.setup.customPlaceholder}
            aria-label={t.setup.custom}
            rows={3}
            className="block w-full resize-none border-y border-rule-strong bg-surface px-1 text-[16px] text-ballpoint outline-none transition-colors placeholder:text-ink-3 focus:border-ballpoint"
            style={{
              lineHeight: `${LINE}px`,
              minHeight: LINE * 3 + 2,
              backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${LINE - 1}px, var(--rule) ${LINE - 1}px, var(--rule) ${LINE}px)`,
              backgroundAttachment: "local",
            }}
          />
        </div>
      )}
    </RadioGroupPrimitive.Root>
  );
}
