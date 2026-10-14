'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BrainCircuit, Wrench, Puzzle } from 'lucide-react';
import { Reveal, StaggerGroup, StaggerItem } from './motion-primitives';
import { SectionHeading } from './section-heading';

const PRINCIPLES = [
  {
    icon: BrainCircuit,
    title: 'Выбор модели',
    points: [
      'glm-4.6 — для кода: ревью, резолвер ошибок, дизайн API',
      'glm-4.5-air — для лёгких задач: документация, worklog',
      'Дорогая модель не нужна там, где важна скорость, а не глубина',
    ],
  },
  {
    icon: Puzzle,
    title: 'Бюджет контекстного окна',
    points: [
      'Настройте 20–30 MCP, но держите включёнными меньше 10 на проект',
      'До 80 активных инструментов — дальше полезный контекст тает',
      'Каждый включённый инструмент — налог на каждый следующий вызов',
    ],
  },
  {
    icon: Wrench,
    title: 'Кастомизация',
    points: [
      'Эти конфиги кодифицируют один workflow — ваш может отличаться',
      'Начните с резонирующего, модифицируйте под свой стек',
      'Удаляйте неиспользуемое, добавляйте своё через /learn',
    ],
  },
];

export function ToolkitPrinciples() {
  return (
    <section id="principles" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          index="05"
          className="mb-10 max-w-2xl"
          title="Важные принципы"
          description="Из практики референс-репозитория: что работает в продакшене, а что выглядит хорошо только в README."
        />

        <StaggerGroup className="grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <StaggerItem key={p.title} className="min-w-0">
              <Card className="h-full min-w-0 border-border/70 bg-card/60">
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{p.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {p.points.map((point, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        {point}
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
            <AlertTitle className="text-sm font-semibold">Правило большого пальца</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              Начните с worklog-протокола и цикла верификации — они дают максимальный эффект уже на
              первой неделе. Остальное подключайте по мере роста проекта.
            </AlertDescription>
          </Alert>
        </Reveal>
      </div>
    </section>
  );
}
