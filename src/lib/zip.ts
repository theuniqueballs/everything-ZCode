'use client';

import JSZip from 'jszip';
import { toast } from 'sonner';
import type { ToolkitItem } from './toolkit-types';
import { getLang, translate } from './i18n';

/** Trigger a client-side download of a text blob. */
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Build a ZIP archive from toolkit items preserving their relative
 * toolkit/ paths, then trigger a client-side download.
 */
export async function downloadItemsZip(items: ToolkitItem[], zipName: string) {
  const lang = getLang();
  if (items.length === 0) {
    toast.error(translate(lang, 'toast.zipEmpty'));
    return;
  }
  try {
    const zip = new JSZip();
    for (const item of items) {
      zip.file(item.path, item.content);
    }
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    downloadBlob(blob, zipName);
    toast.success(translate(lang, 'toast.zipDownloaded', { name: zipName, n: items.length }));
  } catch {
    toast.error(translate(lang, 'toast.zipFailed'));
  }
}

/**
 * Parse a favorites JSON (our export format, or a plain array of paths /
 * of {path} objects). Returns a deduped list of paths, or null on
 * structurally invalid input.
 */
export function parseFavoritesImport(text: string): string[] | null {
  try {
    const data: unknown = JSON.parse(text);
    const list = Array.isArray(data)
      ? data
      : data && typeof data === 'object' && Array.isArray((data as { favorites?: unknown }).favorites)
        ? (data as { favorites: unknown[] }).favorites
        : null;
    if (!list) return null;
    const paths = list
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') {
          const path = (entry as { path?: unknown }).path;
          if (typeof path === 'string') return path;
        }
        return null;
      })
      .filter((p): p is string => typeof p === 'string' && p.length > 0);
    return Array.from(new Set(paths));
  } catch {
    return null;
  }
}

/**
 * Export the favorites list as JSON: paths + resolved metadata.
 * Handy for sharing a curated config set or re-import later.
 */
export function downloadFavoritesJson(
  favoritePaths: string[],
  allItems: ToolkitItem[],
) {
  const lang = getLang();
  if (favoritePaths.length === 0) {
    toast.error(translate(lang, 'toast.favEmpty'));
    return;
  }
  const byPath = new Map(allItems.map((item) => [item.path, item]));
  const payload = {
    app: 'everything-zcode',
    exportedAt: new Date().toISOString(),
    count: favoritePaths.length,
    favorites: favoritePaths.map((path) => {
      const item = byPath.get(path);
      return {
        path,
        name: item?.name ?? null,
        category: item?.category ?? null,
        title: item?.title ?? null,
        lines: item?.lines ?? null,
        bytes: item?.size ?? null,
      };
    }),
  };
  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, 'ezc-favorites.json');
    toast.success(translate(lang, 'toast.favExported', { n: favoritePaths.length }));
  } catch {
    toast.error(translate(lang, 'toast.favExportFailed'));
  }
}
