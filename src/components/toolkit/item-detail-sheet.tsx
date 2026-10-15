'use client';

import { useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, FileCode2, Sparkles, Scale, Webhook, Layers, Boxes, ExternalLink } from 'lucide-react';
import { MarkdownViewer } from './markdown-viewer';
import { PreviewToc } from './preview-toc';
import { SimilarConfigs } from './similar-configs';
import { ItemActions, MetaBadges } from './item-actions';
import { Hint } from './hint';
import { useUiStore } from '@/lib/store';
import { useI18n, categoryLabelSingular } from '@/lib/i18n';
import { parseFrontmatter } from '@/lib/frontmatter';
import { useFavorites } from '@/hooks/use-favorites';
import { githubFileUrl } from '@/lib/env';
import type { ToolkitCategoryId, ToolkitItem } from '@/lib/toolkit-types';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<ToolkitCategoryId, typeof Bot> = {
  agents: Bot,
  commands: FileCode2,
  skills: Sparkles,
  rules: Scale,
  hooks: Webhook,
  contexts: Layers,
  settings: Boxes,
};

/**
 * Global slide-out detail sheet — the single readable surface for a config.
 *
 * Opened from anywhere (config of the day, catalog rows, command palette,
 * deep links) via `openDetail(path)` in the UI store. Below the `lg:`
 * breakpoint this is THE way to read a config; at `lg:` the catalog also
 * keeps its inline preview panel.
 */
export function ItemDetailSheet() {
  const { t, lang } = useI18n();
  const { detailPath, closeDetail, openCompare, catalog: storeCatalog } = useUiStore();
  const { isFavorite, toggle: toggleFavorite } = useFavorites();

  /* The catalog section shares its fetched catalog through the store; if the
     sheet is opened before that finished (rare), fetch the static JSON. */
  const catalog = storeCatalog;

  const item = useMemo<ToolkitItem | null>(
    () =>
      detailPath && catalog
        ? catalog.categories.flatMap((c) => c.items).find((i) => i.path === detailPath) ?? null
        : null,
    [detailPath, catalog],
  );

  const body = useMemo(() => (item ? parseFrontmatter(item.content).body : ''), [item]);

  /* Scroll the sheet body back to top when switching between configs. */
  useEffect(() => {
    document.getElementById('detail-sheet-scroll')?.scrollTo({ top: 0 });
  }, [detailPath]);

  const Icon = item ? CATEGORY_ICONS[item.category] : Boxes;

  return (
    <Sheet open={!!detailPath} onOpenChange={(open) => !open && closeDetail()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl lg:max-w-2xl"
      >
        {item ? (
          <>
            <SheetHeader className="shrink-0 space-y-3 border-b border-border bg-muted/30 p-5 text-left">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <Badge variant="outline" className="h-5 px-2 text-[10px] text-muted-foreground">
                  {categoryLabelSingular(item.category, lang)}
                </Badge>
                <Hint label={t('detail.viewOnGithub')}>
                  <a
                    href={githubFileUrl(item.path)}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                    GitHub
                  </a>
                </Hint>
              </div>
              <SheetTitle className="truncate pr-8 font-mono text-lg font-bold">
                {item.name}
              </SheetTitle>
              <SheetDescription className="mt-0.5 truncate font-mono text-xs">
                toolkit/{item.path}
              </SheetDescription>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <MetaBadges item={item} />
                <ItemActions
                  item={item}
                  isFavorite={isFavorite(item.path)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
              <SimilarConfigs
                current={item}
                all={catalog ? catalog.categories.flatMap((c) => c.items) : []}
                onSelect={(path) => {
                  /* keep the sheet open — just swap the content */
                  useUiStore.getState().openDetail(path);
                }}
                onCompare={(pathB) => openCompare(item.path, pathB)}
                className="mt-1"
              />
            </SheetHeader>
            <div
              id="detail-sheet-scroll"
              className={cn('flex-1 overflow-y-auto p-5 scrollbar-thin')}
            >
              <PreviewToc body={body} containerId="detail-sheet-scroll" />
              <MarkdownViewer content={body} />
            </div>
          </>
        ) : (
          /* Catalog still loading — skeleton keeps the sheet layout stable */
          <div className="flex h-full flex-col gap-4 p-5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-lg" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-2 flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="min-h-0 flex-1 rounded-lg" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
