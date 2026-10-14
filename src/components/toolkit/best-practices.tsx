'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit, Wrench, Puzzle } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from './motion-primitives';
import { SectionHeading } from './section-heading';
import { useI18n } from '@/lib/i18n';

const PRINCIPLES = [
  { key: 'p1', icon: BrainCircuit, points: ['a', 'b', 'c'] },
  { key: 'p2', icon: Puzzle, points: ['a', 'b', 'c'] },
  { key: 'p3', icon: Wrench, points: ['a', 'b', 'c'] },
] as const;

export function ToolkitPrinciples() {
  const { t } = useI18n();
  return (
    <section id="principles" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          index="05"
          className="mb-10 max-w-2xl"
          title={t('principles.title')}
          description={t('principles.desc')}
        />

        <StaggerGroup className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <StaggerItem key={p.key} className="min-w-0">
              <Card className="h-full min-w-0 border-border/70 bg-card/60">
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{t(`principles.${p.key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {p.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {t(`principles.${p.key}.${point}`)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal delay={0.1}>
          <Alert className="mt-8 border-primary/30 bg-primary/5">
            <BrainCircuit className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-semibold">{t('principles.alertTitle')}</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              {t('principles.alertText')}
            </AlertDescription>
          </Alert>
        </Reveal>
      </div>
    </section>
  );
}
