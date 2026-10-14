# Coding Style

Immutability, file organization, naming. Enforced in every edit.

## TypeScript
- Strict mode always. No `any` unless interfacing with genuinely untyped third-party output — and even then, narrow immediately.
- Derive types from zod schemas: `z.infer<typeof schema>` at API boundaries.
- `interface` for object shapes, `type` for unions/utilities. Export types next to their module.

## Immutability
- `const` by default. Let only when reassignment is the clearest expression.
- Never mutate props, state, or function parameters. Return new arrays/objects (`map`, `filter`, spread).
- Prisma writes are exceptions — that's what the DB is for.

## File Organization
- Max ~300 lines per file. Split by domain concern, not by layer dogma.
- One component per file for non-trivial components; colocate tiny helpers.
- Structure:
  - `src/components/ui/` — shadcn primitives (existing, don't rewrite)
  - `src/components/<feature>/` — feature components
  - `src/lib/` — pure utilities, db client, shared types
  - `src/app/api/` — route handlers only, no business logic dumping ground
- Imports: framework → third-party → `@/` alias → relative. No circular dependencies, ever.

## Naming
- Components/components files: `PascalCase.tsx`. Hooks: `use-thing.ts`. Everything else: `kebab-case.ts`.
- Booleans read as predicates: `isLoading`, `hasError`, `canSubmit`.
- Functions are verbs: `fetchItems`, `parseSchema`, `renderBadge`.
- No abbreviations except universally standard ones (`id`, `url`, `db`).

## Comments
- Comment WHY, not WHAT. The code says what; the comment says why it must be so.
- Every non-obvious ZCode constraint in code gets a comment (gateway port rule, SDK boundary, hydration gotcha).
- No commented-out code in commits — delete it, git remembers.
