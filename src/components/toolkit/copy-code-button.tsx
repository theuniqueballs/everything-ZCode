'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

/** Floating copy button for code blocks in the markdown viewer. */
export function CopyCodeButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label="Скопировать код"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success('Код скопирован');
          setTimeout(() => setCopied(false), 1400);
        } catch {
          toast.error('Не удалось скопировать');
        }
      }}
      className="absolute right-2.5 top-2.5 z-10 rounded-md border border-white/10 bg-white/10 p-1.5 text-white/80 opacity-0 backdrop-blur transition-all hover:bg-white/20 hover:text-white focus-visible:opacity-100 group-hover/code:opacity-100"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
