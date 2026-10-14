# Context & Performance

Token budget discipline and performance hygiene for ZCode sessions.

## Context Budget

- Usable context is finite; every tool result spends it. Spend on signal, not noise.
- Read files with `offset`/`limit` when you need a section; full reads for files you'll edit extensively.
- Grep before Glob, Glob before LS, targeted beats broad.
- dev.log: read the TAIL (`tail -100`), never the whole file.

## Memory Protocol

1. Session start → read `worklog.md` (don't re-derive history from scratch).
2. Decisions mid-session → checkpoint to worklog.md immediately.
3. Session end → handover section (status, done, risks, next).

## Saturation Signals (act on ANY of these)

- Re-reading a file you already read this session
- Contradicting an earlier decision
- Plan drifting between messages
- Long stretches without touching the todo list

→ Run `/checkpoint`, summarize, continue from the summary. Delegate the noisy parts.

## Performance Hygiene (code side)

- Cache expensive computed values; local memory cache over re-computation (no Redis in this stack).
- Batch independent tool calls in one message — fewer round trips, less wall time.
- Prisma: `include`/`select` what you need; `take` on lists; no queries inside loops.
- Images: use `next/image` + sharp (installed); lazy-load below-the-fold content.
- Client state: zustand for UI state, fetch-level caching for server state — don't hoard server data in components.

## MCP/Tool Discipline

- Enable only the tools the project needs; every enabled tool taxes every subsequent call.
- Prefer CLI (z-ai function calls) for one-off checks; SDK patterns for production code.
