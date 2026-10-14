'use client';

import { useMemo } from 'react';
import { Sparkles, GitCompareArrows } from 'lucide-react';
import { findSimilar } from '@/lib/similar';
import type { ToolkitItem } from '@/lib/toolkit-types';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * «Похожие конфиги» — clickable chips of the top-N most similar items
 * (Jaccard over name/title/description + same-category bonus).
 * Each chip opens the config; the trailing diff icon opens compare
 * with the current config as A and that chip's config as B.
 */
export function SimilarConfigs({
  current,
  all,
  onSelect,
  onCompare,
  className,
}: {
  current: ToolkitItem;
  all: ToolkitItem[];
  onSelect: (path: string) => void;
  /** Open diff: current ↔ chip item (optional affordance). */
  onCompare?: (pathB: string) => void;
  className?: string;
}) {
  const similar = useMemo(() => findSimilar(current, all, 3), [current, all]);

  if (similar.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Похожие:
        </span>
        {similar.map(({ item, score }) => (
          <span
            key={item.path}
            className="group flex max-w-56 items-center overflow-hidden rounded-full border border-border bg-card text-[11px] transition-all focus-within:border-primary hover:border-primary/50"
          >
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelect(item.path)}
                  className="flex min-w-0 items-center gap-1.5 py-1 pl-2.5 pr-1.5 font-mono text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
                >
                  <span className="min-w-0 truncate">{item.name}</span>
                  <span
                    aria-label={`Похожесть ${Math.round(score * 100)}%`}
                    className="shrink-0 rounded-full bg-primary/10 px-1.5 py-px text-[9px] font-bold text-primary transition-colors group-hover:bg-primary/20"
                  >
                    {Math.min(99, Math.round(score * 100))}%
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-64 text-xs">
                <span className="line-clamp-2">{item.description}</span>
              </TooltipContent>
            </Tooltip>
            {onCompare && (
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Сравнить ${current.name} и ${item.name}`}
                    title={`Diff: ${current.name} ↔ ${item.name}`}
                    onClick={() => onCompare(item.path)}
                    className="flex h-full shrink-0 items-center border-l border-border py-1 pl-1.5 pr-2 text-muted-foreground/60 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:text-primary"
                  >
                    <GitCompareArrows className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Diff: {current.name} ↔ {item.name}
                </TooltipContent>
              </Tooltip>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
