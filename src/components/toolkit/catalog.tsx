'use client';

import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
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
  SearchX,
  Star,
  Shuffle,
  CopyPlus,
  Keyboard,
  History,
  FileArchive,
  GitCompareArrows,
  Braces,
  FileUp,
  MousePointerClick,
  Rows2,
  Rows3,
  ImageIcon,
  FolderPlus,
  PenLine,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { MarkdownViewer } from './markdown-viewer';
import { PreviewToc } from './preview-toc';
import { Highlight } from './highlight';
import { SectionHeading } from './section-heading';
import { Hint } from './hint';
import { MetaBadges, ItemActions } from './item-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { parseFrontmatter } from '@/lib/frontmatter';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useFavorites } from '@/hooks/use-favorites';
import { useRecent } from '@/hooks/use-recent';
import { useDensity, type ListDensity } from '@/hooks/use-density';
import { useUiStore } from '@/lib/store';
import { itemHash, readItemHash, replaceItemHash } from '@/lib/deeplink';
import { toolkitDataUrl } from '@/lib/env';
import { downloadItemsZip, downloadFavoritesJson, parseFavoritesImport } from '@/lib/zip';
import { rankSearchResults, searchScore } from '@/lib/search-rank';
import { useI18n, translate, getLang } from '@/lib/i18n';
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

interface CatalogItemRowProps {
  item: ToolkitItem;
  active: boolean;
  fav: boolean;
  query: string;
  density: ListDensity;
  onOpen: (path: string) => void;
  onToggleFav: (path: string) => void;
}

/*
 * Memoized catalog row — re-renders only when its own data, density or
 * query highlight changes. Selection/favorites toggles re-render just the
 * affected rows instead of the whole list (45 items × rich content).
 */
const CatalogItemRow = memo(function CatalogItemRow({
  item,
  active,
  fav,
  query,
  density,
  onOpen,
  onToggleFav,
}: CatalogItemRowProps) {
  const { t } = useI18n();
  const Icon = CATEGORY_ICONS[item.category];
  const compact = density === 'compact';
  return (
    <div
      role="button"
      tabIndex={0}
      data-item-path={item.path}
      onClick={() => onOpen(item.path)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(item.path);
        }
      }}
      aria-current={active}
      title={compact ? item.description : undefined}
      className={cn(
        'group relative w-full cursor-pointer rounded-xl border border-l-2 text-left transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        compact ? 'p-2' : 'p-3.5',
        active
          ? 'border-primary/60 border-l-primary bg-gradient-to-r from-primary/[0.12] to-primary/[0.03] shadow-sm'
          : 'border-border/70 border-l-transparent bg-card/60 hover:border-primary/40 hover:bg-card'
      )}
    >
      <div className={cn('flex items-start gap-3', compact && 'items-center gap-2.5')}>
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-lg transition-colors',
            compact ? 'h-7 w-7' : 'mt-0.5 h-8 w-8',
            active ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <Highlight
              text={item.name}
              query={query}
              className={cn(
                'min-w-0 truncate font-mono font-semibold',
                compact ? 'text-xs' : 'text-sm'
              )}
            />
            {compact && (
              <span className="ml-auto shrink-0 text-[10px] text-muted-foreground/60">
                {item.lines}
              </span>
            )}
          </div>
          {!compact && (
            <>
              <Highlight
                text={item.description}
                query={query}
                className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground"
              />
              <div className="mt-2 flex min-w-0 items-center gap-2 text-[10px] text-muted-foreground/70">
                <span className="min-w-0 truncate font-mono">{item.path}</span>
                <span>·</span>
                <span className="shrink-0">{item.lines} {t('catalog.linesShort')}</span>
              </div>
            </>
          )}
          {compact && (
            <p className="truncate font-mono text-[10px] text-muted-foreground/60">{item.path}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        aria-label={fav ? t('item.favRemove') : t('item.favAdd')}
        title={fav ? t('item.favRemove') : t('item.favAdd')}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFav(item.path);
        }}
        className={cn(
          'absolute rounded-md p-1.5 transition-all',
          compact ? 'right-2 top-1.5' : 'right-3 top-3',
          fav
            ? 'text-yellow-400 opacity-100'
            : 'text-muted-foreground opacity-0 hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100'
        )}
      >
        <Star className={cn('h-3.5 w-3.5', fav && 'fill-current')} />
      </button>
      {/* «Opens detail» affordance — vertically centered chevron on hover */}
      <ChevronRight
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/50 transition-all duration-200',
          'opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100',
          compact && 'right-1.5'
        )}
      />
    </div>
  );
});

