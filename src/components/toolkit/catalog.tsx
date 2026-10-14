'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Bot,
  FileCode2,
  Sparkles,
  Scale,
  Webhook,
  Layers,
  Boxes,
  Search,
  Copy,
  Check,
  Download,
  X,
  FileText,
  Cpu,
  Wrench,
  SearchX,
  Star,
  Shuffle,
  CopyPlus,
  Keyboard,
  Link2,
  History,
  FileArchive,
  GitCompareArrows,
  Braces,
  FileUp,
  MousePointerClick,
} from 'lucide-react';
import { MarkdownViewer } from './markdown-viewer';
import { PreviewToc } from './preview-toc';
import { Highlight } from './highlight';
import { SectionHeading } from './section-heading';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { parseFrontmatter, formatBytes } from '@/lib/frontmatter';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavorites } from '@/hooks/use-favorites';
import { useRecent } from '@/hooks/use-recent';
import { useUiStore } from '@/lib/store';
import { itemHash, readItemHash, replaceItemHash } from '@/lib/deeplink';
import { downloadItemsZip, downloadFavoritesJson, parseFavoritesImport } from '@/lib/zip';
import { rankSearchResults, searchScore } from '@/lib/search-rank';
import { SimilarConfigs } from './similar-configs';
import { Reveal } from './motion-primitives';
import type { ToolkitCatalog, ToolkitCategory, ToolkitCategoryId, ToolkitItem } from '@/lib/toolkit-types';
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

type CategoryFilter = ToolkitCategoryId | 'all';

function useCopy() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const copy = async (text: string, path: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPath(path);
      toast.success('Скопировано в буфер обмена');
      setTimeout(() => setCopiedPath((p) => (p === path ? null : p)), 1500);
    } catch {
      toast.error('Не удалось скопировать');
    }
  };
  return { copiedPath, copy };
}

