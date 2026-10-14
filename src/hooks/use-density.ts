'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type ListDensity = 'comfortable' | 'compact';

const STORAGE_KEY = 'ezc-density';
const DEFAULT: ListDensity = 'comfortable';

let cache: ListDensity = DEFAULT;
let primed = false;
const listeners = new Set<() => void>();

function readStorage(): ListDensity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === 'compact' ? 'compact' : DEFAULT;
  } catch {
    return DEFAULT;
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

function getSnapshot(): ListDensity {
  if (!primed && typeof window !== 'undefined') {
    primed = true;
    cache = readStorage();
  }
  return cache;
}

function getServerSnapshot(): ListDensity {
  return DEFAULT;
}

function write(next: ListDensity) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // storage unavailable — keep in-memory only
  }
  listeners.forEach((l) => l());
}

/** Persisted catalog list density (comfortable | compact). Hydration-safe. */
export function useDensity() {
  const density = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const set = useCallback((d: ListDensity) => write(d), []);
  const toggle = useCallback(
    () => write(getSnapshot() === 'compact' ? 'comfortable' : 'compact'),
    []
  );
  return { density, set, toggle };
}
