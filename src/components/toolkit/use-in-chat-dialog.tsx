'use client';

import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, ExternalLink, Info, MessagesSquare, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';
import { buildChatPrompt, nativeInstallHint, webchatSupport } from '@/lib/webchat';
import type { ToolkitItem } from '@/lib/toolkit-types';

const CHAT_URL = 'https://chat.z.ai';

/**
 * "Use in chat" dialog — converts a catalog config into a paste-ready
 * prompt for web chats (SuperZ on chat.z.ai, or any other assistant).
 * Pure client-side: works identically on dev and the static Pages build.
 */
export function UseInChatDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ToolkitItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const support = webchatSupport(item.category);
  const prompt = useMemo(() => (open ? buildChatPrompt(item) : ''), [item, open]);
  const native = nativeInstallHint(item);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast.success(t('toast.copied'));
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t('toast.copyFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 space-y-1.5 border-b border-border bg-muted/30 p-5 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessagesSquare className="h-4 w-4" />
            </span>
            {t('chat.title')}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <span className="truncate">{item.name}</span>
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-muted-foreground">
              {support === 'partial' ? t('chat.badgePartial') : t('chat.badgeFull')}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin">
          {/* Support note */}
          <p className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {support === 'partial' ? t('chat.notePartial') : t('chat.noteFull')}
          </p>

          {/* How-to steps */}
          <ol className="space-y-2 text-xs leading-relaxed">
            {(['chat.step1', 'chat.step2', 'chat.step3'] as const).map((key, i) => (
              <li key={key} className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{t(key)}</span>
              </li>
            ))}
          </ol>

          {/* Generated prompt */}
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
              <span className="font-mono text-[11px] text-muted-foreground">
                {t('chat.promptLabel')}
              </span>
              <Badge variant="secondary" className="font-mono text-[10px]">
                {prompt.length} chars
              </Badge>
            </div>
            <pre className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words bg-zinc-950 p-3 font-mono text-[11px] leading-relaxed text-zinc-100 scrollbar-thin dark:bg-black/60">
              {prompt}
            </pre>
          </div>

          {/* Native ZCode install alternative */}
          {native && (
            <div className="flex items-start gap-2 rounded-lg border border-dashed border-border p-3 text-xs leading-relaxed text-muted-foreground">
              <FolderOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0">
                <span className="font-medium text-foreground">{t('chat.native')}</span>
                <br />
                {t(native.mode === 'merge' ? 'chat.nativeHintMerge' : 'chat.nativeHintPlace', {
                  path: native.path,
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-muted/30 p-4">
          <Button variant="outline" size="sm" className="h-9 gap-1.5" asChild>
            <a href={CHAT_URL} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              {t('chat.openChat')}
            </a>
          </Button>
          <Button size="sm" className="h-9 gap-1.5" onClick={copyPrompt}>
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? t('item.copied') : t('chat.copyPrompt')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
