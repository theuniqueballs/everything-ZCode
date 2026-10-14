'use client';

import { useEffect } from 'react';
import {
  Command,
  Keyboard,
  ArrowDown,
  CornerDownLeft,
  MousePointerClick,
  ListChecks,
  X,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUiStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';

interface ShortcutRow {
  keys: string[];
  key: string;
  icon: React.ReactNode;
}

interface ShortcutGroup {
  labelKey: string;
  icon: React.ReactNode;
  rows: ShortcutRow[];
}

const GROUPS: ShortcutGroup[] = [
  {
    labelKey: 'sc.group.general',
    icon: <SlidersHorizontal className="h-3 w-3" />,
    rows: [
      { keys: ['⌘', 'K'], key: 'sc.palette', icon: <Command className="h-3.5 w-3.5" /> },
      { keys: ['?'], key: 'sc.help', icon: <Keyboard className="h-3.5 w-3.5" /> },
      { keys: ['Esc'], key: 'sc.esc', icon: <X className="h-3.5 w-3.5" /> },
    ],
  },
  {
    labelKey: 'sc.group.catalog',
    icon: <Search className="h-3 w-3" />,
    rows: [
      { keys: ['/'], key: 'sc.focusSearch', icon: <Search className="h-3.5 w-3.5" /> },
      { keys: ['↑', '↓'], key: 'sc.arrows', icon: <ArrowDown className="h-3.5 w-3.5" /> },
      { keys: ['j', 'k'], key: 'sc.listNav', icon: <MousePointerClick className="h-3.5 w-3.5" /> },
      { keys: ['Enter'], key: 'sc.enter', icon: <CornerDownLeft className="h-3.5 w-3.5" /> },
    ],
  },
  {
    labelKey: 'sc.group.palette',
    icon: <Command className="h-3 w-3" />,
    rows: [
      { keys: ['j', 'k'], key: 'sc.paletteNav', icon: <ListChecks className="h-3.5 w-3.5" /> },
      { keys: ['Enter'], key: 'sc.enter', icon: <CornerDownLeft className="h-3.5 w-3.5" /> },
    ],
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-7 items-center justify-center rounded-md border border-border bg-muted px-1.5 py-1 font-mono text-[11px] font-semibold text-foreground shadow-sm">
      {children}
    </kbd>
  );
}

/**
 * Keyboard shortcuts cheat-sheet, grouped by area (General / Catalog /
 * Palette). Opens via the global "?" hotkey or the keyboard icon in the
 * header / palette.
 */
export function ShortcutsDialog() {
  const { shortcutsOpen, setShortcutsOpen } = useUiStore();
  const { t } = useI18n();

  /* Global hotkey: "?" (Shift+/) — ignore typing contexts. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '?' || e.metaKey || e.ctrlKey || e.altKey) return;
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
      setShortcutsOpen(!useUiStore.getState().shortcutsOpen);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setShortcutsOpen]);

  return (
    <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border p-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Keyboard className="h-4 w-4 text-primary" />
            {t('shortcuts.title')}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs">
            {t('shortcuts.desc')}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4 scrollbar-thin">
          {GROUPS.map((group) => (
            <section key={group.labelKey} aria-label={t(group.labelKey)}>
              <div className="mb-2">
                <h4 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                  <span className="text-primary/70">{group.icon}</span>
                  {t(group.labelKey)}
                </h4>
                <div className="mt-1.5 h-px bg-border/70" />
              </div>
              <ul className="space-y-0.5">
                {group.rows.map((row) => (
                  <li
                    key={`${group.labelKey}:${row.key}:${row.keys.join()}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-accent/60"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                      <span className="shrink-0 text-primary/70">{row.icon}</span>
                      <span className="min-w-0">{t(row.key)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      {row.keys.map((k) => (
                        <Kbd key={k}>{k}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
