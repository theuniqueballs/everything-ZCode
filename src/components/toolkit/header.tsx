'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Github, Terminal, Command, Keyboard } from 'lucide-react';
import { useUiStore } from '@/lib/store';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const NAV = [
  { href: '#catalog', label: 'Каталог' },
  { href: '#concepts', label: 'Концепты' },
  { href: '#install', label: 'Установка' },
  { href: '#principles', label: 'Принципы' },
];

export function ToolkitHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const setPaletteOpen = useUiStore((s) => s.setPaletteOpen);
  const setShortcutsOpen = useUiStore((s) => s.setShortcutsOpen);
  const progressRef = useRef<HTMLDivElement>(null);

  /* Scroll progress bar — direct DOM write via rAF, no re-renders. */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = progressRef.current;
      if (!el) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="group flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-mono text-lg font-bold text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            Z
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-sm font-bold tracking-tight">Everything ZCode</span>
            <span className="truncate text-[11px] text-muted-foreground">
              конфиги для Z.ai Code
            </span>
          </span>
        </a>

        <nav aria-label="Основная навигация" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaletteOpen(true)}
            aria-label="Открыть палитру команд (Cmd+K)"
            title="Палитра команд — ⌘K"
            className="hidden items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground md:flex"
          >
            <Command className="h-3.5 w-3.5" />
            Поиск
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
          <Badge variant="outline" className="hidden font-mono text-[11px] text-primary sm:inline-flex">
            v1.6
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Горячие клавиши (?)"
                onClick={() => setShortcutsOpen(true)}
              >
                <Keyboard className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Горячие клавиши — ?</TooltipContent>
          </Tooltip>
          <a
            href="https://github.com/worldflowai/everything-claude-code"
            target="_blank"
            rel="noreferrer"
            aria-label="Референс-репозиторий на GitHub"
            className="hidden sm:block"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Github className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Референс: everything-claude-code</TooltipContent>
            </Tooltip>
          </a>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Переключить тему"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="hidden h-4 w-4 dark:block" />
                <Moon className="h-4 w-4 dark:hidden" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Светлая / тёмная тема</TooltipContent>
          </Tooltip>
          <a href="#catalog" className="hidden lg:block">
            <Button size="sm" className="h-9 gap-1.5">
              <Terminal className="h-3.5 w-3.5" />
              Открыть каталог
            </Button>
          </a>
        </div>
      </div>

      {/* Scroll progress indicator */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gradient-to-r from-primary via-primary/80 to-primary/40"
        ref={progressRef}
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Mobile nav */}
      <div className="border-t border-border/60 md:hidden">
        <nav aria-label="Мобильная навигация" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 scrollbar-thin">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
