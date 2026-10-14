'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, Bot, Boxes, FileCode2, Sparkles, Scale, Webhook, Layers } from 'lucide-react';
import { AnimatedCounter } from './animated-counter';
import type { ToolkitCatalog } from '@/lib/toolkit-types';

const CATEGORY_ICONS = {
  agents: Bot,
  commands: FileCode2,
  skills: Sparkles,
  rules: Scale,
  hooks: Webhook,
  contexts: Layers,
  settings: Boxes,
} as const;

/** Above-the-fold entrance: fade+up, sequential small delays. */
const enter = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay },
});

export function ToolkitHero({ catalog }: { catalog: ToolkitCatalog | null }) {
  const categories = catalog?.categories ?? [];
  const total = catalog?.totalItems ?? 45;

  return (
    <section id="top" className="hero-grid relative overflow-hidden border-b border-border/60">
      {/* glow accents */}
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-primary blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div {...enter(0)}>
            <Badge variant="outline" className="mb-5 inline-flex max-w-full gap-1.5 whitespace-normal border-primary/40 bg-primary/10 px-3 py-1 text-center text-xs font-medium leading-snug text-primary">
              <Sparkles className="h-3 w-3 shrink-0" />
              Вдохновлено everything-claude-code · Собрано для Z.ai
            </Badge>
          </motion.div>

          <motion.div {...enter(0.08)}>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Everything{' '}
              <span className="bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent">
                ZCode
              </span>
            </h1>
          </motion.div>

          <motion.div {...enter(0.16)}>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Полная коллекция production-ready конфигов для ZCode / Z.ai:{' '}
              <span className="text-foreground">агенты, команды, скиллы, правила, хуки</span> —
              выработанные в реальной разработке с моделями GLM. Копируй, адаптируй, используй.
            </p>
          </motion.div>

          <motion.div {...enter(0.24)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="h-11 gap-2 px-6" asChild>
              <a href="#catalog">
                Смотреть каталог
                <ArrowDown className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="h-11 px-6" asChild>
              <a href="#install">Установка</a>
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          {...enter(0.32)}
          className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7"
        >
          {categories.length > 0
            ? categories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.id];
                return (
                  <a
                    key={cat.id}
                    href="#catalog"
                    className="group rounded-xl border border-border/70 bg-card/60 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
                  >
                    <Icon className="mx-auto mb-2 h-5 w-5 text-primary transition-transform group-hover:scale-110" />
                    <div className="text-2xl font-bold">
                      <AnimatedCounter value={cat.items.length} />
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{cat.label}</div>
                  </a>
                );
              })
            : Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/70 bg-card/60 p-4">
                  <Skeleton className="mx-auto mb-2 h-5 w-5" />
                  <Skeleton className="mx-auto h-7 w-10" />
                  <Skeleton className="mx-auto mt-1.5 h-3 w-14" />
                </div>
              ))}
        </motion.div>

        <motion.p {...enter(0.4)} className="mt-4 text-center text-xs text-muted-foreground">
          {catalog ? (
            <>
              <AnimatedCounter value={total} /> файлов · 7 категорий · MIT license
            </>
          ) : (
            'Загрузка каталога…'
          )}
        </motion.p>
      </div>
    </section>
  );
}
