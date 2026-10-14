---
description: Write the full handover document — complete state for a fresh agent with zero memory
allowed-tools: Read, Edit, Bash, Glob, Grep, TodoRead
---

Produce a handover so complete that a fresh session continues in under 2 minutes.

## When

End of a major phase, before delegating a large task, or when the user says the session is ending.

## Handover Document (append to worklog.md)

```markdown
---
Task ID: <id or "handover">
Agent: <name>
Task: Full handover

## 1. Project status
- What the project IS (one paragraph, no marketing)
- Stack + entry points (page route, API routes, db schema location)
- Current health: lint / dev.log / last verify result

## 2. Completed and verified
- Feature list with verification evidence (log lines, browser checks)

## 3. In progress / half-done
- Exact file states, what remains, any WIP branches

## 4. Known issues / risks
- Bugs with reproduction steps
- Tech debt with priority

## 5. Next priorities (ranked)
1. ...
2. ...
3. ...
```

## Quality Bar

- Every claim has evidence (file path, command output, log line).
- A fresh agent reading ONLY this section must know: where things are, what works, what's broken, what to do first.
- Test: re-read it as if you have amnesia. Confused anywhere? Rewrite that part.
