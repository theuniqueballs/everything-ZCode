'use client';

import { useEffect } from 'react';
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
import type { ToolkitCategoryId } from '@/lib/toolkit-types';

const CATEGORY_ICONS: Record<ToolkitCategoryId, typeof Bot> = {
  agents: Bot,
  commands: FileCode2,
  skills: Sparkles,
  rules: Scale,
  hooks: Webhook,
  contexts: Layers,
  settings: Boxes,
};

const SECTION_LINKS = [
  { href: '#catalog', label: 'Каталог конфигов' },
  { href: '#concepts', label: 'Ключевые концепты' },
  { href: '#install', label: 'Установка' },
  { href: '#principles', label: 'Принципы' },
];

/**
 * ⌘K command palette: jump to sections, search every config, quick actions.
 */
export function CommandPalette() {
  const {
    paletteOpen,
    setPaletteOpen,
    setRequestPath,
    triggerRandom,
    triggerFavorites,
    catalog,
    openCompare,
    setShortcutsOpen,
  } = useUiStore();
  const { resolvedTheme, setTheme } = useTheme();

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

  const openConfig = (path: string) => {
    setPaletteOpen(false);
    setRequestPath(path);
  };

  const scrollToSection = (href: string) => {
    setPaletteOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <CommandDialog
      open={paletteOpen}
      onOpenChange={setPaletteOpen}
      className="max-w-xl"
    >
      <CommandInput placeholder="Поиск конфигов: tdd, security, hooks…" />
      <CommandList className="max-h-[70vh] scrollbar-thin">
        <CommandEmpty>
          <span className="text-sm text-muted-foreground">
            Ничего не найдено. Попробуйте: «review», «prisma», «hook»…
          </span>
        </CommandEmpty>

        {/* Quick actions */}
        <CommandGroup heading="Действия">
          <CommandItem onSelect={() => { setPaletteOpen(false); triggerRandom(); }}>
            <Shuffle className="mr-2 h-4 w-4" />
            Случайный конфиг
          </CommandItem>
          <CommandItem onSelect={() => { setPaletteOpen(false); triggerFavorites(); }}>
            <Star className="mr-2 h-4 w-4" />
            Показать избранное
          </CommandItem>
          <CommandItem onSelect={() => { setPaletteOpen(false); setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'); }}>
            {resolvedTheme === 'dark' ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            Переключить тему
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setPaletteOpen(false);
              openCompare(null);
            }}
          >
            <GitCompareArrows className="mr-2 h-4 w-4" />
            Сравнить два конфига (diff)
          </CommandItem>
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
            Скачать весь тулкит (ZIP)
          </CommandItem>
          <CommandItem onSelect={() => { setPaletteOpen(false); setShortcutsOpen(true); }}>
            <Keyboard className="mr-2 h-4 w-4" />
            Горячие клавиши
          </CommandItem>
        </CommandGroup>

        {/* Sections */}
        <CommandGroup heading="Разделы">
          {SECTION_LINKS.map((s) => (
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
              <CommandGroup heading={`${cat.label} · ${cat.items.length}`}>
                {cat.items.map((item) => (
                  <CommandItem
                    key={item.path}
                    value={`${item.name} ${item.description} ${item.path}`}
                    onSelect={() => openConfig(item.path)}
                    className="gap-2"
                  >
                    <Icon className="mr-1 h-4 w-4 shrink-0 text-primary" />
                    <span className="font-mono text-xs font-semibold">{item.name}</span>
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
          Палитра открывается по{' '}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </div>
      </CommandList>
    </CommandDialog>
  );
}
