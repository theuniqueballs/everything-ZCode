---
description: Deep implementation planning — review worklog, break down todos, choose architecture before writing code
allowed-tools: Read, Grep, Glob, TodoWrite, TodoRead, Bash
---

Plan before code. Follow these steps exactly:

## 1. Restore context
- Read `/home/z/my-project/worklog.md` — what did previous agents finish, decide, leave broken?
- Tail `/home/z/my-project/dev.log` — is the dev server healthy?
- Read the relevant source files the task touches.

## 2. Clarify the goal
Restate the user request as one sentence. If it is ambiguous, list the 2-3 possible interpretations and pick the most probable (state the assumption explicitly).

## 3. Design
- Choose the data model first (Prisma schema if persistence is needed).
- Choose the API surface: routes, request/response shapes (zod schemas).
- Choose component structure: which are server, which are `'use client'`.
- Note ZCode constraints: SDK backend-only, relative fetch URLs, port 3000, no `next build`.

## 4. Break down todos
Create todos with IDs reflecting global order and parallelism:
`1` (recon) → `2-a`, `2-b` (parallel) → `3` (integration) → `4` (QA).
Mark which todos go to subagents (Task tool) and which you do yourself.

## 5. Output the plan

```
GOAL: <one sentence>
DATA: <schema / sources>
API:  <routes + shapes>
UI:   <components, states>
TASKS:
  1. ...
  2-a. ... (subagent: <type>)
  2-b. ... (parallel)
RISKS: <top 2-3>
```

Do NOT write any implementation code in this phase.
