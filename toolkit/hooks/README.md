# Hooks — Trigger-Based Automations

Hooks fire on ZCode lifecycle/tool events. All scripts are dependency-free Node.js for cross-platform compatibility (Windows/macOS/Linux).

## Included

| Hook | Event | What it does |
|------|-------|--------------|
| `session-start.js` | SessionStart | Prints tail of worklog.md — instant memory restoration |
| `pre-write-guard.js` | PreToolUse (Write\|Edit) | Warns: SDK in client code, absolute localhost fetch, @ts-ignore, console.log spam |
| `pre-bash-guard.js` | PreToolUse (Bash) | BLOCKS footguns: `next build`, `rm -rf /`, force push, `chmod -R 777` |
| `post-edit-lint-hint.js` | PostToolUse (Edit\|Write) | Every 10 edits: reminds to run lint + tail dev.log |
| `stop-checkpoint-reminder.js` | Stop | Nudges to checkpoint worklog.md if it's stale |

## Installation

1. Copy `hooks/scripts/` into your plugin/toolkit folder.
2. Merge `hooks.json` entries into your ZCode settings (or plugin manifest).
3. Ensure `$ZCODE_PLUGIN_ROOT` points at the folder containing `scripts/`, or replace the paths with absolute ones.

## Event Reference

- **SessionStart** — session begins. stdout is injected as context.
- **PreToolUse** — before a tool runs. Exit code 2 blocks the tool; stderr becomes the block reason. Exit 0 allows.
- **PostToolUse** — after a tool succeeds. stdout surfaces as a hint.
- **Stop** — the agent finishes responding. Good for reminders/summaries.

## Design Rules

- Hooks must be FAST (<5s): they run on every matching event.
- Guards fail OPEN: a broken guard must never wedge the session (exit 0 on internal error).
- Guards are advisory or surgical: warn broadly, block only unambiguous footguns.
- All state in temp files or the worklog — no daemons, no ports.
