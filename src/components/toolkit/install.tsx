'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Copy, Download, FolderDown, Package, Terminal, FileArchive } from 'lucide-react';
import type { ToolkitCatalog } from '@/lib/toolkit-types';
import { downloadItemsZip } from '@/lib/zip';
import { StaggerGroup, StaggerItem } from './motion-primitives';
import { SectionHeading } from './section-heading';

const STEPS = [
  {
    n: 1,
    icon: FolderDown,
    title: 'Скопируйте конфиги',
    desc: 'Агенты, команды, скиллы и правила — обычные файлы. Скачайте ZIP или копируйте только нужное.',
    code: `# Вариант А: ZIP из палитры (⌘K) или кнопки «Весь тулкит»
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
  },
  {
    n: 2,
    icon: Terminal,
    title: 'Подключите хуки',
    desc: 'Пять кроссплатформенных Node-скриптов: защита от footgun-ов, напоминания, восстановление памяти.',
    code: `# Укажите корень тулкита
export ZCODE_PLUGIN_ROOT=/path/to/everything-zcode/toolkit

# Слейте hooks/hooks.json в настройки ZCode:
#   SessionStart  → tail worklog.md (память)
#   PreToolUse    → блок "next build", rm -rf /
#   PostToolUse   → подсказка про lint каждые 10 правок
#   Stop          → напоминание о checkpoint`,
  },
  {
    n: 3,
    icon: Package,
    title: 'Примите workflow',
    desc: 'Две привычки дают 80% ценности даже без установки файлов.',
    code: `# Привычка 1 — внешняя память:
#   каждая сессия начинается с чтения worklog.md
#   и заканчивается handover-секцией в нём

# Привычка 2 — верификация:
#   lint → dev.log → браузер (golden path)
#   фича без прогона по циклу = не сделана`,
  },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 px-2 text-xs transition-colors"
      aria-label={`Скопировать: ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success('Скопировано в буфер обмена');
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error('Не удалось скопировать');
        }
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary transition-colors" />
      ) : (
        <Copy className="h-3.5 w-3.5 transition-colors" />
      )}
      {copied ? 'Готово' : 'Копировать'}
    </Button>
  );
}

export function ToolkitInstall({ catalog }: { catalog: ToolkitCatalog | null }) {
  const downloadAll = async () => {
    try {
      const res = await fetch('/api/toolkit');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'everything-zcode-catalog.json';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Каталог скачан (JSON)');
    } catch {
      toast.error('Ошибка скачивания');
    }
  };

  return (
    <section id="install" className="border-b border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            index="04"
            className="mb-0 max-w-2xl flex-1"
            title="Установка"
            description="Три способа начать: скопировать файлы, подключить хуки или просто перенять workflow."
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={downloadAll} disabled={!catalog}>
              <Download className="h-4 w-4" />
              Каталог (JSON)
            </Button>
            <Button className="gap-2" disabled={!catalog} onClick={() => {
              if (!catalog) return;
              const all = catalog.categories.flatMap((c) => c.items);
              downloadItemsZip(all, 'everything-zcode-toolkit.zip');
            }}>
              <FileArchive className="h-4 w-4" />
              Весь тулкит (ZIP)
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
                      шаг {step.n}/3
                    </Badge>
                  </div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
                      <span className="font-mono text-[11px] text-muted-foreground">terminal</span>
                      <CopyButton text={step.code} label={step.title} />
                    </div>
                    <pre className="overflow-x-auto bg-zinc-950 p-4 font-mono text-[11px] leading-relaxed text-zinc-100 dark:bg-black/60 scrollbar-thin">
                      {step.code}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
