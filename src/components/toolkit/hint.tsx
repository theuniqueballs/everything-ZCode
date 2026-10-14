'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** Small wrapper: tooltip below-trigger hint used across toolbar buttons. */
export function Hint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
