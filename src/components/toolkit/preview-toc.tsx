'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ListTree } from 'lucide-react';
import { extractToc } from '@/lib/toc';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Collapsible table of contents for the config preview.
 * Tracks the active heading with an IntersectionObserver rooted
 * at the preview scroll container.
 */
export function PreviewToc({ body, containerId }: { body: string; containerId: string }) {
  const { t } = useI18n();
  const entries = useMemo(() => extractToc(body), [body]);
  const [open, setOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (entries.length === 0) return;
    const container = document.getElementById(containerId);
    if (!container) return;

    /* Deterministic active-heading tracking: the last heading whose top
       crossed the container's reading line becomes active. */
    let raf = 0;
    const update = () => {
      raf = 0;
      const containerTop = container.getBoundingClientRect().top;
      let current: string | null = null;
      for (const e of entries) {
        /* Attribute selector instead of `#id`: heading ids may start with a
           digit (e.g. «1. External memory» → #1-external-memory), which is
           valid HTML but an INVALID CSS selector — `#1-…` throws a
           SyntaxError and crashed the whole page (the «config of the day»
           → open → crash report). */
        const head = container.querySelector(`[id="${e.id}"]`);
        if (!head) continue;
        const rel = head.getBoundingClientRect().top - containerTop;
        if (rel <= 32) current = e.id;
        else break;
      }
      setActiveId(current ?? entries[0]?.id ?? null);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [entries, containerId]);

  if (entries.length < 2) return null;

  const scrollTo = (id: string) => {
    const container = document.getElementById(containerId);
    const head = container?.querySelector(`[id="${id}"]`);
    if (!container || !head) return;
    const delta = head.getBoundingClientRect().top - container.getBoundingClientRect().top;
    container.scrollTo({ top: container.scrollTop + delta - 8, behavior: 'smooth' });
  };

  return (
    <div className="mb-4 rounded-lg border border-border/70 bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ListTree className="h-3.5 w-3.5 text-primary" />
        {t('toc.title', { n: entries.length })}
        <ChevronDown
          className={cn('ml-auto h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <nav aria-label={t('toc.nav')} className="border-t border-border/60 px-1.5 py-1.5">
          <ul className="space-y-0.5">
            {entries.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(e.id)}
                  className={cn(
                    'block w-full truncate rounded px-2 py-1 text-left text-xs transition-colors',
                    e.depth === 3 && 'pl-5',
                    activeId === e.id
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {e.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
