'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Copy, Download, FolderDown, Package, Terminal, FileArchive, MessagesSquare } from 'lucide-react';
import type { ToolkitCatalog } from '@/lib/toolkit-types';
import { downloadItemsZip } from '@/lib/zip';
import { toolkitDataUrl } from '@/lib/env';
import { useI18n } from '@/lib/i18n';
import { StaggerGroup, StaggerItem } from './motion-primitives';
import { SectionHeading } from './section-heading';

const STEPS = [
  {
    n: 1,
    icon: FolderDown,
    key: 's1',
    codeRu: `# Вариант А: ZIP из палитры (⌘K) или кнопки «Весь тулкит»
unzip everything-zcode-toolkit.zip

# Вариант Б: точечно из каталога
# Агенты
cp agents/*.md ~/.zcode/agents/

# Правила
cp rules/*.md ~/.zcode/rules/

# Команды
cp commands/*.md ~/.zcode/commands/

# Скиллы (папки!)
cp -r skills/* ~/.zcode/skills/`,
    codeEn: `# Option A: ZIP from the palette (⌘K) or the "Full toolkit" button
unzip everything-zcode-toolkit.zip

# Option B: pick files from the catalog
# Agents
cp agents/*.md ~/.zcode/agents/

# Rules
cp rules/*.md ~/.zcode/rules/

# Commands
cp commands/*.md ~/.zcode/commands/

# Skills (folders!)
cp -r skills/* ~/.zcode/skills/`,
  },
  {
    n: 2,
    icon: Terminal,
    key: 's2',
    codeRu: `# Укажите корень тулкита
export ZCODE_PLUGIN_ROOT=/path/to/everything-zcode/toolkit

# Слейте hooks/hooks.json в настройки ZCode:
#   SessionStart  → tail worklog.md (память)
#   PreToolUse    → блок "next build", rm -rf /
#   PostToolUse   → подсказка про lint каждые 10 правок
#   Stop          → напоминание о checkpoint`,
    codeEn: `# Point at the toolkit root
export ZCODE_PLUGIN_ROOT=/path/to/everything-zcode/toolkit

# Merge hooks/hooks.json into your ZCode settings:
#   SessionStart  → tail worklog.md (memory)
#   PreToolUse    → block "next build", rm -rf /
#   PostToolUse   → lint nudge every 10 edits
#   Stop          → checkpoint reminder`,
  },
  {
    n: 3,
    icon: Package,
    key: 's3',
    codeRu: `# Привычка 1 — внешняя память:
#   каждая сессия начинается с чтения worklog.md
#   и заканчивается handover-секцией в нём

# Привычка 2 — верификация:
#   lint → dev.log → браузер (golden path)
#   фича без прогона по циклу = не сделана`,
    codeEn: `# Habit 1 — external memory:
#   every session starts by reading worklog.md
#   and ends with a handover section in it

# Habit 2 — verification:
#   lint → dev.log → browser (golden path)
#   a feature without the loop = not done`,
  },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 px-2 text-xs transition-colors"
      aria-label={`${t('item.copy')}: ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success(t('toast.copied'));
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error(t('toast.copyFailed'));
        }
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary transition-colors" />
      ) : (
        <Copy className="h-3.5 w-3.5 transition-colors" />
      )}
      {copied ? t('item.done') : t('item.copy')}
    </Button>
  );
}

export function ToolkitInstall({ catalog }: { catalog: ToolkitCatalog | null }) {
  const { lang, t } = useI18n();
  const downloadAll = async () => {
    try {
      const res = await fetch(toolkitDataUrl());
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'everything-zcode-catalog.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t('toast.catalogDownloaded'));
    } catch {
      toast.error(t('toast.downloadFailed'));
    }
  };

  return (
    <section id="install" className="border-b border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            index="04"
            className="mb-0 max-w-2xl flex-1"
            title={t('install.title')}
            description={t('install.desc')}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={downloadAll} disabled={!catalog}>
              <Download className="h-4 w-4" />
              {t('install.catalogJson')}
            </Button>
            <Button className="gap-2" disabled={!catalog} onClick={() => {
              if (!catalog) return;
              const all = catalog.categories.flatMap((c) => c.items);
              downloadItemsZip(all, 'everything-zcode-toolkit.zip');
            }}>
              <FileArchive className="h-4 w-4" />
              {t('install.fullZip')}
            </Button>
          </div>
        </div>

        <StaggerGroup className="grid gap-4 lg:grid-cols-3">
          {STEPS.map((step) => (
            <StaggerItem key={step.n} className="min-w-0">
              <Card className="flex h-full min-w-0 flex-col overflow-hidden border-border/70 bg-card/60">
                <CardHeader className="pb-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {t('install.step', { n: step.n })}
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{t(`install.${step.key}.title`)}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t(`install.${step.key}.desc`)}</p>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
                      <span className="font-mono text-[11px] text-muted-foreground">terminal</span>
                      <CopyButton text={lang === 'en' ? step.codeEn : step.codeRu} label={t(`install.${step.key}.title`)} />
                    </div>
                    <pre className="overflow-x-auto bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-zinc-100 dark:bg-black/60 scrollbar-thin">
                      {lang === 'en' ? step.codeEn : step.codeRu}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* Web-chat path: configs also work in SuperZ (chat.z.ai) via a paste-ready prompt */}
        <Card className="mt-4 border-primary/25 bg-primary/[0.04]">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug">{t('install.chat.title')}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {t('install.chat.desc')}
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 gap-2 border-primary/40"
              onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MessagesSquare className="h-4 w-4" />
              {t('install.chat.toCatalog')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
