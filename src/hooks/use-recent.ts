'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ezc-recent';
const MAX_ITEMS = 8;
const EMPTY: string[] = [];

/** Persisted "recently viewed" paths (newest first, capped at MAX_ITEMS). */
let cache: string[] = EMPTY;
let primed = false;
const listeners = new Set<() => void>();

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === 'string').slice(0, MAX_ITEMS);
    }
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
  if (!primed && typeof window !== 'undefined') {
    primed = true;
    cache = readStorage();
  }
  return cache;
}

function getServerSnapshot(): string[] {
  return EMPTY;
}

function writeRecent(next: string[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — keep in-memory only
  }
  listeners.forEach((l) => l());
}

/** Recently-viewed configs persisted in localStorage. Hydration-safe. */
export function useRecent() {
  const recent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /** Record a view: moves path to front, dedupes, caps the list. */
  const push = useCallback((path: string) => {
    const current = getSnapshot();
    const next = [path, ...current.filter((p) => p !== path)].slice(0, MAX_ITEMS);
    writeRecent(next);
  }, []);

  const clear = useCallback(() => writeRecent(EMPTY), []);

  return { recent, push, clear };
}
