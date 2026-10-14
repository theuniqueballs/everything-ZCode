'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  Bot,
  FileCode2,
  Sparkles,
  Scale,
  Webhook,
  Layers,
  Boxes,
  Moon,
  Sun,
  Shuffle,
  Search,
  Star,
  Compass,
  FileArchive,
  GitCompareArrows,
  Keyboard,
  History,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { useUiStore } from '@/lib/store';
import { downloadItemsZip } from '@/lib/zip';
import { useI18n } from '@/lib/i18n';
import { findSimilar } from '@/lib/similar';
import { useRecent } from '@/hooks/use-recent';
import { Highlight } from './highlight';
import type { ToolkitCategoryId, ToolkitItem } from '@/lib/toolkit-types';

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
 * ⌘K command palette: jump to sections, search every config, quick actions.
 */
export function CommandPalette() {
  const { t, lang } = useI18n();
  const {
    paletteOpen,
    setPaletteOpen,
    setRequestPath,
    triggerRandom,
    triggerFavorites,
    catalog,
    openCompare,
    setShortcutsOpen,
    lastSelectedPath,
  } = useUiStore();
  const { resolvedTheme, setTheme } = useTheme();
  const { recent } = useRecent();
  const [query, setQuery] = useState('');

  /* Context: last selected config and its closest similar match. */
  const context = useMemo(() => {
    if (!catalog || !lastSelectedPath) return null;
    const all = catalog.categories.flatMap((c) => c.items);
    const current = all.find((i) => i.path === lastSelectedPath);
    if (!current) return null;
    const top = findSimilar(current, all, 1)[0]?.item ?? null;
    return { current, top };
  }, [catalog, lastSelectedPath]);

  /* Recent configs resolved against the shared catalog (top 4). */
  const recentItems = useMemo<ToolkitItem[]>(() => {
    if (!catalog) return [];
    const all = catalog.categories.flatMap((c) => c.items);
    return recent
      .map((p) => all.find((i) => i.path === p))
      .filter((i): i is ToolkitItem => Boolean(i))
      .slice(0, 4);
  }, [recent, catalog]);

  /* Reset the highlight query when the palette closes. */
  useEffect(() => {
    if (!paletteOpen) setQuery('');
  }, [paletteOpen]);

  /* Global hotkey: Cmd/Ctrl + K */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(!useUiStore.getState().paletteOpen);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setPaletteOpen]);

  /*
   * Vim-style j/k navigation inside the palette. Active only when the focus
   * is NOT in the search input (so typing letters still works); translates
   * j/k into ArrowDown/ArrowUp and dispatches onto the cmdk root.
   */
  useEffect(() => {
    if (!paletteOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      if (key !== 'j' && key !== 'k') return;
      const root = document.querySelector('[cmdk-root]');
      if (!root) return;
      e.preventDefault();
      root.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: key === 'j' ? 'ArrowDown' : 'ArrowUp',
          bubbles: true,
          cancelable: true,
        }),
      );
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [paletteOpen]);

  const openConfig = (path: string) => {
    setPaletteOpen(false);
    setRequestPath(path);
  };

  const scrollToSection = (href: string) => {
    setPaletteOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const sectionLinks = [
    { href: '#catalog', label: t('palette.sec.catalog') },
    { href: '#stats', label: t('palette.sec.stats') },
    { href: '#concepts', label: t('palette.sec.concepts') },
    { href: '#install', label: t('palette.sec.install') },
    { href: '#principles', label: t('palette.sec.principles') },
  ];

  return (
    <CommandDialog
      open={paletteOpen}
      onOpenChange={setPaletteOpen}
      className="max-w-xl"
    >
      <CommandInput
        placeholder={t('palette.ph')}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[70vh] scrollbar-thin">
        <CommandEmpty>
          <span className="text-sm text-muted-foreground">{t('palette.empty')}</span>
        </CommandEmpty>

        {/* Quick actions */}
        <CommandGroup heading={t('palette.actions')}>
          <CommandItem onSelect={() => { setPaletteOpen(false); triggerRandom(); }}>
            <Shuffle className="mr-2 h-4 w-4" />
            {t('palette.random')}
          </CommandItem>
          <CommandItem onSelect={() => { setPaletteOpen(false); triggerFavorites(); }}>
            <Star className="mr-2 h-4 w-4" />
            {t('palette.showFav')}
          </CommandItem>
          <CommandItem onSelect={() => { setPaletteOpen(false); setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'); }}>
            {resolvedTheme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            {t('palette.toggleTheme')}
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setPaletteOpen(false);
              openCompare(null);
            }}
          >
            <GitCompareArrows className="mr-2 h-4 w-4" />
            {t('palette.compare')}
          </CommandItem>
          {context?.top && (
            <CommandItem
              value={`diff similar ${context.current.name} ${context.top.name} ${context.current.path}`}
              onSelect={() => {
                setPaletteOpen(false);
                openCompare(context.current.path, context.top.path);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t('palette.compareSimilar')}
              <span className="ml-auto hidden max-w-44 truncate font-mono text-[10px] text-muted-foreground sm:inline">
                {context.current.name} ↔ {context.top.name}
              </span>
            </CommandItem>
          )}
          <CommandItem
            onSelect={() => {
              setPaletteOpen(false);
              if (catalog) {
                const all = catalog.categories.flatMap((c) => c.items);
                downloadItemsZip(all, 'everything-zcode-toolkit.zip');
              }
            }}
          >
            <FileArchive className="mr-2 h-4 w-4" />
            {t('palette.downloadZip')}
          </CommandItem>
          <CommandItem onSelect={() => { setPaletteOpen(false); setShortcutsOpen(true); }}>
            <Keyboard className="mr-2 h-4 w-4" />
            {t('palette.shortcuts')}
          </CommandItem>
        </CommandGroup>

        {/* Recent configs */}
        {recentItems.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={t('palette.recent')}>
              {recentItems.map((item) => (
                <CommandItem
                  key={item.path}
                  value={`recent ${item.name} ${item.description} ${item.path}`}
                  onSelect={() => openConfig(item.path)}
                  className="gap-2"
                >
                  <History className="mr-1 h-4 w-4 shrink-0 text-primary" />
                  <span className="min-w-0 font-mono text-xs font-semibold">{item.name}</span>
                  <span className="ml-auto hidden truncate text-[11px] text-muted-foreground sm:inline">
                    {item.path}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Sections */}
        <CommandGroup heading={t('palette.sections')}>
          {sectionLinks.map((s) => (
            <CommandItem key={s.href} onSelect={() => scrollToSection(s.href)}>
              <Compass className="mr-2 h-4 w-4" />
              {s.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Configs grouped by category */}
        {catalog?.categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          return (
            <div key={cat.id}>
              <CommandSeparator />
              <CommandGroup heading={`${lang === 'en' ? cat.labelEn : cat.label} · ${cat.items.length}`}>
                {cat.items.map((item) => (
                  <CommandItem
                    key={item.path}
                    value={`${item.name} ${item.description} ${item.path}`}
                    onSelect={() => openConfig(item.path)}
                    className="gap-2"
                  >
                    <Icon className="mr-1 h-4 w-4 shrink-0 text-primary" />
                    <Highlight
                      text={item.name}
                      query={query}
                      className="min-w-0 font-mono text-xs font-semibold"
                    />
                    <span className="ml-auto hidden truncate text-[11px] text-muted-foreground sm:inline">
                      {item.path}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          );
        })}

        <CommandSeparator />
        <div className="flex items-center gap-2 px-4 py-2 text-[11px] text-muted-foreground">
          <Search className="h-3 w-3" />
          {t('palette.footer')}{' '}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </div>
      </CommandList>
    </CommandDialog>
  );
}
