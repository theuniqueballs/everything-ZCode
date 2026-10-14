---
description: Safe refactoring pass — dead code removal, file splitting, deduplication, zero behavior change
allowed-tools: Task, Read, Edit, Grep, Glob, Bash
---

Clean the codebase without changing behavior.

## Steps

1. **Identify targets** (in priority order):
   - Files > 300 lines
   - Logic duplicated 3+ times
   - Dead exports (grep each candidate for all usages first)
   - `any` types, `@ts-ignore`, empty catch blocks
   - ZCode violations: SDK in client code, absolute fetch URLs, missing `'use client'` where hooks are used

2. **Delegate** — launch the **refactor-cleaner** subagent with the target list and the behavior-lock rule (public APIs, route shapes, Prisma schema unchanged).

3. **Verify after each pass**:
   - `bun run lint` clean
   - dev.log: clean compile
   - Manual smoke of affected flows via agent-browser if UI changed

4. **Guardrails**:
   - One category per pass (dead code → size → duplication → types)
   - Never remove a symbol without grep evidence of zero usage
   - Never merge refactor with feature work in the same commit

5. **Report**: files changed, lines removed vs added, verification results. Append summary to worklog.md.