export function ToolkitCatalogSection() {
  const { lang, t } = useI18n();
  const [catalog, setCatalog] = useState<ToolkitCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [colDialog, setColDialog] = useState<'create' | 'rename' | null>(null);
  const [colName, setColName] = useState('');
  const [colDeleteOpen, setColDeleteOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const {
    favorites,
    isFavorite,
    toggle: toggleFavorite,
    importMany,
    collectionNames,
    collectionsMap,
    activeCollection,
    selectCollection,
    createCollection,
    renameCollection,
    deleteCollection,
  } = useFavorites();
  const { recent, push: pushRecent, clear: clearRecent } = useRecent();
  const { density, toggle: toggleDensity } = useDensity();
  const {
    setCatalog: setStoreCatalog,
    setLastSelectedPath,
    requestPath,
    setRequestPath,
    requestRandom,
    requestFavorites,
    setPaletteOpen,
    openCompare,
    openDetail,
  } = useUiStore();

  const filteredRef = useRef<ToolkitItem[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(toolkitDataUrl())
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.success) {
          setCatalog(json.data as ToolkitCatalog);
          setStoreCatalog(json.data as ToolkitCatalog);
        } else setError(json.error ?? translate(getLang(), 'catalog.unknownError'));
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
    if (!isDesktop) openDetail(item.path);
  };

  /*
   * Stable open-by-path callback for memoized rows (and chips):
   * reads live data through refs so the identity never changes.
   */
  const allItemsRef = useRef<ToolkitItem[]>([]);
  const isDesktopRef = useRef(isDesktop);
  useEffect(() => {
    allItemsRef.current = allItems;
    isDesktopRef.current = isDesktop;
  }, [allItems, isDesktop]);
  const openByPath = useCallback(
    (path: string) => {
      const target = allItemsRef.current.find((i) => i.path === path);
      if (!target) return;
      setSelectedPath(path);
      if (!isDesktopRef.current) openDetail(path);
    },
    [openDetail],
  );

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
        toast.error(t('toast.importInvalid'));
        return;
      }
      const known = imported.filter((p) => allItems.some((i) => i.path === p));
      if (known.length === 0) {
        toast.error(t('toast.importNoneKnown'));
        return;
      }
      const added = importMany(known);
      const dupes = known.length - added;
      const unknown = imported.length - known.length;
      const parts = [t('import.new', { n: added })];
      if (dupes > 0) parts.push(t('import.existing', { n: dupes }));
      if (unknown > 0) parts.push(t('import.unknown', { n: unknown }));
      toast.success(t('toast.importOk', { parts: parts.join(' · ') }));
    } catch {
      toast.error(t('toast.importReadFailed'));
    }
  };

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pickRandom = () => {
    const pool = filteredRef.current;
    if (pool.length === 0) {
      toast.error(translate(getLang(), 'toast.randomEmpty'));
      return;
    }
    const item = pool[Math.floor(Math.random() * pool.length)];
    setSelectedPath(item.path);
    if (!isDesktop) openDetail(item.path);
    toast.success(translate(getLang(), 'toast.randomPick', { name: item.name }));
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
      if (!isDesktopRef.current) openDetail(linked);
      scrollToCatalog();
    } else {
      replaceItemHash(null); // stale link — clean the hash
    }
  }, [catalog, allItems, isDesktopRef, openDetail]);

  const selectedPathRef = useRef<string | null>(null);
  useEffect(() => {
    if (!catalog) return;
    const prev = selectedPathRef.current;
    selectedPathRef.current = selectedPath;
    if (selectedPath) {
      setLastSelectedPath(selectedPath);
      if (selectedPath !== readItemHash()) {
        replaceItemHash(selectedPath);
      }
    }
    if (selectedPath && prev !== selectedPath) {
      pushRecent(selectedPath);
    }
  }, [selectedPath, catalog, pushRecent, setLastSelectedPath]);

  /* ---- Global hotkey: "/" focuses the catalog search (vim-style) ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      document
        .getElementById('catalog')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      searchRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

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
    if (!isDesktop) openDetail(next.path);
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
    const catLabel = lang === 'en' ? cat.labelEn : cat.label;
    navigator.clipboard
      .writeText(text)
      .then(() =>
        toast.success(translate(getLang(), 'toast.categoryCopied', { n: cat.items.length, cat: catLabel }))
      )
      .catch(() => toast.error(translate(getLang(), 'toast.copyFailed')));
  };

  /* ---- Collections management ---- */
  const submitCollectionDialog = () => {
    const trimmed = colName.trim();
    if (colDialog === 'create') {
      if (createCollection(trimmed)) {
        toast.success(t('toast.colCreated', { name: trimmed }));
      } else {
        toast.error(t('toast.colExists'));
      }
    } else if (colDialog === 'rename') {
      if (renameCollection(activeCollection, trimmed)) {
        toast.success(t('toast.colRenamed', { name: trimmed }));
      } else {
        toast.error(t('toast.colExists'));
      }
    }
    setColDialog(null);
  };
  const confirmDeleteCollection = () => {
    const name = activeCollection;
    deleteCollection(name);
    toast.success(t('toast.colDeleted', { name }));
    setColDeleteOpen(false);
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
      if (!isDesktop) {
        /* Below lg there is no inline preview — open the detail sheet instead */
        openDetail(item.path);
      } else {
        scrollToCatalog();
      }
    }
    setRequestPath(null);
  }, [requestPath, allItems, isDesktop, setRequestPath, openDetail]);

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
          title={t('catalog.title')}
          description={t('catalog.desc', { n: catalog?.totalItems ?? '…' })}
        />

        {/* Toolbar */}
        <div className="mb-6 space-y-3">
          <div className="flex max-w-xl items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('catalog.searchPh')}
                aria-label={t('catalog.searchAria')}
                className="h-10 bg-card pl-9 pr-20"
              />
              {query ? (
                <button
                  aria-label={t('catalog.clearSearch')}
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  aria-label={t('aria.openPalette')}
                  title={t('tip.palette')}
                  onClick={() => setPaletteOpen(true)}
                  className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Keyboard className="h-3 w-3" />
                  ⌘K
                </button>
              )}
            </div>
            <Hint label={t('catalog.random')}>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label={t('catalog.random')}
                onClick={pickRandom}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </Hint>
            <Hint label={t('catalog.compare')}>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                aria-label={t('catalog.compare')}
                onClick={() => openCompare(selected?.path ?? null)}
              >
                <GitCompareArrows className="h-4 w-4" />
              </Button>
            </Hint>
          </div>

          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t('catalog.filterAria')}>
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
              {t('catalog.allTab', { n: allItems.length })}
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
                {t('catalog.favTab', { n: favorites.length })}
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
                  {(lang === 'en' ? cat.labelEn : cat.label)} · {counts.get(cat.id) ?? 0}
                </button>
              );
            })}
          </div>

          {activeCategory && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="min-w-0 text-xs text-muted-foreground">
                {lang === 'en' && activeCategory.descriptionEn ? activeCategory.descriptionEn : activeCategory.description}
              </p>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  title={t('catalog.copyCategoryTitle')}
                  onClick={() => copyCategory(activeCategory)}
                >
                  <CopyPlus className="h-3.5 w-3.5" />
                  {t('catalog.copyCategory')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 px-2.5 text-xs"
                  title={t('catalog.zipTitle')}
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
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <Star className="h-3.5 w-3.5 shrink-0 fill-current text-yellow-400" />
                <span className="shrink-0 text-xs text-muted-foreground">
                  {t('catalog.favOnly', { n: favorites.length })}
                </span>
                {/* Collections: switch / create / rename / delete */}
                <Select value={activeCollection} onValueChange={selectCollection}>
                  <SelectTrigger
                    aria-label={t('catalog.collection')}
                    className="h-7 w-auto gap-1 rounded-md border-border bg-card px-2.5 text-xs font-medium"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionNames.map((name) => (
                      <SelectItem key={name} value={name} className="text-xs">
                        {name}
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          {t('catalog.colCount', { n: (collectionsMap[name] ?? []).length })}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Hint label={t('catalog.colNew')}>
                  <button
                    type="button"
                    aria-label={t('catalog.colNew')}
                    onClick={() => {
                      setColName('');
                      setColDialog('create');
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                </Hint>
                <Hint label={t('catalog.colRename')}>
                  <button
                    type="button"
                    aria-label={t('catalog.colRename')}
                    onClick={() => {
                      setColName(activeCollection);
                      setColDialog('rename');
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                  </button>
                </Hint>
                <Hint label={t('catalog.colDelete')}>
                  <button
                    type="button"
                    aria-label={t('catalog.colDelete')}
                    disabled={collectionNames.length <= 1}
                    onClick={() => setColDeleteOpen(true)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Hint>
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
                  title={t('catalog.importTitle')}
                  onClick={() => importInputRef.current?.click()}
                >
                  <FileUp className="h-3.5 w-3.5" />
                  {t('catalog.import')}
                </Button>
                {favorites.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 px-2.5 text-xs"
                    title={t('catalog.exportFavTitle')}
                    onClick={() => downloadFavoritesJson(favorites, allItems)}
                  >
                    <Braces className="h-3.5 w-3.5" />
                    {t('catalog.exportFav')}
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
              {t('catalog.recent')}
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
              aria-label={t('catalog.clearRecent')}
              title={t('catalog.clearRecent')}
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
              {t('catalog.reload')}
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
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="min-w-0 text-xs text-muted-foreground">
                  {t('catalog.found')} <span className="font-semibold text-foreground">{filtered.length}</span>
                  <span className="ml-2 hidden font-mono text-[10px] text-muted-foreground/60 lg:inline">
                    {t('catalog.navHint')}
                  </span>
                </p>
                <Hint
                  label={
                    density === 'compact'
                      ? t('catalog.densityCompact')
                      : t('catalog.densityComfortable')
                  }
                >
                  <button
                    type="button"
                    aria-label={
                      density === 'compact'
                        ? t('catalog.densityCompact')
                        : t('catalog.densityComfortable')
                    }
                    aria-pressed={density === 'compact'}
                    onClick={toggleDensity}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {density === 'compact' ? (
                      <Rows3 className="h-3.5 w-3.5" />
                    ) : (
                      <Rows2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </Hint>
                {query.trim().length > 0 && (
                  <Hint label={t('catalog.zipSearchTitle', { n: filtered.length })}>
                    <button
                      type="button"
                      aria-label={t('catalog.zipSearchTitle', { n: filtered.length })}
                      onClick={() =>
                        downloadItemsZip(filtered, `ezc-search-${query.trim().slice(0, 24).replace(/[^a-zA-Zа-яА-ЯёЁ0-9-]+/gi, '-')}.zip`)
                      }
                      className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-border bg-card px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <FileArchive className="h-3.5 w-3.5" />
                      ZIP
                    </button>
                  </Hint>
                )}
              </div>
              <div
                onKeyDown={onListKeyDown}
                className={cn(
                  'max-h-[600px] overflow-y-auto overflow-x-hidden pr-1 scrollbar-thin lg:max-h-[640px]',
                  density === 'compact' ? 'space-y-1' : 'space-y-2'
                )}
              >
                {filtered.length === 0 ? (
                  <Card className="flex flex-col items-center gap-3 border-dashed p-8 text-center">
                    <SearchX className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {favOnly
                        ? t('catalog.emptyFav')
                        : t('catalog.emptyQuery', { q: query })}
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
                      {t('catalog.resetFilters')}
                    </Button>
                  </Card>
                ) : (
                  filtered.map((item) => (
                    <CatalogItemRow
                      key={item.path}
                      item={item}
                      active={selected?.path === item.path}
                      fav={isFavorite(item.path)}
                      query={query}
                      density={density}
                      onOpen={openByPath}
                      onToggleFav={toggleFavorite}
                    />
                  ))
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
                    <PreviewToc body={selectedBody} containerId="preview-scroll" />
                    <MarkdownViewer content={selectedBody} />
                  </div>
                </>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                  <MousePointerClick className="h-8 w-8 text-muted-foreground/40" />
                  <p>{filtered.length > 0 ? t('catalog.selectFile') : t('catalog.emptyPreview')}</p>
                  {filtered.length > 0 && (
                    <p className="flex flex-wrap items-center justify-center gap-1 text-xs">
                      {t('catalog.orBrowse')}
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑/↓</kbd>
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">j/k</kbd>
                      {t('catalog.andOpen')}
                      <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Collection create / rename dialog */}
      <Dialog
        open={colDialog !== null}
        onOpenChange={(open) => !open && setColDialog(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {colDialog === 'create'
                ? t('catalog.colDialogTitleCreate')
                : t('catalog.colDialogTitleRename')}
            </DialogTitle>
            <DialogDescription>
              {colDialog === 'create'
                ? t('catalog.colDialogDescCreate')
                : t('catalog.colDialogDescRename')}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCollectionDialog();
            }}
            className="flex flex-col gap-4"
          >
            <Input
              value={colName}
              onChange={(e) => setColName(e.target.value)}
              placeholder={t('catalog.colNamePh')}
              aria-label={t('catalog.colNamePh')}
              maxLength={48}
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setColDialog(null)}
              >
                {t('catalog.colCancel')}
              </Button>
              <Button type="submit" size="sm" disabled={colName.trim().length === 0}>
                {colDialog === 'create' ? t('catalog.colCreate') : t('catalog.colSave')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Collection delete confirmation */}
      <AlertDialog open={colDeleteOpen} onOpenChange={setColDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('catalog.colDeleteTitle', { name: activeCollection })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('catalog.colDeleteDesc', { n: favorites.length })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('catalog.colCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCollection}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('catalog.colDeleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
