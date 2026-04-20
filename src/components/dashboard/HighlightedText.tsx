import React from 'react';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Renders a block of plain text, wrapping every occurrence of a `highlights`
 * phrase in a <mark>. Case-insensitive. Longer phrases take priority over
 * shorter overlapping ones.
 *
 * Keeps newlines (returned as <br />) so pre-wrap still looks correct inside
 * a regular <p>.
 */
export function HighlightedText({
  text,
  highlights,
  className,
  markClassName = 'bg-yellow-200 dark:bg-yellow-200/25 text-foreground px-0.5 rounded-[2px]',
}: {
  text: string;
  highlights: string[];
  className?: string;
  markClassName?: string;
}) {
  if (!text) return null;
  const clean = highlights
    .map(h => h.trim())
    .filter(h => h.length >= 2)
    .sort((a, b) => b.length - a.length);

  if (clean.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const pattern = new RegExp(
    `(${clean.map(escapeRegExp).join('|')})`,
    'gi'
  );

  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;
        const isMatch = clean.some(
          h => h.toLowerCase() === part.toLowerCase()
        );
        if (isMatch) {
          return (
            <mark key={i} className={markClassName}>
              {part}
            </mark>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}
