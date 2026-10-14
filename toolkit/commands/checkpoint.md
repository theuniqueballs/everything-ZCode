---
description: Save session checkpoint to worklog.md — progress, decisions, next steps
allowed-tools: Read, Edit, Bash, TodoRead
---

Persist the current state so nothing is lost between sessions or agent handoffs.

## Steps

1. **Gather state**:
   - TodoRead — current task statuses
   - `git status --short` + `git diff --stat` — what changed on disk
   - `tail -30 /home/z/my-project/dev.log` — current server health
   - Uncommitted decisions in your head — write them down NOW

2. **Append checkpoint to worklog.md** (never overwrite):

   ```markdown
   ---
   Task ID: <current task or "checkpoint">
   Agent: <your name>
   Task: Checkpoint

   Work Log:
   - Done: <completed items, concrete>
   - In progress: <what is half-done, exact file + line state>
   - Blocked: <blockers and why>

   Stage Summary:
   - <key results>
   - Next: <the 1-3 things the next session should do first>
   ```

3. **Verify persistence** — re-read the appended section. A checkpoint you can't read back is not saved.

## Rules

- Checkpoint at minimum: after each completed task, before risky changes, when switching context, when ending a session.
- Be brutally honest about half-done state — the next agent builds on this.
- No checkpoint without "Next:" — a checkpoint without direction is a dead end.
