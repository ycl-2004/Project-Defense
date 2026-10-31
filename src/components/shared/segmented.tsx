"use client";

import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A row of mutually exclusive options. Arrow keys move between them (Radix radio group). */
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
      className={cn("grid auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-sunken p-1", className)}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          className="flex h-11 items-center justify-center gap-2 rounded-xl px-3 text-[14.5px] font-medium text-ink-2 transition-[background-color,color,box-shadow] duration-150 hover:text-ink data-[state=checked]:bg-surface data-[state=checked]:text-ink data-[state=checked]:shadow-card"
        >
          {option.label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
