'use client';

import { useMemo } from 'react';

const MIN_QUERY_LEN = 2;

/**
 * Case-insensitive query highlighting for catalog search results.
 * Renders matched substrings as <mark> with an emerald tint.
 *
 * Issue #11: unused helpers `isHighlightActive` / `highlightWrap` removed —
 * they were exported but never imported anywhere.
 */
export function Highlight({ text, query, className }: { text: string; query: string; className?: string }) {
  const parts = useMemo(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY_LEN) return null;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.split(new RegExp(`(${escaped})`, 'ig'));
  }, [text, query]);

  if (!parts) return <span className={className}>{text}</span>;

  return (
    <span className={className}>
      {parts.map((part, i) =>
        // With a capture group, odd indices are exact matches of the query.
        i % 2 === 1 ? (
          <mark key={i} className="rounded-[3px] bg-primary/20 px-0.5 text-primary">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}
