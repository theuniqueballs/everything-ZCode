'use client';

import { Reveal } from './motion-primitives';

/**
 * Numbered section heading: mono index + gradient rule + title + description.
 * Keeps all four content sections visually consistent.
 */
export function SectionHeading({
  index,
  title,
  description,
  className,
}: {
  index: string;
  title: string;
  description: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={className ?? 'mb-8 max-w-2xl'}>
      <div className="flex items-center gap-3" aria-hidden>
        <span className="font-mono text-xs font-bold tracking-widest text-primary">{index}</span>
        <span className="h-px flex-1 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
      </div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{description}</p>
    </Reveal>
  );
}
