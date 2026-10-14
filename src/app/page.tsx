import { ToolkitHeader } from '@/components/toolkit/header';
import { ToolkitHero } from '@/components/toolkit/hero';
import { ConfigOfTheDay } from '@/components/toolkit/config-of-the-day';
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
import { pickForDate, mskDateISO, type DailyItem } from '@/lib/daily';
import type { ToolkitCatalog } from '@/lib/toolkit-types';

/**
 * Slim DailyItem snapshots of every config — passed to the client so the
 * «config of the day» carousel can recompute picks for neighbouring days
 * with the same deterministic hash (no extra network round-trips).
 */
function toDailyItems(catalog: ToolkitCatalog | null): DailyItem[] {
  if (!catalog) return [];
  return catalog.categories.flatMap((c) =>
    c.items.map((item) => ({
      path: item.path,
      name: item.name,
      title: item.title,
      description: item.description,
      category: item.category,
      lines: item.lines,
    })),
  );
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

  const dailyItems = toDailyItems(catalog);
  const todayISO = mskDateISO();
  const todayItem = pickForDate(dailyItems, todayISO);

  return (
    <div className="flex min-h-screen flex-col">
      <ToolkitHeader />
      <main className="flex-1">
        <ToolkitHero catalog={catalog} />
        <ConfigOfTheDay initialItem={todayItem} dateISO={todayISO} items={dailyItems} />
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
