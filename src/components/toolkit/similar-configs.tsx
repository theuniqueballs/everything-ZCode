'use client';

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
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
 * Rendered inside the preview header, desktop and mobile dialog.
 */
export function SimilarConfigs({
  current,
  all,
  onSelect,
  className,
}: {
  current: ToolkitItem;
  all: ToolkitItem[];
  onSelect: (path: string) => void;
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
          <Tooltip key={item.path} delayDuration={200}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onSelect(item.path)}
                className="group flex max-w-52 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-foreground focus-visible:border-primary"
              >
                <span className="min-w-0 truncate">{item.name}</span>
                <span
                  aria-label={`Похожесть ${Math.round(score * 100)}%`}
                  className="shrink-0 rounded-full bg-primary/10 px-1.5 py-px text-[9px] font-bold text-primary group-hover:bg-primary/20"
                >
                  {Math.min(99, Math.round(score * 100))}%
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-64 text-xs">
              <span className="line-clamp-2">{item.description}</span>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
