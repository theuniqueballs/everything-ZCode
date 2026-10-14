'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hint } from './hint';
import {
  FileText,
  Cpu,
  Wrench,
  Star,
  Copy,
  Check,
  Download,
  Link2,
  ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatBytes } from '@/lib/frontmatter';
import { itemHash } from '@/lib/deeplink';
import { IS_STATIC_EXPORT } from '@/lib/env';
import { useI18n } from '@/lib/i18n';
import type { ToolkitItem } from '@/lib/toolkit-types';
import { cn } from '@/lib/utils';

/** Trigger a plain-text download of a toolkit file (client-only). */
export function downloadItem(item: ToolkitItem) {
  const ext = item.path.endsWith('.json') ? 'json' : item.path.endsWith('.js') ? 'js' : 'md';
  const fileName = item.name.replace(/[^\w.-]+/g, '-') + '.' + ext;
  const blob = new Blob([item.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${fileName} ↓`);
}

/** Lines · size · model · tools badges, shared by preview panel and detail sheet. */
export function MetaBadges({ item }: { item: ToolkitItem }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
        <FileText className="h-3 w-3" />
        {item.lines} {t('catalog.lines')} · {formatBytes(item.size)}
      </Badge>
      {item.meta.model && (
        <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
          <Cpu className="h-3 w-3" />
          {item.meta.model}
        </Badge>
      )}
      {item.meta.tools && (
        <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
          <Wrench className="h-3 w-3" />
          {item.meta.tools}
        </Badge>
      )}
    </div>
  );
}

function useCopy() {
  const { t } = useI18n();
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const copy = async (text: string, path: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPath(path);
      toast.success(t('toast.copied'));
      setTimeout(() => setCopiedPath((p) => (p === path ? null : p)), 1500);
    } catch {
      toast.error(t('toast.copyFailed'));
    }
  };
  return { copiedPath, copy };
}

/** Copy / download / share / favorite action cluster for a single config. */
export function ItemActions({
  item,
  isFavorite,
  onToggleFavorite,
}: {
  item: ToolkitItem;
  isFavorite: boolean;
  onToggleFavorite: (path: string) => void;
}) {
  const { t } = useI18n();
  const { copiedPath, copy } = useCopy();
  const copied = copiedPath === item.path;

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}${itemHash(item.path)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('toast.linkCopied'));
    } catch {
      toast.error(t('toast.linkCopyFailed'));
    }
  };
  const shareOg = async () => {
    const url = `${window.location.origin}/api/og?item=${encodeURIComponent(item.path)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('toast.ogCopied'));
    } catch {
      toast.error(t('toast.linkCopyFailed'));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Hint label={t('item.copyLink')}>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0 transition-colors"
          aria-label={t('item.copyLink')}
          onClick={share}
        >
          <Link2 className="h-3.5 w-3.5 transition-colors" />
        </Button>
      </Hint>
      {!IS_STATIC_EXPORT && (
        <Hint label={t('item.copyOg')}>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 transition-colors"
            aria-label={t('item.copyOg')}
            onClick={shareOg}
          >
            <ImageIcon className="h-3.5 w-3.5 transition-colors" />
          </Button>
        </Hint>
      )}
      <Hint label={isFavorite ? t('item.favRemove') : t('item.favAdd')}>
        <Button
          size="sm"
          variant={isFavorite ? 'default' : 'outline'}
          className={cn('h-8 w-8 p-0 transition-colors', isFavorite && 'text-primary-foreground')}
          aria-label={isFavorite ? t('item.favRemove') : t('item.favAdd')}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.path);
          }}
        >
          <Star
            className={cn('h-3.5 w-3.5 transition-colors', isFavorite && 'fill-current text-yellow-400')}
          />
        </Button>
      </Hint>
      <Hint label={copied ? t('item.done') : t('item.copyConfig')}>
        <Button
          size="sm"
          variant={copied ? 'secondary' : 'default'}
          className="h-8 gap-1.5 transition-colors"
          onClick={() => copy(item.content, item.path)}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary transition-colors" />
          ) : (
            <Copy className="h-3.5 w-3.5 transition-colors" />
          )}
          {copied ? t('item.copied') : t('item.copy')}
        </Button>
      </Hint>
      <Hint label={t('item.downloadName', { name: item.name })}>
        <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => downloadItem(item)}>
          <Download className="h-3.5 w-3.5" />
          {t('item.download')}
        </Button>
      </Hint>
    </div>
  );
}
