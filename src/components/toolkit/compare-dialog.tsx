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
import { findSimilar } from '@/lib/similar';
import { useI18n } from '@/lib/i18n';
import type { ToolkitCategory, ToolkitItem } from '@/lib/toolkit-types';
import { cn } from '@/lib/utils';

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
  const { lang } = useI18n();
  return (
    <Select value={value ?? undefined} onValueChange={onChange}>
      <SelectTrigger aria-label={ariaLabel} className="h-10 min-w-0 flex-1 bg-card font-mono text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {categories.map((cat) => (
          <SelectGroup key={cat.id}>
            <SelectLabel className="text-[11px] text-muted-foreground">
              {lang === 'en' ? cat.labelEn : cat.label}
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
  const { t } = useI18n();
  const { compareOpen, setCompareOpen, compareInitPath, compareInitPathB, catalog } = useUiStore();
  const [pathA, setPathA] = useState<string | null>(null);
  const [pathB, setPathB] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = catalog?.categories ?? [];
  const allItems = useMemo(() => categories.flatMap((c) => c.items), [categories]);

  /*
   * Prefill from the store request each time the dialog opens.
   * With an explicit B (compare-from-chip) use it as-is; otherwise
   * auto-pick the most similar item as B — «сравнить с похожим» в один клик.
   */
  useEffect(() => {
    if (!compareOpen) return;
    setCopied(false);
    const base =
      compareInitPath && allItems.some((i) => i.path === compareInitPath)
        ? compareInitPath
        : null;
    const explicitB =
      compareInitPathB && compareInitPathB !== base && allItems.some((i) => i.path === compareInitPathB)
        ? compareInitPathB
        : null;
    setPathA(base);
    if (explicitB) {
      setPathB(explicitB);
    } else if (base) {
      const baseItem = allItems.find((i) => i.path === base);
      const similar = baseItem ? findSimilar(baseItem, allItems, 1) : [];
      setPathB(similar.length > 0 ? similar[0].item.path : null);
    } else {
      setPathB(null);
    }
  }, [compareOpen, compareInitPath, compareInitPathB, allItems]);

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
      toast.success(t('compare.toastCopied'));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t('compare.toastFailed'));
    }
  };

  return (
    <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="border-b border-border bg-muted/30 p-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <GitCompareArrows className="h-4 w-4 text-primary" />
            {t('compare.title')}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            {t('compare.desc')}
          </DialogDescription>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <ConfigSelect
              value={pathA}
              onChange={setPathA}
              categories={categories}
              placeholder={t('compare.phA')}
              ariaLabel={t('compare.ariaA')}
            />
            <Button
              variant="outline"
              size="icon"
              className="mx-auto h-8 w-8 shrink-0 sm:h-10 sm:w-10"
              aria-label={t('compare.swap')}
              title={t('compare.swapTitle')}
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
              placeholder={t('compare.phB')}
              ariaLabel={t('compare.ariaB')}
            />
          </div>

          {stats && itemA && itemB && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
                <Scale className="h-3 w-3" />
                {t('compare.similarity', { n: stats.similarity })}
              </Badge>
              <Badge className="gap-1 bg-emerald-500/15 font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                {t('compare.added', { n: stats.added })}
              </Badge>
              <Badge variant="destructive" className="gap-1 font-mono text-[10px]">
                {t('compare.removed', { n: stats.removed })}
              </Badge>
              <Button
                size="sm"
                variant={copied ? 'secondary' : 'outline'}
                className="ml-auto h-7 gap-1.5 px-2.5 text-xs"
                onClick={copyDiff}
              >
                {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                {copied ? t('compare.copied') : t('compare.copyDiff')}
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
                  ? t('compare.emptyBoth')
                  : !itemA
                    ? t('compare.emptyA')
                    : t('compare.emptyB')}
              </p>
            </div>
          ) : stats && stats.added + stats.removed === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
              <Check className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium">{t('compare.identical')}</p>
              <p className="text-xs text-muted-foreground">
                {t('compare.identicalDesc', { a: itemA.name, b: itemB.name })}
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
                  {t('compare.truncated', { n: MAX_ROWS, m: lines.length })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
