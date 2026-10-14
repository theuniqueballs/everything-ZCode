'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ezc-favorites';
const EMPTY: string[] = [];

/** Module-level cache so useSyncExternalStore always returns a stable reference. */
let cache: string[] = EMPTY;
let primed = false;
const listeners = new Set<() => void>();

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
    return EMPTY;
  } catch {
    return EMPTY;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

function getSnapshot(): string[] {
  // Prime the cache lazily on first read (runs outside render body).
  if (!primed && typeof window !== 'undefined') {
    primed = true;
    cache = readStorage();
  }
  return cache;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function writeFavorites(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — keep in-memory only
  }
  listeners.forEach((l) => l());
}

/** Favorites persisted in localStorage. Hydration-safe via useSyncExternalStore. */
export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((path: string) => {
    const current = getSnapshot();
    writeFavorites(
      current.includes(path) ? current.filter((p) => p !== path) : [...current, path]
    );
  }, []);

  const isFavorite = useCallback((path: string) => favorites.includes(path), [favorites]);

  /**
   * Merge a batch of paths into favorites (dedup, order preserved).
   * Returns how many paths were actually new.
   */
  const importMany = useCallback((paths: string[]) => {
    const current = getSnapshot();
    const fresh = paths.filter((p) => !current.includes(p));
    if (fresh.length > 0) writeFavorites([...current, ...fresh]);
    return fresh.length;
  }, []);

  return { favorites, toggle, isFavorite, importMany };
}
