'use client';

import {
  Database,
  RefreshCw,
  Bot,
  GraduationCap,
  ShieldCheck,
  Gauge,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaggerGroup, StaggerItem } from './motion-primitives';
import { SectionHeading } from './section-heading';
import { useI18n } from '@/lib/i18n';

const CONCEPTS = [
  { key: 'c1', icon: Database },
  { key: 'c2', icon: RefreshCw },
  { key: 'c3', icon: Bot },
  { key: 'c4', icon: GraduationCap },
  { key: 'c5', icon: ShieldCheck },
  { key: 'c6', icon: Gauge },
] as const;

export function ToolkitConcepts() {
  const { t } = useI18n();
  return (
    <section id="concepts" className="border-b border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          index="03"
          className="mb-10 max-w-2xl"
          title={t('concepts.title')}
          description={t('concepts.desc')}
        />

        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c) => (
            <StaggerItem key={c.key} className="min-w-0">
              <Card
                className="group h-full min-w-0 border-border/70 bg-card/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_8px_30px_-12px_rgba(16,185,129,0.15)]"
              >
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{t(`concepts.${c.key}.title`)}</CardTitle>
                  <CardDescription className="text-xs font-medium text-primary/90">
                    {t(`concepts.${c.key}.tagline`)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{t(`concepts.${c.key}.text`)}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
