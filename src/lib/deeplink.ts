'use client';

/**
 * URL deep-linking for the catalog.
 * Hash format: #item=<url-encoded toolkit path>, e.g. #item=commands%2Ftdd.md
 */

export function itemHash(path: string): string {
  return `#item=${encodeURIComponent(path)}`;
}

/** Read the currently linked item path from the URL hash (or null). */
export function readItemHash(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.startsWith('#item=')) return null;
  try {
    const path = decodeURIComponent(hash.slice('#item='.length));
    return path || null;
  } catch {
    return null;
  }
}

/** Replace the hash without adding history entries or scrolling. */
export function replaceItemHash(path: string | null) {
  if (typeof window === 'undefined') return;
  const next = path ? itemHash(path) : '';
  const url = window.location.pathname + window.location.search + next;
  window.history.replaceState(null, '', url);
}
