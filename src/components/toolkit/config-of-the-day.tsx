'use client';

import { useMemo, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hint } from './hint';
import {
  CalendarDays,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '@/lib/store';
import { useI18n, categoryLabelSingular } from '@/lib/i18n';
import { shiftDateISO, pickForDate, relativeDayKind } from '@/lib/daily';
import type { DailyItem } from '@/lib/daily';

export type { DailyItem };

/** Hard navigation limit so the carousel stays in a sane range (±1 year). */
const MAX_OFFSET = 365;

/**
 * «Конфиг дня» — deterministic pick based on the Europe/Moscow calendar date.
 * Same day ⇒ same config for every visitor; changes at midnight MSK.
 * The server passes today's pick for instant SSR paint plus the full slim
 * item list so the client can browse neighbouring days with ←/→ controls —
 * the pick for any date is recomputed with the same hash on both sides.
 */
export function ConfigOfTheDay({
  initialItem,
  dateISO,
  items,
}: {
  initialItem: DailyItem | null;
  dateISO: string;
  items: DailyItem[];
}) {
  const { lang, t } = useI18n();
  const setRequestPath = useUiStore((s) => s.setRequestPath);
  const [offset, setOffset] = useState(0);

  const activeDateISO = useMemo(() => shiftDateISO(dateISO, offset), [dateISO, offset]);

  /** SSR-safe pick: at offset 0 this equals the server-computed initialItem. */
  const item = useMemo(() => {
    if (!items || items.length === 0) return null;
    return pickForDate(items, activeDateISO) ?? initialItem;
  }, [items, activeDateISO, initialItem]);

  const go = useCallback((delta: number) => {
    setOffset((prev) => Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, prev + delta)));
  }, []);

  /** ←/→ anywhere inside the section navigates neighbouring days. */
  const onSectionKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
    },
    [go],
  );

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
        timeZone: 'Europe/Moscow',
      }).format(new Date(`${activeDateISO}T12:00:00Z`)),
    [activeDateISO, lang],
  );

  const relativeLabel = useMemo(() => {
    const kind = relativeDayKind(offset);
    if (kind === 'today') return t('day.rel.today');
    if (kind === 'yesterday') return t('day.rel.yesterday');
    if (kind === 'tomorrow') return t('day.rel.tomorrow');
    const n = Math.abs(offset);
    return kind === 'past'
      ? t('day.rel.ago', { n })
      : t('day.rel.in', { n });
  }, [offset, t]);

  const open = useCallback(
    (path: string) => {
      setRequestPath(path);
      document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' });
    },
    [setRequestPath],
  );

  if (!items || items.length === 0 || (!item && offset === 0)) return null;
  if (!item) return null;

  const isToday = offset === 0;

  return (
    <section
      aria-label={t('day.aria')}
      onKeyDown={onSectionKeyDown}
      className="border-b border-border/60 bg-primary/[0.04]"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="group relative flex flex-col gap-3 overflow-hidden rounded-xl border border-primary/25 bg-card/80 shadow-sm transition-all hover:border-primary/45 hover:shadow-md sm:flex-row sm:items-center sm:gap-5">
          {/* Decorative gradient wash (pure CSS, pointer-events-none) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_180%_at_100%_0%,--alpha(var(--color-primary)/8%)_0%,transparent_55%)]"
          />

          {/* Label cluster + day navigation */}
          <div className="flex shrink-0 items-center gap-2.5 p-4 sm:p-0 sm:pl-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary transition-transform group-hover:scale-105">
              <CalendarDays className="h-4.5 w-4.5" />
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                {t('day.badge')}
              </div>
              {/* Day navigation: ← date →, with relative label */}
              <div className="mt-0.5 flex items-center gap-0.5">
                <Hint label={t('day.prevDay')}>
                  <button
                    type="button"
                    aria-label={t('day.prevDay')}
                    onClick={() => go(-1)}
                    disabled={offset <= -MAX_OFFSET}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </Hint>
                <span className="min-w-[5.5rem] text-center text-[11px] tabular-nums text-muted-foreground">
                  {dateLabel}
                </span>
                <Hint label={t('day.nextDay')}>
                  <button
                    type="button"
                    aria-label={t('day.nextDay')}
                    onClick={() => go(1)}
                    disabled={offset >= MAX_OFFSET}
                    className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-30"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </Hint>
                <AnimatePresence>
                  {!isToday && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8, width: 0 }}
                      animate={{ opacity: 1, scale: 1, width: 'auto' }}
                      exit={{ opacity: 0, scale: 0.8, width: 0 }}
                      className="overflow-hidden"
                    >
                      <Hint label={t('day.backToToday')}>
                        <button
                          type="button"
                          aria-label={t('day.backToToday')}
                          onClick={() => setOffset(0)}
                          className="ml-0.5 flex h-5 w-5 items-center justify-center rounded text-primary/80 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      </Hint>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-0.5 text-[11px] font-medium text-primary/80">
                {relativeLabel}
              </div>
            </div>
          </div>

          {/* Item info (animated on date change) */}
          <div className="min-w-0 flex-1 pr-4 sm:pr-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeDateISO}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="flex min-w-0 flex-col gap-0.5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-mono text-sm font-semibold">{item.name}</span>
                  <Badge variant="outline" className="h-5 px-2 text-[10px] text-muted-foreground">
                    {categoryLabelSingular(item.category, lang)}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{t('day.lines', { n: item.lines })}</span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground" title={item.description}>
                  {item.title && item.title !== item.name ? item.title : item.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action */}
          <div className="flex shrink-0 items-center gap-1.5 p-4 sm:p-0 sm:pr-4">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/40 hover:bg-primary/10 hover:text-primary"
              onClick={() => open(item.path)}
            >
              {t('day.open')}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
