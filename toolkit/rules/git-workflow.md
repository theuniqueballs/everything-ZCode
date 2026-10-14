# Git Workflow

Commit format, scoping, and hygiene for ZCode sessions.

## Commit Format

```
<type>(<scope>): <short imperative summary>

[optional body: what & why, bullet points]
```

Types: `feat`, `fix`, `refactor`, `docs`, `style`, `chore`, `test`.

Examples:
```
feat(catalog): add search across all toolkit configs
fix(api): validate toolkit file path to prevent directory traversal
refactor(hero): extract stats into separate component
```

## Rules

- **Atomic commits** — one logical change per commit. Never mix refactor + feature + fix.
- Commit after each completed todo, not at session end (checkpoints survive crashes).
- Never commit: `.env`, secrets, `node_modules`, build artifacts, dev.log.
- Generated files (prisma client) stay out of commits unless the project convention says otherwise.

## Before Every Commit

- [ ] `bun run lint` clean
- [ ] dev.log shows clean compile
- [ ] No debug leftovers (console.log spam, commented code, TODO without issue reference)
- [ ] worklog.md checkpoint updated (if this closes a task)

## WIP Safety

Risky change ahead? Commit the working state first. Bad refactor noticed late? `git revert` the specific commit instead of manual un-picking.
