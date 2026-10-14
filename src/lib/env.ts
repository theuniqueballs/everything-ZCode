/**
 * Build-environment flags shared by client components.
 * NEXT_PUBLIC_* values are inlined at build time — safe on the client.
 *
 * GitHub Pages deployment (NEXT_PUBLIC_STATIC_EXPORT=1):
 *  - the catalog is pre-generated into /toolkit-catalog.json (scripts/gen-catalog-json.ts)
 *  - dynamic /api/* routes are unavailable and hidden in the UI
 *  - all URLs must be prefixed with the repository basePath (/everything-ZCode)
 */
export const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';

export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** URL that serves the full toolkit catalog (with file contents) as JSON. */
export function toolkitDataUrl(): string {
  return IS_STATIC_EXPORT ? `${BASE_PATH}/toolkit-catalog.json` : '/api/toolkit';
}

/** Repo the site is deployed from (used for "view source" links). */
export const GITHUB_REPO = 'https://github.com/theuniqueballs/everything-ZCode';

/** Permanent URL of a toolkit file on GitHub (works both in dev and Pages). */
export function githubFileUrl(path: string): string {
  return `${GITHUB_REPO}/blob/main/toolkit/${path}`;
}
