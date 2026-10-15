'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Favorites + named collections, persisted in localStorage.
 *
 * Data model (key «ezc-collections»):
 *   { version: 1, active: string, sets: Record<name, path[]> }
 *
 * Backward compatibility:
 *  - The legacy key «ezc-favorites» (plain string[]) is migrated once into
 *    a default collection, then kept as a live mirror of the ACTIVE set so
 *    the JSON export/import flow and any legacy readers keep working.
 *  - All existing favorites behavior (toggle / isFavorite / importMany)
 *    transparently operates on the currently active collection.
 */

const STORAGE_KEY = 'ezc-collections';
const LEGACY_KEY = 'ezc-favorites';
const DEFAULT_NAME = 'Избранное';

interface CollectionsData {
  version: 1;
  active: string;
  sets: Record<string, string[]>;
}

const EMPTY_LIST: string[] = [];
const NO_COLLECTIONS: string[] = [];

/** Module-level cache so useSyncExternalStore always returns a stable reference. */
let cache: CollectionsData | null = null;
let primed = false;
const listeners = new Set<() => void>();

function sanitizeList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

function sanitizeData(raw: unknown): CollectionsData | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as { version?: unknown; active?: unknown; sets?: unknown };
  if (data.version !== 1 || typeof data.active !== 'string' || !data.sets || typeof data.sets !== 'object') {
    return null;
  }
  const sets: Record<string, string[]> = {};
  for (const [name, list] of Object.entries(data.sets as Record<string, unknown>)) {
    if (typeof name === 'string' && name.trim()) sets[name] = sanitizeList(list);
  }
  if (!sets[data.active]) return null;
  return { version: 1, active: data.active, sets };
}

/** First read: migrate legacy favorites into the default collection. */
function readStorage(): CollectionsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = sanitizeData(JSON.parse(raw));
      if (parsed) return parsed;
    }
    // Legacy migration: ezc-favorites (string[]) → default collection
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    const legacy = legacyRaw ? sanitizeList(JSON.parse(legacyRaw)) : [];
    const data: CollectionsData = { version: 1, active: DEFAULT_NAME, sets: { [DEFAULT_NAME]: legacy } };
    persist(data);
    return data;
  } catch {
    return { version: 1, active: DEFAULT_NAME, sets: { [DEFAULT_NAME]: [] } };
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

function getSnapshot(): CollectionsData {
  if (!primed && typeof window !== 'undefined') {
    primed = true;
    cache = readStorage();
  }
  return cache ?? SERVER_SNAPSHOT;
}

/** Stable server snapshot — useSyncExternalStore requires a cached reference. */
const SERVER_SNAPSHOT: CollectionsData = {
  version: 1,
  active: DEFAULT_NAME,
  sets: { [DEFAULT_NAME]: [] },
};

function getServerSnapshot(): CollectionsData {
  return SERVER_SNAPSHOT;
}

/** Keep the legacy mirror in sync so export/import and old readers work. */
function persist(data: CollectionsData) {
  cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(data.sets[data.active] ?? []));
  } catch {
    // storage unavailable — keep in-memory only
  }
  listeners.forEach((l) => l());
}

function mutate(fn: (data: CollectionsData) => CollectionsData) {
  const next = fn(getSnapshot());
  persist(next);
}

/** Favorites (active collection) persisted in localStorage. Hydration-safe. */
export function useFavorites() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const favorites = data.sets[data.active] ?? EMPTY_LIST;

  const toggle = useCallback((path: string) => {
    mutate((d) => {
      const list = d.sets[d.active] ?? [];
      const next = list.includes(path) ? list.filter((p) => p !== path) : [...list, path];
      return { ...d, sets: { ...d.sets, [d.active]: next } };
    });
  }, []);

  const isFavorite = useCallback((path: string) => favorites.includes(path), [favorites]);

  /**
   * Merge a batch of paths into the active collection (dedup, order preserved).
   * Returns how many paths were actually new.
   */
  const importMany = useCallback((paths: string[]) => {
    const current = getSnapshot().sets[getSnapshot().active] ?? [];
    const fresh = paths.filter((p) => !current.includes(p));
    if (fresh.length > 0) {
      mutate((d) => ({
        ...d,
        sets: { ...d.sets, [d.active]: [...(d.sets[d.active] ?? []), ...fresh] },
      }));
    }
    return fresh.length;
  }, []);

  /* ---- Collections management ---- */

  const collectionNames = Object.keys(data.sets);
  const activeCollection = data.active;

  const selectCollection = useCallback((name: string) => {
    mutate((d) => (d.sets[name] ? { ...d, active: name } : d));
  }, []);

  const createCollection = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 48);
    if (!trimmed) return false;
    let created = false;
    mutate((d) => {
      if (d.sets[trimmed]) return d;
      created = true;
      return { version: d.version, active: trimmed, sets: { ...d.sets, [trimmed]: [] } };
    });
    return created;
  }, []);

  const renameCollection = useCallback((oldName: string, name: string) => {
    const trimmed = name.trim().slice(0, 48);
    if (!trimmed || trimmed === oldName) return false;
    let renamed = false;
    mutate((d) => {
      if (!d.sets[oldName] || d.sets[trimmed]) return d;
      const sets: Record<string, string[]> = {};
      for (const [key, list] of Object.entries(d.sets)) {
        sets[key === oldName ? trimmed : key] = list;
      }
      renamed = true;
      return { version: d.version, active: d.active === oldName ? trimmed : d.active, sets };
    });
    return renamed;
  }, []);

  /** Delete a collection; if it was active, fall back to the first remaining. */
  const deleteCollection = useCallback((name: string) => {
    mutate((d) => {
      if (!d.sets[name] || Object.keys(d.sets).length <= 1) return d;
      const sets: Record<string, string[]> = {};
      for (const [key, list] of Object.entries(d.sets)) {
        if (key !== name) sets[key] = list;
      }
      const active = d.active === name ? Object.keys(sets)[0] : d.active;
      return { version: 1, active, sets };
    });
  }, []);

  return {
    favorites,
    toggle,
    isFavorite,
    importMany,
    collectionNames,
    collectionsMap: data.sets,
    activeCollection,
    selectCollection,
    createCollection,
    renameCollection,
    deleteCollection,
  };
}
