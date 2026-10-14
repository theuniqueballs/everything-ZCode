---
name: browser-verification
description: agent-browser workflow for end-to-end QA in ZCode — render checks, golden path testing, responsive layout, footer contract. Use after any feature is built. Compilation is not verification.
---

# Browser Verification with agent-browser

## Why

A passing build proves nothing. The required standard of done: **browser-verified interactivity**.

## Setup Check

1. Dev server must be running on port 3000 — check `/home/z/my-project/dev.log` first.
2. Fatal errors in log? Fix before browser testing (launch build-error-resolver).
3. `agent-browser --help` — discover available commands when unsure.

## The Verification Loop

### Pass 1 — Render
- Open `/` (the only user-visible route).
- FAIL if: blank screen, error boundary, hydration crash, broken styles.
- Cross-check dev.log DURING/AFTER the visit: runtime errors, failed API calls, hydration mismatches.

### Pass 2 — Golden path
- Exercise the primary flows you just built:
  - Click every main button — expected result happens?
  - Submit key forms — validation + success path?
  - Tabs/modals/navigation — do they open, switch, close?
- Data-driven features: does backend data ACTUALLY display?
  - An eternal skeleton/spinner = FAIL.
  - Empty state shown instead of data = FAIL.

### Pass 3 — Layout
- Widths: ~375px (mobile), ~768px (tablet), ~1280px (desktop).
- Footer contract: sticks to bottom on short pages; pushed down naturally on long pages; never overlaps.
- Lists scroll inside containers; no horizontal overflow; touch targets ≥ 44px.

### Pass 4 — Console
- No uncaught exceptions, no 4xx/5xx from API calls, no React key warnings spam.

## Report Format

```
VERIFY: PASS | FAIL
[render]   PASS — page renders, no errors in dev.log
[golden]   PASS — form submits, item appears in list
[data]     FAIL — /api/items returns [] but DB has 3 rows (bug: wrong where clause)
[layout]   PASS — mobile + desktop OK, footer sticky OK
```

Failures → fix root cause → re-run FAILED passes only → repeat until clean. Report honestly: if a flow can't be verified in the browser, say so explicitly.
