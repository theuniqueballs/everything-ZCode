import { ToolkitHeader } from '@/components/toolkit/header';
import { ToolkitHero } from '@/components/toolkit/hero';
import { ConfigOfTheDay, type DailyItem } from '@/components/toolkit/config-of-the-day';
import { ToolkitCatalogSection } from '@/components/toolkit/catalog';
import { ToolkitStats } from '@/components/toolkit/stats';
import { ToolkitConcepts } from '@/components/toolkit/concepts';
import { CommandPalette } from '@/components/toolkit/command-palette';
import { CompareDialog } from '@/components/toolkit/compare-dialog';
import { ShortcutsDialog } from '@/components/toolkit/shortcuts-dialog';
import { BackToTop } from '@/components/toolkit/back-to-top';
import { ToolkitInstall } from '@/components/toolkit/install';
import { ToolkitPrinciples } from '@/components/toolkit/best-practices';
import { ToolkitFooter } from '@/components/toolkit/footer';
import { loadToolkitCatalog } from '@/lib/toolkit';
import type { ToolkitCatalog } from '@/lib/toolkit-types';

/**
 * Deterministic «config of the day»: hash of the Europe/Moscow calendar date
 * (YYYY-MM-DD) selects one config — same for all visitors, rotates at midnight MSK.
 */
function pickDailyItem(catalog: ToolkitCatalog | null): DailyItem | null {
  if (!catalog || catalog.totalItems === 0) return null;
  const all = catalog.categories.flatMap((c) => c.items);
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow' }).format(new Date());
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const item = all[hash % all.length];
  return {
    path: item.path,
    name: item.name,
    title: item.title,
    description: item.description,
    category: item.category,
    lines: item.lines,
  };
}

/**
 * The Europe/Moscow calendar date (YYYY-MM-DD) used for the daily pick;
 * the human label is formatted client-side in the active UI language.
 */
function dailyDateISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow' }).format(new Date());
}

/**
 * Server component: pre-loads the catalog on the server so the hero stats
 * render instantly; the client catalog section re-fetches for interactivity.
 */
export default function Home() {
  let catalog: ToolkitCatalog | null = null;
  try {
    catalog = loadToolkitCatalog();
  } catch (error) {
    console.error('Failed to preload toolkit catalog:', error);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ToolkitHeader />
      <main className="flex-1">
        <ToolkitHero catalog={catalog} />
        <ConfigOfTheDay item={pickDailyItem(catalog)} dateISO={dailyDateISO()} />
        <ToolkitCatalogSection />
        <ToolkitStats catalog={catalog} />
        <ToolkitConcepts />
        <ToolkitInstall catalog={catalog} />
        <ToolkitPrinciples />
      </main>
      <ToolkitFooter />
      <CommandPalette />
      <CompareDialog />
      <ShortcutsDialog />
      <BackToTop />
    </div>
  );
}
