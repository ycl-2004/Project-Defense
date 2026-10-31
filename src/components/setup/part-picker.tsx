"use client";

import { Check, PencilLine } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { usePrefs } from "@/components/providers";
import { LIMITS } from "@/lib/config";
import type { Part } from "@/lib/domain";
import { cn } from "@/lib/utils";

export const CUSTOM_PART = "custom";

const itemClass =
  "group relative flex w-full gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition-[border-color,background-color,box-shadow] duration-150 hover:border-line-strong data-[state=checked]:border-brand data-[state=checked]:bg-brand-soft/35 data-[state=checked]:shadow-card sm:p-5";

function Indicator() {
  return (
    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-line-strong bg-surface transition-colors group-data-[state=checked]:border-brand group-data-[state=checked]:bg-brand">
      <Check className="size-3 text-on-brand opacity-0 transition-opacity group-data-[state=checked]:opacity-100" strokeWidth={3} />
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
    <RadioGroupPrimitive.Root
      value={value ?? ""}
      onValueChange={onChange}
      aria-label={t.setup.partTitle}
      className="flex flex-col gap-2.5"
    >
      {parts.map((part) => (
        <RadioGroupPrimitive.Item key={part.id} value={part.id} className={itemClass}>
          <Indicator />
          <span className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[16px] font-semibold leading-[1.45] text-ink">{part.title}</span>
            <span className="text-[14px] leading-[1.7] text-ink-2">{part.summary}</span>
            <span className="mt-1 flex flex-wrap items-center gap-1.5">
              {part.files.slice(0, 3).map((path) => (
                <span key={path} title={path} className="max-w-[14rem] truncate rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[11.5px] text-ink-2">
                  {baseName(path)}
                </span>
              ))}
              <span className="tabular text-[12px] text-ink-3">{f(t.setup.partFiles, { count: part.files.length })}</span>
            </span>
          </span>
        </RadioGroupPrimitive.Item>
      ))}

      <div className={cn("rounded-2xl transition-colors", value === CUSTOM_PART && "bg-brand-soft/35")}>
        <RadioGroupPrimitive.Item value={CUSTOM_PART} className={cn(itemClass, value === CUSTOM_PART && "rounded-b-none border-b-0 bg-transparent shadow-none")}>
          <Indicator />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex items-center gap-2 text-[16px] font-semibold text-ink">
              <PencilLine className="size-4 text-ink-2" />
              {t.setup.custom}
            </span>
            <span className="text-[14px] leading-[1.7] text-ink-2">{t.setup.customLead}</span>
          </span>
        </RadioGroupPrimitive.Item>
        {value === CUSTOM_PART && (
          <div className="rounded-b-2xl border border-t-0 border-brand px-4 pb-4 sm:px-5 sm:pb-5">
            <textarea
              autoFocus
              value={custom}
              onChange={(event) => onCustomChange(event.target.value.slice(0, LIMITS.maxCustomPartChars))}
              placeholder={t.setup.customPlaceholder}
              aria-label={t.setup.custom}
              rows={2}
              className="w-full resize-none rounded-xl border border-line-strong bg-surface px-3.5 py-3 text-[15px] leading-[1.6] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-3 focus:border-brand focus:ring-4 focus:ring-brand-soft"
            />
          </div>
        )}
      </div>
    </RadioGroupPrimitive.Root>
  );
}
