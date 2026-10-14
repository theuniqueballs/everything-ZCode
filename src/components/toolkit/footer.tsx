'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/lib/i18n';

export function ToolkitFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-base font-bold text-primary-foreground">
                Z
              </span>
              <span className="text-sm font-bold">Everything ZCode</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('footer.sections')}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ['#catalog', t('footer.linkCatalog')],
                ['#concepts', t('footer.linkConcepts')],
                ['#install', t('footer.linkInstall')],
                ['#principles', t('footer.linkPrinciples')],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('footer.sources')}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/worldflowai/everything-claude-code"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t('footer.refLink')}
                </a>
              </li>
              <li>
                <a
                  href="https://z.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Z.ai
                </a>
              </li>
              <li>
                <a
                  href="/api/toolkit"
                  className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  /api/toolkit
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">{t('footer.made')}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {['Next.js 16', 'TypeScript', 'Tailwind 4', 'shadcn/ui'].map((tech) => (
              <Badge key={tech} variant="secondary" className="font-mono text-[10px]">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
