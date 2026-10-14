---
name: prisma-sqlite
description: Prisma ORM with SQLite patterns for ZCode — schema design, db push workflow, relations, queries. Use whenever persistence is needed in the project.
---

# Prisma + SQLite for ZCode

## Workflow (exact commands)

```bash
# 1. Edit prisma/schema.prisma
# 2. Push schema to database
bun run db:push
# 3. Client is imported from '@/lib/db' (already configured)
```

Never run `prisma migrate dev` casually — `db:push` is the project convention.

## Schema Rules

```prisma
model Project {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("active") // use String, not enums (SQLite)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tasks Task[] // relation, not a list primitive
}

model Task {
  id        String   @id @default(cuid())
  title     String
  done      Boolean  @default(false)
  projectId String
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

- **Prisma schema primitive types CANNOT be lists.** No `String[]`. Model a relation table instead.
- SQLite has no native enums — use `String` + zod validation at the boundary.
- Always `onDelete: Cascade` on owned children to avoid orphan rows.
- Every model: `id`, `createdAt`, `updatedAt` baseline.

## The Singleton Client

```typescript
// src/lib/db.ts — already exists, reuse it
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

Import `db` from `@/lib/db` everywhere. Never `new PrismaClient()` in route files (connection exhaustion on hot reload).

## Query Patterns

```typescript
// List with pagination + filter
const items = await db.task.findMany({
  where: { projectId, done: false },
  orderBy: { createdAt: 'desc' },
  take: 50,
  skip: page * 50,
  include: { project: { select: { name: true } } }, // avoid N+1
});

// Upsert for idempotent writes
await db.setting.upsert({
  where: { key },
  update: { value },
  create: { key, value },
});
```

## Pitfalls

- Schema changed but client stale → `bun run db:push` then restart dev server if types lag.
- `db/` folder holds the sqlite file — check it exists before debugging "table not found".
- JSON columns: SQLite stores as strings; parse defensively on read.
- Concurrent writes: SQLite locks the whole DB — batch writes, keep transactions short.
