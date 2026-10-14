'use client';

import { create } from 'zustand';
import type { ToolkitCatalog } from './toolkit-types';

/**
 * Shared UI state between the command palette, header and catalog section.
 * Keeps cross-component flows (open config X, trigger random) decoupled.
 */
interface UiState {
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  /** Request the catalog to open/scroll to this config path (consumed once). */
  requestPath: string | null;
  setRequestPath: (path: string | null) => void;
  /** Increment to trigger "random config" in the catalog (consumed once). */
  requestRandom: number;
  triggerRandom: () => void;
  /** Request the catalog to toggle the favorites filter view (consumed once). */
  requestFavorites: number;
  triggerFavorites: () => void;
  /** Shared catalog cache so the palette doesn't re-fetch. */
  catalog: ToolkitCatalog | null;
  setCatalog: (catalog: ToolkitCatalog | null) => void;
  /** Compare dialog (diff between two configs). */
  compareOpen: boolean;
  compareInitPath: string | null;
  /** Open compare with an optional pre-filled base config. */
  openCompare: (path?: string | null) => void;
  setCompareOpen: (open: boolean) => void;
  /** Keyboard shortcuts cheat-sheet (?) */
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  paletteOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  requestPath: null,
  setRequestPath: (requestPath) => set({ requestPath }),
  requestRandom: 0,
  triggerRandom: () => set((s) => ({ requestRandom: s.requestRandom + 1 })),
  requestFavorites: 0,
  triggerFavorites: () => set((s) => ({ requestFavorites: s.requestFavorites + 1 })),
  catalog: null,
  setCatalog: (catalog) => set({ catalog }),
  compareOpen: false,
  compareInitPath: null,
  openCompare: (path) => set({ compareInitPath: path ?? null, compareOpen: true }),
  setCompareOpen: (compareOpen) => set({ compareOpen }),
  shortcutsOpen: false,
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
}));
