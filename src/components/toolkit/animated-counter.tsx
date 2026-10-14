'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Count-up number animation triggered on mount / value change.
 * Respects prefers-reduced-motion (jumps straight to the final value).
 */
export function AnimatedCounter({
  value,
  duration = 900,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const from = fromRef.current;
    fromRef.current = value;

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.textContent = String(value);
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = String(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {value}
    </span>
  );
}
