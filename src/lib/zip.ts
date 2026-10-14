'use client';

import JSZip from 'jszip';
import { toast } from 'sonner';
import type { ToolkitItem } from './toolkit-types';

/**
 * Build a ZIP archive from toolkit items preserving their relative
 * toolkit/ paths, then trigger a client-side download.
 */
export async function downloadItemsZip(items: ToolkitItem[], zipName: string) {
  if (items.length === 0) {
    toast.error('Нет файлов для архивации');
    return;
  }
  try {
    const zip = new JSZip();
    for (const item of items) {
      zip.file(item.path, item.content);
    }
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Скачано: ${zipName} (${items.length} файлов)`);
  } catch {
    toast.error('Не удалось собрать ZIP-архив');
  }
}
