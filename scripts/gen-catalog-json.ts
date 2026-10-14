/**
 * Generates public/toolkit-catalog.json — the full toolkit catalog (with file
 * contents) in the same shape as GET /api/toolkit, so the site can run on
 * static hosting (GitHub Pages) where no server-side routes exist.
 *
 * Run: bun scripts/gen-catalog-json.ts
 * The GitHub Pages workflow runs this right before `next build`.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadToolkitCatalog } from '../src/lib/toolkit';

const out = { success: true, data: loadToolkitCatalog() };

mkdirSync('public', { recursive: true });
writeFileSync('public/toolkit-catalog.json', JSON.stringify(out), 'utf8');

const d = out.data;
console.log(
  `toolkit-catalog.json written: ${d.totalItems} items, ${d.categories.length} categories, ${(
    JSON.stringify(out).length / 1024
  ).toFixed(1)} KB`,
);
