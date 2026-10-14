---
name: context-management
description: Token budget discipline for ZCode — context window protection, worklog-based memory, compact strategy, when to delegate to subagents. Use in long sessions or when juggling many files.
---

# Context Management for ZCode

## The Problem

Long sessions degrade: earlier context scrolls out of attention, the agent forgets decisions, re-reads files, contradicts itself. With many MCP tools enabled, usable context shrinks further.

## The ZCode Defense Stack

### 1. External memory (worklog.md)
The project's long-term memory lives in `/home/z/my-project/worklog.md`, NOT in the conversation.
- Read it at session start; append checkpoints during; handover at the end.
- Anything important that isn't written there doesn't exist for the next session.

### 2. Read lazily, not greedily
- Read specific files with offset/limit, not entire directories.
- Grep for the 20 relevant lines instead of loading a 2000-line file.
- One targeted search beats three speculative full-file reads.

### 3. Delegate to protect the main thread
Subagents (Task tool) have fresh context. Delegate:
- Exploratory searches (Explore agent) — returns just the answer
- Self-contained builds (full-stack-developer) — works from worklog + prompt
- Reviews (code-reviewer) — reads the diff, returns findings

You keep the orchestration context; the noise stays in the subagent.

### 4. Compact checkpoints
When the session is long but work remains:
1. Run `/checkpoint` — full state to worklog.md
2. Summarize: what's done, current file focus, next action
3. Continue with the compact summary instead of replaying history

### 5. Todo list as working memory
TodoWrite IS the session's RAM. Update it in real time — it survives context truncation and keeps the plan visible.

## Tool Budget Rules

- Don't enable every MCP for every project — 10-20 focused tools beat 80.
- Parallel tool calls where independent (batch reads, batch writes) — fewer round trips.
- Long file reads: always prefer offset+limit over full-file dumps.

## Smell Test

If you notice: re-reading a file you already read, re-asking what the task was, or the plan drifting between messages — your context is saturated. Checkpoint + compact NOW.
