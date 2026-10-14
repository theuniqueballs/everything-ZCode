---
description: Full code review of current changes with severity-ranked findings
allowed-tools: Task, Bash, Read, Grep, Glob
---

Run a structured code review of the current work.

## Steps

1. Collect changes: `git diff` + `git diff --staged` + `git status`. If the diff is empty, review files touched in the latest session (check worklog.md).
2. Launch the **code-reviewer** subagent (Task tool) with the diff context and instruct it to follow its confidence-gate protocol.
3. While it runs, do a fast pass yourself on the CRITICAL items only:
   - `z-ai-web-dev-sdk` imported anywhere in client components?
   - Any hardcoded secrets/keys?
   - Any fetch to absolute `localhost:PORT` URLs?
4. Merge findings into one report.

## Report format

```
VERDICT: APPROVE | APPROVE WITH NOTES | REQUEST CHANGES

CRITICAL (must fix before done)
  [C1] file:line — issue → fix

HIGH (fix this session)
  [H1] ...

MEDIUM (backlog)
  [M1] ...

NOTES
  - consolidated observations
```

5. If CRITICAL findings exist, fix them immediately (or delegate to **build-error-resolver**), then re-run the review on the delta only.
6. Append one line to worklog.md: "Review verdict: X, findings fixed: N".
