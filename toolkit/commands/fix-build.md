---
description: Fix all current build/lint/runtime errors by reading real error output — no guessing
allowed-tools: Bash, Read, Edit, Grep, Glob, Task
---

Kill every current error. Evidence first.

## Protocol

1. **Collect evidence**:
   - `tail -100 /home/z/my-project/dev.log` — compile + runtime errors
   - `bun run lint` — static errors
   - Browser console errors if the page was recently checked (agent-browser)

2. **Triage** — order by: fatal (server down) → compile errors → runtime errors → lint warnings.

3. **Fix loop** for each error:
   - Read the exact error: file, line, message.
   - Fix the root cause with the minimal change.
   - Check the error is gone (re-lint / re-tail dev.log).

4. **Escalate** — if errors share a root cause across 3+ files, stop patching: launch **build-error-resolver** subagent with full context, or propose an architectural fix to the user.

5. **Prove it** — final state must show:
   - `bun run lint` → 0 errors
   - dev.log tail → clean compile, no runtime stack traces on the affected routes

## Forbidden

- Deleting the failing feature to make the error disappear
- `@ts-ignore`, `as any`, `eslint-disable` as first resort
- Restarting the dev server as a "fix"
- Claiming done without reading the fresh log output

Append to worklog.md: error count before/after + root causes in one line each.
