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
  Rows2,
  Rows3,
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
import { useDensity, type ListDensity } from '@/hooks/use-density';
import { useUiStore } from '@/lib/store';
import { itemHash, readItemHash, replaceItemHash } from '@/lib/deeplink';
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

function useCopy() {
  const { t } = useI18n();
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const copy = async (text: string, path: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPath(path);
      toast.success(t('toast.copied'));
      setTimeout(() => setCopiedPath((p) => (p === path ? null : p)), 1500);
    } catch {
      toast.error(t('toast.copyFailed'));
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
  toast.success(translate(getLang(), 'toast.downloaded', { name: fileName }));
}

function MetaBadges({ item }: { item: ToolkitItem }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
        <FileText className="h-3 w-3" />
        {item.lines} {t('catalog.lines')} · {formatBytes(item.size)}
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
    </div>
  );
});

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
  const { t } = useI18n();
  const copied = copiedPath === item.path;
  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}${itemHash(item.path)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('toast.linkCopied'));
    } catch {
      toast.error(t('toast.linkCopyFailed'));
    }
  };
  return (
    <div className="flex items-center gap-2">
      <Hint label={t('item.copyLink')}>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 transition-colors"
          aria-label={t('item.copyLink')}
          onClick={share}
        >
          <Link2 className="h-3.5 w-3.5 transition-colors" />
        </Button>
      </Hint>
      <Hint label={isFavorite ? t('item.favRemove') : t('item.favAdd')}>
        <Button
          size="sm"
          variant={isFavorite ? 'default' : 'outline'}
          className={cn('h-8 w-8 p-0 transition-colors', isFavorite && 'text-primary-foreground')}
          aria-label={isFavorite ? t('item.favRemove') : t('item.favAdd')}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.path);
          }}
        >
          <Star className={cn('h-3.5 w-3.5 transition-colors', isFavorite && 'fill-current text-yellow-400')} />
        </Button>
      </Hint>
      <Hint label={copied ? t('item.done') : t('item.copyConfig')}>
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
          {copied ? t('item.copied') : t('item.copy')}
        </Button>
      </Hint>
      <Hint label={t('item.downloadName', { name: item.name })}>
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => downloadItem(item)}>
          <Download className="h-3.5 w-3.5" />
          {t('item.download')}
        </Button>
      </Hint>
    </div>
  );
}

export function ToolkitCatalogSection() {
  const { lang, t } = useI18n();
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
  } = useUiStore();

  const filteredRef = useRef<ToolkitItem[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/toolkit')
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
    if (isMobile) setMobilePreview(true);
  };

  /*
   * Stable open-by-path callback for memoized rows (and chips):
   * reads live data through refs so the identity never changes.
   */
  const allItemsRef = useRef<ToolkitItem[]>([]);
  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    allItemsRef.current = allItems;
    isMobileRef.current = isMobile;
  }, [allItems, isMobile]);
  const openByPath = useCallback((path: string) => {
    const target = allItemsRef.current.find((i) => i.path === path);
    if (!target) return;
    setSelectedPath(path);
    if (isMobileRef.current) setMobilePreview(true);
  }, []);

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
    if (isMobile) setMobilePreview(true);
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
    const catLabel = lang === 'en' ? cat.labelEn : cat.label;
    navigator.clipboard
      .writeText(text)
      .then(() =>
        toast.success(translate(getLang(), 'toast.categoryCopied', { n: cat.items.length, cat: catLabel }))
      )
      .catch(() => toast.error(translate(getLang(), 'toast.copyFailed')));
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />
                {t('catalog.favOnly', { n: favorites.length })}
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
