'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ArrowRightLeft, Copy, Check, Scale, GitCompareArrows } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/lib/store';
import { parseFrontmatter } from '@/lib/frontmatter';
import { diffLines, diffStats, formatUnifiedDiff } from '@/lib/diff';
import type { ToolkitCategory, ToolkitItem } from '@/lib/toolkit-types';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  agents: 'Агенты',
  commands: 'Команды',
  skills: 'Скиллы',
  rules: 'Правила',
  hooks: 'Хуки',
  contexts: 'Контексты',
  settings: 'Настройки',
};

/** Render cap — configs are small, but stay defensive. */
const MAX_ROWS = 1500;

function ConfigSelect({
  value,
  onChange,
  categories,
  placeholder,
  ariaLabel,
}: {
  value: string | null;
  onChange: (path: string) => void;
  categories: ToolkitCategory[];
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger aria-label={ariaLabel} className="h-10 min-w-0 flex-1 bg-card font-mono text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {categories.map((cat) => (
          <SelectGroup key={cat.id}>
            <SelectLabel className="text-[11px] text-muted-foreground">
              {CATEGORY_LABELS[cat.id] ?? cat.label}
            </SelectLabel>
            {cat.items.map((item) => (
              <SelectItem key={item.path} value={item.path} className="font-mono text-xs">
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Compare mode: unified diff between any two toolkit configs.
 * Diff runs on frontmatter-stripped bodies so only real content counts.
 */
export function CompareDialog() {
  const { compareOpen, setCompareOpen, compareInitPath, catalog } = useUiStore();
  const [pathA, setPathA] = useState<string | null>(null);
  const [pathB, setPathB] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = catalog?.categories ?? [];
  const allItems = useMemo(() => categories.flatMap((c) => c.items), [categories]);

  /* Prefill A from the store request each time the dialog opens. */
  useEffect(() => {
    if (!compareOpen) return;
    setCopied(false);
    setPathA(compareInitPath && allItems.some((i) => i.path === compareInitPath) ? compareInitPath : null);
    setPathB(null);
  }, [compareOpen, compareInitPath, allItems]);

  const itemA = allItems.find((i) => i.path === pathA) ?? null;
  const itemB = allItems.find((i) => i.path === pathB) ?? null;

  const bodyA = itemA ? parseFrontmatter(itemA.content).body : '';
  const bodyB = itemB ? parseFrontmatter(itemB.content).body : '';

  const { lines, stats } = useMemo(() => {
    if (!itemA || !itemB) return { lines: [], stats: null };
    const l = diffLines(bodyA, bodyB);
    return { lines: l, stats: diffStats(l, bodyA, bodyB) };
  }, [itemA, itemB, bodyA, bodyB]);

  const visible = lines.slice(0, MAX_ROWS);

  const copyDiff = async () => {
    if (!itemA || !itemB) return;
    try {
      await navigator.clipboard.writeText(formatUnifiedDiff(itemA.path, itemB.path, lines));
      setCopied(true);
      toast.success('Diff скопирован в буфер обмена');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Не удалось скопировать diff');
    }
  };

  return (
    <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="border-b border-border bg-muted/30 p-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <GitCompareArrows className="h-4 w-4 text-primary" />
            Сравнение конфигов
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            Unified diff по содержимому (frontmatter не учитывается). Выберите два конфига.
          </DialogDescription>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <ConfigSelect
              value={pathA}
              onChange={setPathA}
              categories={categories}
              placeholder="Конфиг A (база)"
              ariaLabel="Конфиг A — база сравнения"
            />
            <Button
              variant="outline"
              size="icon"
              className="mx-auto h-8 w-8 shrink-0 sm:h-10 sm:w-10"
              aria-label="Поменять A и B местами"
              title="Поменять местами"
              onClick={() => {
                setPathA(pathB);
                setPathB(pathA);
              }}
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </Button>
            <ConfigSelect
              value={pathB}
              onChange={setPathB}
              categories={categories}
              placeholder="Конфиг B (сравнение)"
              ariaLabel="Конфиг B — с чем сравнивать"
            />
          </div>

          {stats && itemA && itemB && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
                <Scale className="h-3 w-3" />
                похожесть {stats.similarity}%
              </Badge>
              <Badge className="gap-1 bg-emerald-500/15 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                +{stats.added} добавлено
              </Badge>
              <Badge variant="destructive" className="gap-1 font-mono text-[10px]">
                −{stats.removed} удалено
              </Badge>
              <Button
                size="sm"
                variant={copied ? 'secondary' : 'outline'}
                className="ml-auto h-7 gap-1.5 px-2.5 text-xs"
                onClick={copyDiff}
              >
                {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Скопировано' : 'Копировать diff'}
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-thin" id="compare-scroll">
          {!itemA || !itemB ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              <GitCompareArrows className="h-8 w-8 text-muted-foreground/40" />
              <p className="max-w-xs text-sm text-muted-foreground">
                {!itemA && !itemB
                  ? 'Выберите два конфига для сравнения.'
                  : !itemA
                    ? 'Выберите конфиг A — базу сравнения.'
                    : 'Выберите конфиг B — с чем сравнивать.'}
              </p>
            </div>
          ) : stats && stats.added + stats.removed === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              <Check className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium">Конфиги идентичны по содержимому</p>
              <p className="text-xs text-muted-foreground">
                {itemA.name} и {itemB.name} различаются только frontmatter/метаданными
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border font-mono text-[11px] leading-relaxed">
              {visible.map((line, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex min-w-0 gap-2 px-2 py-[1px]',
                    line.type === 'add' && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                    line.type === 'remove' && 'bg-red-500/10 text-red-700 dark:text-red-300',
                    line.type === 'same' && 'text-muted-foreground'
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'w-3 shrink-0 select-none text-center font-bold',
                      line.type === 'add' && 'text-emerald-500',
                      line.type === 'remove' && 'text-red-500'
                    )}
                  >
                    {line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}
                  </span>
                  <span className="min-w-0 whitespace-pre-wrap break-words">{line.text || ' '}</span>
                </div>
              ))}
              {lines.length > MAX_ROWS && (
                <div className="border-t border-border px-2 py-1.5 text-center text-muted-foreground">
                  … показано {MAX_ROWS} из {lines.length} строк
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Type re-export convenience for tests/tooling. */
export type { ToolkitItem as CompareItem };
