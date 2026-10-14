# Agents — Delegation Strategy

When to do work yourself vs delegate to subagents via the Task tool.

## Delegation Matrix

| Situation | Delegate to | Why |
|-----------|------------|-----|
| Open-ended "how does X work here" search | `Explore` | Fresh context, returns just the answer |
| Multi-step complex implementation from a clear spec | `full-stack-developer` | Self-contained build loop |
| Post-feature code review | `code-reviewer` | Unbiased eyes, confidence-gated findings |
| Browser QA of the golden path | `e2e-runner` | Structured verification protocol |
| Build/lint error flooding | `build-error-resolver` | Focused fix loop |
| Styling polish pass | `ui-polisher` | One-concern-at-a-time discipline |
| Architecture/implementation planning | `Plan` | Returns step-by-step plan |
| Worklog/handover writing | `doc-updater` / `worklog-keeper` | Format discipline |

## Rules

1. **Delegate self-contained work** — anything you can specify in one detailed prompt (task, constraints, output format, files to read).
2. **Never delegate judgment calls** — requirement ambiguity, trade-off decisions, user communication. Those stay with you.
3. **Parallelize independent tasks** — one message, multiple Task calls (e.g., `2-a` content + `2-b` data layer). Dependent tasks stay sequential.
4. **Brief every subagent with**:
   - Task ID (global order, e.g. `2-a`)
   - "Read `/home/z/my-project/worklog.md` first"
   - "Append your work record to worklog.md when done"
   - Explicit "write code" vs "research only" expectation
5. **Trust but verify** — subagent output is generally reliable; still run the verification loop on delivered work.

## Context Protection

Delegation is also a memory strategy: exploratory noise stays in the subagent's context, your main thread keeps only the distilled result. When your session feels saturated, delegate MORE, not less.
