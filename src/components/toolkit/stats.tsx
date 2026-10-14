'use client';

import { motion } from 'framer-motion';
import { BarChart3, Trophy, FileCode2, Gauge } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeading } from './section-heading';
import { AnimatedCounter } from './animated-counter';
import { formatBytes } from '@/lib/frontmatter';
import type { ToolkitCatalog, ToolkitCategoryId } from '@/lib/toolkit-types';

const CATEGORY_LABELS: Record<ToolkitCategoryId, string> = {
  agents: 'Агенты',
  commands: 'Команды',
  skills: 'Скиллы',
  rules: 'Правила',
  hooks: 'Хуки',
  contexts: 'Контексты',
  settings: 'Настройки',
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * «Аналитика тулкита» — CSS-only charts computed from the catalog:
 * category distribution, top-5 largest configs and summary tiles.
 * Server-loaded catalog keeps it deterministic and SSR-friendly.
 */
export function ToolkitStats({ catalog }: { catalog: ToolkitCatalog | null }) {
  if (!catalog) return null;

  const categories = catalog.categories;
  const allItems = categories.flatMap((c) => c.items);

  const maxCount = Math.max(...categories.map((c) => c.items.length), 1);
  const maxLines = Math.max(...allItems.map((i) => i.lines), 1);

  const totalLines = allItems.reduce((sum, i) => sum + i.lines, 0);
  const totalBytes = allItems.reduce((sum, i) => sum + i.size, 0);
  const avgLines = Math.round(totalLines / Math.max(allItems.length, 1));

  const top5 = [...allItems].sort((a, b) => b.lines - a.lines).slice(0, 5);
  const biggest = [...categories].sort((a, b) => b.items.length - a.items.length)[0];

  const summary = [
    { icon: FileCode2, label: 'Всего строк', value: totalLines, suffix: '' },
    { icon: Gauge, label: 'Суммарный размер', value: totalBytes, suffix: '', isBytes: true },
    { icon: BarChart3, label: 'В среднем строк', value: avgLines, suffix: '' },
  ] as const;

  return (
    <section id="stats" className="border-b border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          index="02"
          title="Аналитика тулкита"
          description="Распределение конфигов по категориям, крупнейшие файлы и агрегаты — вся статистика считается из фактического содержимого каталога."
        />

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Category distribution */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Конфиги по категориям
              </CardTitle>
              <CardDescription>Сколько конфигов в каждой из 7 категорий</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((cat, idx) => {
                const count = cat.items.length;
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={cat.id} className="group">
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-medium text-foreground/90 group-hover:text-foreground">
                        {CATEGORY_LABELS[cat.id]}
                      </span>
                      <span className="font-mono text-muted-foreground">{count}</span>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${CATEGORY_LABELS[cat.id]}: ${count} конфигов`}
                    >
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-emerald-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.9, ease: EASE, delay: idx * 0.06 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Top-5 largest */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-primary" />
                Топ-5 крупнейших
              </CardTitle>
              <CardDescription>Конфиги с наибольшим числом строк</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {top5.map((item, idx) => {
                const pct = Math.round((item.lines / maxLines) * 100);
                return (
                  <div key={item.path} className="group">
                    <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-baseline gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-primary">#{idx + 1}</span>
                        <span className="truncate font-mono font-semibold">{item.name}</span>
                      </span>
                      <span className="shrink-0 font-mono text-muted-foreground">{item.lines}</span>
                    </div>
                    <div
                      className="h-2.5 overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`${item.name}: ${item.lines} строк`}
                    >
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400/70 to-primary"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.9, ease: EASE, delay: idx * 0.08 }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Summary tiles */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {summary.map((tile) => (
            <Card key={tile.label} className="border-border/70">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <tile.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-xl font-bold">
                    {tile.isBytes ? (
                      formatBytes(tile.value)
                    ) : (
                      <>
                        <AnimatedCounter value={tile.value} />
                        {tile.suffix}
                      </>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{tile.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Самая наполненная категория —{' '}
          <span className="font-semibold text-foreground">{CATEGORY_LABELS[biggest.id]}</span> ({biggest.items.length}{' '}
          конфигов); медианный размер файла —{' '}
          <span className="font-semibold text-foreground">
            {allItems.map((i) => i.lines).sort((a, b) => a - b)[Math.floor(allItems.length / 2)]} строк
          </span>
          .
        </p>
      </div>
    </section>
  );
}
