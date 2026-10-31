"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A ruled row of the student's choices: the chosen one is marked in their blue. Arrow keys move between options. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
  className?: string;
}) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onChange(next as T)}
      aria-label={label}
      orientation="horizontal"
      className={cn("grid auto-cols-fr grid-flow-col border border-rule-strong", className)}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className="flex h-11 items-center justify-center gap-2 border-l border-rule-strong px-3 text-[14.5px] text-ink-2 transition-colors first:border-l-0 hover:bg-sunken hover:text-ink data-[state=checked]:bg-ballpoint-wash data-[state=checked]:text-ballpoint data-[state=checked]:outline data-[state=checked]:outline-1 data-[state=checked]:-outline-offset-1 data-[state=checked]:outline-ballpoint"
        >
          {option.label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
