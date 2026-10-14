---
description: Test-driven development loop — RED, GREEN, REFACTOR with verification between cycles
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

Implement the requested feature with strict TDD discipline.

## The Loop

For each behavior:

### RED — write a failing test first
- Write the smallest test that expresses the next behavior.
- Name it after the behavior: `renders error toast when API returns 400`.
- Run it. Confirm it FAILS for the expected reason (not import errors).

### GREEN — minimal implementation
- Write just enough code to pass. No speculative abstraction.
- ZCode specifics: API behavior tested via route handler + zod schema; UI behavior via component render logic.

### REFACTOR — clean with green cover
- Remove duplication introduced in GREEN.
- Keep files under 300 lines; extract hooks/helpers as needed.
- Re-run tests + `bun run lint` after refactoring.

## ZCode Verification Gate

After each completed cycle:
1. `bun run lint` — must be clean.
2. Tail `dev.log` — no new runtime errors.
3. If UI feature: one agent-browser pass over the changed flow.

## Rules

- Never write implementation before the failing test exists.
- A test that never failed is not a test — it's decoration.
- If coverage of new logic is below ~80%, add missing edge cases (error paths first).
- On completion, update worklog.md with cycle count and final verification status.
