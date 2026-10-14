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

const CONCEPTS = [
  {
    icon: Database,
    title: 'Внешняя память',
    tagline: 'worklog.md вместо забывчивости',
    text: 'Контекст диалога волатилен — файл на диске нет. Каждая сессия читает worklog, пишет checkpoint-ы и завершается handover-ом. Решения переживают перезапуск.',
  },
  {
    icon: RefreshCw,
    title: 'Циклы верификации',
    tagline: '«сборка прошла» ≠ «работает»',
    text: 'Каждая фича проходит: lint → dev.log → браузерный golden path → layout. Протокол встроен в агента e2e-runner и команду /verify.',
  },
  {
    icon: Bot,
    title: 'Делегирование как защита контекста',
    tagline: 'субагенты поглощают шум',
    text: 'У субагентов свежее контекстное окно. Поиск — Explore, ревью — code-reviewer, самостоятельные сборки — full-stack-developer. У вас остаётся только оркестрация.',
  },
  {
    icon: GraduationCap,
    title: 'Непрерывное обучение',
    tagline: 'сессия → скилл',
    text: '/learn превращает открытые с трудом решения в скиллы с разделом «pitfalls». Через ~10 сессий тулкит кодифицирует месяцы опыта — так строился референс-репозиторий.',
  },
  {
    icon: ShieldCheck,
    title: 'Ревью с фильтром уверенности',
    tagline: 'только находки >80%',
    text: 'Каждая находка обязана иметь file:line, сценарий отказа и защищаемую severity. Инфляция severity разрушает доверие быстрее пропущенных багов.',
  },
  {
    icon: Gauge,
    title: 'Дисциплина контекста',
    tagline: 'токены — конечный ресурс',
    text: 'Читай лениво (offset/limit), грепай вместо полных файлов, делегируй explore-задачи, checkpoint при насыщении. Todo-лист — операционная память сессии.',
  },
];

export function ToolkitConcepts() {
  return (
    <section id="concepts" className="border-b border-border/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          index="02"
          className="mb-10 max-w-2xl"
          title="Ключевые концепты"
          description="Шесть идей, на которых построен тулкит. Они важнее отдельных файлов — файлы меняются, принципы остаются."
        />

        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c) => (
            <StaggerItem key={c.title} className="min-w-0">
              <Card
                className="group h-full min-w-0 border-border/70 bg-card/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-[0_0_0_1px_rgba(16,185,129,0.15),0_8px_30px_-12px_rgba(16,185,129,0.15)]"
              >
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                  <CardDescription className="text-xs font-medium text-primary/90">
                    {c.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.text}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
