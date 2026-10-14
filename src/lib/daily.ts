import type { ToolkitCategoryId } from './toolkit-types';

/**
 * Deterministic «config of the day» engine.
 * Pure functions shared by the server (SSR pick) and the client (carousel
 * navigation across dates). Same date ⇒ same config for every visitor;
 * rotates at midnight Europe/Moscow.
 */

/** Plain-data snapshot of a picked config (no markdown content). */
export interface DailyItem {
  path: string;
  name: string;
  title: string;
  description: string;
  category: ToolkitCategoryId;
  lines: number;
}

/** Minimal shape the picker needs from a catalog item. */
export interface PickableItem {
  path: string;
  name: string;
  title: string;
  description: string;
  category: ToolkitCategoryId;
  lines: number;
}

/** Stable 32-bit string hash (same as Java's hashCode). */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * The Europe/Moscow calendar date (YYYY-MM-DD), optionally shifted by
 * a whole number of days (negative = past, positive = future).
 * Shifting happens on the instant before formatting, so DST is safe.
 */
export function mskDateISO(offsetDays = 0): string {
  const instant = Date.now() + offsetDays * 86_400_000;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Moscow' }).format(
    new Date(instant),
  );
}

/** Deterministic pick for a given calendar date string. */
export function pickForDate<T extends PickableItem>(
  items: T[],
  dateStr: string,
): T | null {
  if (items.length === 0) return null;
  const index = hashString(dateStr) % items.length;
  return items[index];
}

/** Shift a YYYY-MM-DD date string by whole days (UTC-noon anchored, DST-safe). */
export function shiftDateISO(dateISO: string, offsetDays: number): string {
  const base = new Date(`${dateISO}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() + offsetDays);
  return base.toISOString().slice(0, 10);
}

/** Map a date offset to a human relative label key fragment. */
export function relativeDayKind(offset: number): 'today' | 'yesterday' | 'tomorrow' | 'past' | 'future' {
  if (offset === 0) return 'today';
  if (offset === -1) return 'yesterday';
  if (offset === 1) return 'tomorrow';
  return offset < 0 ? 'past' : 'future';
}
