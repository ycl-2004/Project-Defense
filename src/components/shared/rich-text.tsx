import { Fragment } from "react";

/**
 * Model text with `backticked` identifiers rendered as inline code. Everything else stays plain
 * text, so no model output is ever interpreted as HTML.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`\n]+`)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.length > 2 && part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={index}
            className="rounded-md bg-sunken px-1.5 py-px font-mono text-[0.84em] font-medium text-ink [overflow-wrap:anywhere]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
