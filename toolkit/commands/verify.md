---
description: Full verification loop — lint, dev.log, browser golden path, layout, footer
allowed-tools: Bash, Read, Grep, Task
---

Prove the project actually works. Compilation is not verification.

## Verification Checklist (execute in order)

### 1. Static
- `bun run lint` → 0 errors
- No `@ts-ignore`/`as any` introduced since last checkpoint (git diff)

### 2. Runtime logs
- Dev server running on port 3000 (single instance)
- `tail -200 /home/z/my-project/dev.log` → no compile errors, no runtime stack traces, no failed API calls during the check

### 3. Browser (launch **e2e-runner** subagent)
- `/` renders: content visible, no blank screen, no error boundary, no hydration warnings
- Golden path: every primary button/form/tab/modal exercised and producing the expected result
- Data flows: backend data actually displays (no eternal skeleton/spinner)
- Real-time (if any): messages flow end-to-end

### 4. Layout
- Mobile (375px) + desktop (1280px) both hold
- Sticky footer: bottom on short pages, pushed down on long pages, never overlapping
- Lists scroll inside containers, no horizontal overflow

## Verdict

```
VERIFY RESULT: PASS | FAIL
  [ ] lint      — ...
  [ ] dev.log   — ...
  [ ] browser   — ...
  [ ] layout    — ...
FAIL items → fix now (delegate to build-error-resolver / ui-polisher), then re-run failed items only.
```

Append one line to worklog.md: "Verify: PASS/FAIL, details".