function downloadItem(item: ToolkitItem) {
  const ext = item.path.endsWith('.json') ? 'json' : item.path.endsWith('.js') ? 'js' : 'md';
  const fileName = item.name.replace(/[^\w.-]+/g, '-') + '.' + ext;
  const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Скачано: ${fileName}`);
}

function MetaBadges({ item }: { item: ToolkitItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
        <FileText className="h-3 w-3" />
        {item.lines} строк · {formatBytes(item.size)}
      </Badge>
      {item.meta.model && (
        <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
          <Cpu className="h-3 w-3" />
          {item.meta.model}
        </Badge>
      )}
      {item.meta.tools && (
        <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
          <Wrench className="h-3 w-3" />
          {item.meta.tools}
        </Badge>
      )}
    </div>
  );
}

function Hint({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom" className="font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function ItemActions({
  item,
  copiedPath,
  copy,
  isFavorite,
  onToggleFavorite,
}: {
  item: ToolkitItem;
  copiedPath: string | null;
  copy: (text: string, path: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (path: string) => void;
}) {
  const copied = copiedPath === item.path;
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}${itemHash(item.path)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Ссылка на конфиг скопирована');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Hint label="Скопировать ссылку на конфиг">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 transition-colors"
          aria-label="Скопировать ссылку на конфиг"
          onClick={share}
        >
          <Link2 className="h-3.5 w-3.5 transition-colors" />
        </Button>
      </Hint>
      <Hint label={isFavorite ? 'Убрать из избранного' : 'В избранное'}>
        <Button
          size="sm"
          variant={isFavorite ? 'default' : 'outline'}
          className={cn('h-8 w-8 p-0 transition-colors', isFavorite && 'text-primary-foreground')}
          aria-label={isFavorite ? 'Убрать из избранного' : 'В избранное'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.path);
          }}
        >
          <Star className={cn('h-3.5 w-3.5 transition-colors', isFavorite && 'fill-current text-yellow-400')} />
        </Button>
      </Hint>
      <Hint label={copied ? 'Готово' : 'Скопировать конфиг'}>
        <Button
          size="sm"
          variant={copied ? 'secondary' : 'default'}
          className="h-8 gap-1.5 transition-colors"
          onClick={() => copy(item.content, item.path)}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary transition-colors" />
          ) : (
            <Copy className="h-3.5 w-3.5 transition-colors" />
          )}
          {copied ? 'Скопировано' : 'Копировать'}
        </Button>
      </Hint>
      <Hint label={`Скачать ${item.name}`}>
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => downloadItem(item)}>
          <Download className="h-3.5 w-3.5" />
          Скачать
        </Button>
      </Hint>
    </div>
  );
}

export function ToolkitCatalogSection() {
  const [catalog, setCatalog] = useState<ToolkitCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [mobilePreview, setMobilePreview] = useState(false);
  const isMobile = useIsMobile();
  const { copiedPath, copy } = useCopy();
  const { favorites, isFavorite, toggle: toggleFavorite, importMany } = useFavorites();
  const { recent, push: pushRecent, clear: clearRecent } = useRecent();
  const {
    setCatalog: setStoreCatalog,
    requestPath,
    setRequestPath,
    requestRandom,
    requestFavorites,
    setPaletteOpen,
    openCompare,
  } = useUiStore();

  const filteredRef = useRef<ToolkitItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/toolkit')
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setCatalog(json.data as ToolkitCatalog);
          setStoreCatalog(json.data as ToolkitCatalog);
        } else setError(json.error ?? 'Неизвестная ошибка');
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [setStoreCatalog]);

  const allItems = useMemo(
    () => (catalog ? catalog.categories.flatMap((c) => c.items) : []),
    [catalog]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    const matched = allItems.filter((item) => {
      if (favOnly && !favorites.includes(item.path)) return false;
      if (category !== 'all' && item.category !== category) return false;
      if (!q) return true;
      return searchScore(item, q) > 0;
    });
    return rankSearchResults(matched, q);
  }, [allItems, category, query, favOnly, favorites]);

  useEffect(() => {
    filteredRef.current = filtered;
  }, [filtered]);

  const selected = useMemo(
    () => allItems.find((i) => i.path === selectedPath) ?? filtered[0] ?? null,
    [allItems, filtered, selectedPath]
  );

  const selectedBody = useMemo(
    () => (selected ? parseFrontmatter(selected.content).body : ''),
    [selected]
  );

  const recentItems = useMemo(
    () =>
      recent
        .map((p) => allItems.find((i) => i.path === p))
        .filter((i): i is ToolkitItem => Boolean(i)),
    [recent, allItems]
  );

  const activeCategory: ToolkitCategory | null =
    catalog?.categories.find((c) => c.id === category) ?? null;

  const counts = useMemo(() => {
    const map = new Map<ToolkitCategoryId, number>();
    for (const item of allItems) map.set(item.category, (map.get(item.category) ?? 0) + 1);
    return map;
  }, [allItems]);

  const openItem = (item: ToolkitItem) => {
    setSelectedPath(item.path);
    if (isMobile) setMobilePreview(true);
  };

  /** Open an item by path — used by «Похожие конфиги» chips. */
  const openByPath = (path: string) => {
    const target = allItems.find((i) => i.path === path);
    if (target) openItem(target);
  };

  const importInputRef = useRef<HTMLInputElement>(null);

  /** Handle a favorites-JSON import file (see parseFavoritesImport). */
  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    try {
      const text = await file.text();
      const imported = parseFavoritesImport(text);
      if (!imported) {
        toast.error('Некорректный файл — ожидается JSON экспорта избранного');
        return;
      }
      const known = imported.filter((p) => allItems.some((i) => i.path === p));
      if (known.length === 0) {
        toast.error('В файле нет ни одного пути из этого каталога');
        return;
      }
      const added = importMany(known);
      const dupes = known.length - added;
      const unknown = imported.length - known.length;
      const parts = [`+${added} новых`];
      if (dupes > 0) parts.push(`${dupes} уже были`);
      if (unknown > 0) parts.push(`${unknown} не найдено в каталоге`);
      toast.success(`Импорт избранного: ${parts.join(' · ')}`);
    } catch {
      toast.error('Не удалось прочитать файл');
    }
  };

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pickRandom = () => {
    const pool = filteredRef.current;
    if (pool.length === 0) {
      toast.error('Нет конфигов для случайного выбора');
      return;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    setSelectedPath(item.path);
    if (isMobile) setMobilePreview(true);
    toast.success(`Случайный выбор: ${item.name}`);
    scrollToCatalog();
  };

  /* ---- Deep-linking: #item=<path> ---- */
  const hashAppliedRef = useRef(false);
  useEffect(() => {
    if (!catalog || hashAppliedRef.current) return;
    hashAppliedRef.current = true;
    const linked = readItemHash();
    if (!linked) return;
    if (allItems.some((i) => i.path === linked)) {
      setSelectedPath(linked);
      scrollToCatalog();
    } else {
      replaceItemHash(null); // stale link — clean the hash
    }
  }, [catalog, allItems]);

  const selectedPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (!catalog) return;
    const prev = selectedPathRef.current;
    selectedPathRef.current = selectedPath;
    if (selectedPath && selectedPath !== readItemHash()) {
      replaceItemHash(selectedPath);
    }
    if (selectedPath && prev !== selectedPath) {
      pushRecent(selectedPath);
    }
  }, [selectedPath, catalog, pushRecent]);

  useEffect(() => {
    const onHash = () => {
      const linked = readItemHash();
      if (linked && allItems.some((i) => i.path === linked)) {
        setSelectedPath(linked);
        scrollToCatalog();
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [allItems]);

  /* ---- Keyboard navigation (↑/↓/j/k) within the list ---- */
  const moveSelection = (dir: 1 | -1) => {
    const pool = filteredRef.current;
    if (pool.length === 0) return;
    const idx = pool.findIndex((i) => i.path === selectedPath);
    const next = pool[Math.min(pool.length - 1, Math.max(0, idx + dir))];
    if (!next || next.path === selectedPath) return;
    setSelectedPath(next.path);
    if (isMobile) setMobilePreview(true);
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-item-path="${CSS.escape(next.path)}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    });
  };
  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      moveSelection(1);
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      moveSelection(-1);
    }
  };

  const copyCategory = (cat: ToolkitCategory) => {
    const text = cat.items
      .map((item) => `===== ${item.path} =====\n\n${item.content}`)
      .join('\n\n\n');
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`Скопировано ${cat.items.length} файлов категории «${cat.label}»`))
      .catch(() => toast.error('Не удалось скопировать'));
  };

  /* Store-driven flows from the command palette */
  useEffect(() => {
    if (!requestPath || allItems.length === 0) return;
    const item = allItems.find((i) => i.path === requestPath);
    if (item) {
      setFavOnly(false);
      setCategory('all');
      setQuery('');
      setSelectedPath(item.path);
      if (isMobile) setMobilePreview(true);
      scrollToCatalog();
    }
    setRequestPath(null);
  }, [requestPath, allItems, isMobile, setRequestPath]);

  useEffect(() => {
    if (requestRandom > 0) pickRandom();
  }, [requestRandom]);

  useEffect(() => {
    if (requestFavorites > 0) {
      setFavOnly(true);
      scrollToCatalog();
    }
  }, [requestFavorites]);

  return (
    <section id="catalog" className="scroll-mt-20 border-b border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          index="01"
          title="Каталог конфигов"
          description={
            <>
              Все {catalog?.totalItems ?? '…'} файлов тулкита. Ищите, просматривайте, копируйте и
              скачивайте — каждый файл готов к использованию.
            </>
          }
        />

        {/* Toolbar */}
        <div className="mb-6 space-y-3">
          <div className="flex max-w-xl items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск: tdd, security, hooks, z-ai…"
                aria-label="Поиск по каталогу"
                className="h-10 bg-card pl-9 pr-20"
              />
              {query ? (
                <button
                  aria-label="Очистить поиск"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  aria-label="Открыть палитру команд (Cmd+K)"
                  title="Палитра команд — ⌘K"
                  onClick={() => setPaletteOpen(true)}
                  className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Keyboard className="h-3 w-3" />
                  ⌘K
                </button>
              )}
            </div>
            <Hint label="Случайный конфиг">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Случайный конфиг"
                onClick={pickRandom}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </Hint>
            <Hint label="Сравнить два конфига (diff)">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label="Сравнить два конфига"
                onClick={() => openCompare(selected?.path ?? null)}
              >
                <GitCompareArrows className="h-4 w-4" />
              </Button>
            </Hint>
          </div>

          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Фильтр по категориям">
            <button
              role="tab"
              aria-selected={category === 'all'}
              onClick={() => {
                setCategory('all');
                setFavOnly(false);
              }}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                category === 'all' && !favOnly
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              Все · {allItems.length}
            </button>
            {favorites.length > 0 && (
              <button
                role="tab"
                aria-selected={favOnly}
                onClick={() => setFavOnly(!favOnly)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                  favOnly
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                Избранное · {favorites.length}
              </button>
            )}
            {catalog?.categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const active = category === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(active ? 'all' : cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all',
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label} · {counts.get(cat.id) ?? 0}
                </button>
              );
            })}
          </div>

          {activeCategory && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 text-xs text-muted-foreground">{activeCategory.description}</p>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  title="Скопировать все файлы категории (с разделителями)"
                  onClick={() => copyCategory(activeCategory)}
                >
                  <CopyPlus className="h-3.5 w-3.5" />
                  Копировать категорию
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  title="Скачать все файлы категории ZIP-архивом"
                  onClick={() => downloadItemsZip(activeCategory.items, `ezc-${activeCategory.id}.zip`)}
                >
                  <FileArchive className="h-3.5 w-3.5" />
                  ZIP
                </Button>
              </div>
            </div>
          )}
          {favOnly && !activeCategory && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />
                Показаны только избранные конфиги ({favorites.length})
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  aria-hidden
                  tabIndex={-1}
                  onChange={onImportFile}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  title="Импортировать избранное из JSON (экспорт этого сайта или массив путей)"
                  onClick={() => importInputRef.current?.click()}
                >
                  <FileUp className="h-3.5 w-3.5" />
                  Импорт
                </Button>
                {favorites.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 px-2.5 text-xs"
                    title="Скачать избранное как JSON (пути + метаданные)"
                    onClick={() => downloadFavoritesJson(favorites, allItems)}
                  >
                    <Braces className="h-3.5 w-3.5" />
                    Экспорт избранного
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recently viewed */}
        {recentItems.length > 0 && !query && (
          <div className="mb-4 flex min-w-0 flex-wrap items-center gap-1.5">
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <History className="h-3.5 w-3.5" />
              Недавние:
            </span>
            {recentItems.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => openItem(item)}
                title={item.description}
                className={cn(
                  'max-w-56 rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors',
                  selected?.path === item.path
                    ? 'border-primary/60 bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                <span className="block truncate">{item.name}</span>
              </button>
            ))}
            <button
              type="button"
              aria-label="Очистить историю просмотров"
              title="Очистить историю просмотров"
              onClick={clearRecent}
              className="rounded-md p-1 text-muted-foreground/60 transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Content */}
        {error ? (
          <Card className="border-destructive/40 bg-destructive/5 p-8 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Перезагрузить
            </Button>
          </Card>
        ) : !catalog ? (
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="hidden h-[560px] rounded-xl lg:block" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
            {/* List */}
            <div className="flex min-w-0 flex-col">
              <p className="mb-2 text-xs text-muted-foreground">
                Найдено: <span className="font-semibold text-foreground">{filtered.length}</span>
                <span className="ml-2 hidden font-mono text-[10px] text-muted-foreground/60 lg:inline">
                  ↑/↓ или j/k — навигация
                </span>
              </p>
              <div
                onKeyDown={onListKeyDown}
                className="max-h-[600px] space-y-2 overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin lg:max-h-[640px]"
              >
                {filtered.length === 0 ? (
                  <Card className="flex flex-col items-center gap-3 border-dashed p-8 text-center">
                    <SearchX className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {favOnly
                        ? 'В избранном пока пусто — добавьте конфиги звёздочкой ★'
                        : `Ничего не найдено по запросу «${query}»`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setQuery('');
                        setCategory('all');
                        setFavOnly(false);
                      }}
                    >
                      Сбросить фильтры
                    </Button>
                  </Card>
                ) : (
                  filtered.map((item) => {
                    const Icon = CATEGORY_ICONS[item.category];
                    const active = selected?.path === item.path;
                    const fav = isFavorite(item.path);
                    return (
                      <div
                        key={item.path}
                        role="button"
                        tabIndex={0}
                        data-item-path={item.path}
                        onClick={() => openItem(item)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openItem(item);
                          }
                        }}
                        aria-current={active}
                        className={cn(
                          'group relative w-full cursor-pointer rounded-xl border border-l-2 p-3.5 text-left transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          active
                            ? 'border-primary/60 border-l-primary bg-primary/10 shadow-sm'
                            : 'border-border/70 border-l-transparent bg-card/60 hover:border-primary/40 hover:bg-card'
                        )}
                      >
                        <div className="flex items-start gap-3 pr-7">
                          <span
                            className={cn(
                              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                              active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-2">
                              <Highlight
                                text={item.name}
                                query={query}
                                className="min-w-0 truncate font-mono text-sm font-semibold"
                              />
                            </div>
                            <Highlight
                              text={item.description}
                              query={query}
                              className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground"
                            />
                            <div className="mt-2 flex min-w-0 items-center gap-2 text-[10px] text-muted-foreground/70">
                              <span className="min-w-0 truncate font-mono">{item.path}</span>
                              <span>·</span>
                              <span className="shrink-0">{item.lines} стр.</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
                          title={fav ? 'Убрать из избранного' : 'В избранное'}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.path);
                          }}
                          className={cn(
                            'absolute right-3 top-3 rounded-md p-1.5 transition-all',
                            fav
                              ? 'text-yellow-400 opacity-100'
                              : 'text-muted-foreground opacity-0 hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100'
                          )}
                        >
                          <Star className={cn('h-3.5 w-3.5', fav && 'fill-current')} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Desktop preview */}
            <Card className="hidden flex-col overflow-hidden lg:flex">
              {selected ? (
                <>
                  <div className="border-b border-border bg-muted/30 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-mono text-lg font-bold">{selected.name}</h3>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          toolkit/{selected.path}
                        </p>
                      </div>
                      <ItemActions
                        item={selected}
                        copiedPath={copiedPath}
                        copy={copy}
                        isFavorite={isFavorite(selected.path)}
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                    <div className="mt-3">
                      <MetaBadges item={selected} />
                    </div>
                    <SimilarConfigs
                      current={selected}
                      all={allItems}
                      onSelect={openByPath}
                      onCompare={(pathB) => openCompare(selected.path, pathB)}
                      className="mt-3"
                    />
                  </div>
                  <div id="preview-scroll" className="max-h-[560px] overflow-y-auto p-5 scrollbar-thin">
                    {/* Skip when the mobile dialog owns the screen — avoids duplicate heading ids */}
                    {!(isMobile && mobilePreview) && (
                      <>
                        <PreviewToc body={selectedBody} containerId="preview-scroll" />
                        <MarkdownViewer content={selectedBody} />
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                  <MousePointerClick className="h-8 w-8 text-muted-foreground/40" />
                  <p>{filtered.length > 0 ? 'Выберите файл слева' : 'Здесь появится выбранный конфиг'}</p>
                  {filtered.length > 0 && (
                    <p className="flex flex-wrap items-center justify-center gap-1 text-xs">
                      или листайте
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑/↓</kbd>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">j/k</kbd>
                      и открывайте
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Mobile preview dialog */}
      <Dialog open={mobilePreview && !!selected} onOpenChange={setMobilePreview}>
        <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader className="border-b border-border bg-muted/30 p-5 text-left">
                <DialogTitle className="truncate pr-6 font-mono text-base">
                  {selected.name}
                </DialogTitle>
                <DialogDescription className="mt-0.5 truncate font-mono text-xs">
                  toolkit/{selected.path}
                </DialogDescription>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <MetaBadges item={selected} />
                  <ItemActions
                    item={selected}
                    copiedPath={copiedPath}
                    copy={copy}
                    isFavorite={isFavorite(selected.path)}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
                <SimilarConfigs
                  current={selected}
                  all={allItems}
                  onSelect={openByPath}
                  onCompare={(pathB) => openCompare(selected.path, pathB)}
                  className="mt-3"
                />
              </DialogHeader>
              <div
                id="mobile-preview-scroll"
                className="flex-1 overflow-y-auto p-5 scrollbar-thin"
              >
                <PreviewToc body={selectedBody} containerId="mobile-preview-scroll" />
                <MarkdownViewer content={selectedBody} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
