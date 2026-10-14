---
name: nextjs-16-patterns
description: Next.js 16 App Router patterns for ZCode projects — server/client components, API routes, data fetching, common pitfalls. Use when building pages, layouts, or backend endpoints.
---

# Next.js 16 Patterns for ZCode

## Project Constants

- `bun run dev` — port 3000, ALWAYS background, never duplicate instances
- NEVER `bun run build` in this environment
- User sees only the `/` route (`src/app/page.tsx`)
- Check `/home/z/my-project/dev.log` after every change session

## Server vs Client Components

```tsx
// Server component (default): data fetching, no interactivity
export default async function Page() {
  const data = await db.item.findMany();
  return <ItemList items={data} />; // can pass serializable props
}

// Client component: hooks, handlers, browser APIs
'use client';
export function Counter() {
  const [n, setN] = useState(0);
  ...
}
```

Rules:
- Push `'use client'` to the leaf components; keep pages server-rendered when possible.
- Never import server-only modules (`z-ai-web-dev-sdk`, `fs`, `db`) into client files.
- Hydration safety: no `Date.now()`, `Math.random()`, or locale-formatted dates during render — move to `useEffect` or format deterministically.

## API Routes (NOT server actions)

```typescript
// src/app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const items = await db.item.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ success: true, data: items });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // validate with zod, then db.item.create
}
```

- File-based dynamic params in Next 16 are async: `const { id } = await params;`
- Frontend fetches: ALWAYS relative URLs (`/api/items`).
- Multi-port services via gateway: `/api/x?XTransformPort=3030` — NEVER absolute localhost URLs.

## Data Fetching Patterns

```tsx
// Client-side with loading/error/empty states
const [data, setData] = useState<Item[] | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetch('/api/items')
    .then(r => r.json())
    .then(res => (res.success ? setData(res.data) : setError(res.error)))
    .catch(e => setError(String(e)));
}, []);
```

Render three states explicitly: skeleton while `null`, error card, empty state, then data.

## Pitfalls

- Reading dev.log is mandatory after changes — errors surface there first.
- `next.config.ts` images: remote domains need config; prefer `sharp` (already installed).
- Metadata export belongs in `layout.tsx`/`page.tsx`, not random components.
- Port conflicts: only one dev server; check for stale processes before starting.
