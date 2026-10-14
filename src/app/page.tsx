import { ToolkitHeader } from '@/components/toolkit/header';
import { ToolkitHero } from '@/components/toolkit/hero';
import { ToolkitConcepts } from '@/components/toolkit/concepts';
import { ToolkitCatalogSection } from '@/components/toolkit/catalog';
import { CommandPalette } from '@/components/toolkit/command-palette';
import { ToolkitInstall } from '@/components/toolkit/install';
import { ToolkitPrinciples } from '@/components/toolkit/best-practices';
import { ToolkitFooter } from '@/components/toolkit/footer';
import { loadToolkitCatalog } from '@/lib/toolkit';
import type { ToolkitCatalog } from '@/lib/toolkit-types';

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
        <ToolkitCatalogSection />
        <ToolkitConcepts />
        <ToolkitInstall catalog={catalog} />
        <ToolkitPrinciples />
      </main>
      <ToolkitFooter />
      <CommandPalette />
    </div>
  );
}
