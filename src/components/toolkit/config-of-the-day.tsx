'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUiStore } from '@/lib/store';
import { useI18n, categoryLabelSingular } from '@/lib/i18n';
import type { ToolkitCategoryId } from '@/lib/toolkit-types';

/**
 * Plain-data snapshot of the daily config, computed on the server.
 * Keeps the client payload small (no markdown content).
 */
export interface DailyItem {
  path: string;
  name: string;
  title: string;
  description: string;
  category: ToolkitCategoryId;
  lines: number;
}

/**
 * «Конфиг дня» — deterministic pick based on the Europe/Moscow calendar date.
 * Same day ⇒ same config for every visitor; changes at midnight MSK.
 * The server passes the MSK date as ISO (YYYY-MM-DD); the label is formatted
 * client-side in the active UI language.
 */
export function ConfigOfTheDay({ item, dateISO }: { item: DailyItem | null; dateISO: string }) {
  const { lang, t } = useI18n();
  const setRequestPath = useUiStore((s) => s.setRequestPath);

  const dateLabel = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Moscow',
  }).format(new Date(`${dateISO}T12:00:00Z`));

  if (!item) return null;

  const open = () => {
    setRequestPath(item.path);
    document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section aria-label={t('day.aria')} className="border-b border-border/60 bg-primary/[0.04]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="group flex flex-col gap-3 rounded-xl border border-primary/25 bg-card/80 p-4 shadow-sm transition-all hover:border-primary/45 hover:shadow-md sm:flex-row sm:items-center sm:gap-5"
        >
          {/* Label cluster */}
          <div className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/12 text-primary transition-transform group-hover:scale-105">
              <CalendarDays className="h-4.5 w-4.5" />
            </span>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" />
                {t('day.badge')}
              </div>
              <div className="text-[11px] text-muted-foreground">{dateLabel}</div>
            </div>
          </div>

          {/* Item info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-semibold">{item.name}</span>
              <Badge variant="outline" className="h-5 px-2 text-[10px] text-muted-foreground">
                {categoryLabelSingular(item.category, lang)}
              </Badge>
              <span className="text-[11px] text-muted-foreground">{t('day.lines', { n: item.lines })}</span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground" title={item.description}>
              {item.title && item.title !== item.name ? item.title : item.description}
            </p>
          </div>

          {/* Action */}
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 gap-1.5 border-primary/40 hover:bg-primary/10 hover:text-primary"
            onClick={open}
          >
            {t('day.open')}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
