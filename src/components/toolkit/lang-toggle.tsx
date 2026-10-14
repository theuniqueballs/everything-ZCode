'use client';

import { motion } from 'framer-motion';
import { LANGS, useI18n, type Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Segmented RU/EN switcher with a sliding motion pill.
 * Persists the choice to localStorage (via useI18n) and
 * keeps <html lang> in sync.
 */
export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  const pick = (next: Lang) => {
    if (next !== lang) setLang(next);
  };

  return (
    <div
      role="group"
      aria-label={t('aria.toggleLang')}
      className={cn(
        'relative flex h-8 shrink-0 items-center rounded-lg border border-border bg-card/60 p-0.5',
        className
      )}
    >
      {LANGS.map((l) => {
        const active = l.id === lang;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => pick(l.id)}
            aria-pressed={active}
            title={l.full}
            className={cn(
              'relative z-10 h-7 rounded-md px-2 font-mono text-[11px] font-bold tracking-wide transition-colors duration-200',
              active ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId="lang-pill"
                className="absolute inset-0 -z-10 rounded-md bg-primary shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
