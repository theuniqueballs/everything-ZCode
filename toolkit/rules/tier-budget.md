---
name: tier-budget
description: Budget the gate signals per round — how many hard/warn/advisory findings a work round may raise before it must stop and pay them down. Prevents debt snowballing across batches.
---

# Tier Budget

Every work round (batch, feature, fix-pass) has a **signal budget** — a cap on
how many findings each severity tier may raise before the round must stop and
pay them down instead of pushing new work out.

## The Budget (defaults)

| Tier | Signals allowed per round | Meaning |
|---|---|---|
| hard | 0 | A hard failure stops the round immediately. Fix it now. |
| warn | 3 | Warns beyond 3 → pay down before new scope. |
| advisory | unlimited | Reported, receipted, never blocking. |

Rationale: warnings are receipts of known debt. Unbounded warn growth is how
a codebase rots while every individual change still "passes". A budget turns
silent accumulation into a visible decision.

## How To Apply

1. Run your gates (lint, typecheck, selftest, browser QA) before declaring a
   round done.
2. Count signals per tier. Hard = 0 is non-negotiable: a hard FAIL means the
   round is NOT done.
3. Warns over budget: either fix them in this round or write an explicit
   receipt (issue/worklog entry) with a pay-down plan. Never roll them over
   silently.
4. If a round *must* exceed the budget (deadline, scope pressure), the excess
   is an explicit author decision recorded in the worklog — not a default.

## Anti-patterns

- «Fix later» without a receipt — that is a lie told to your future self.
- Re-defining warn→advisory to fit the budget — tier taxonomy is policy;
  changing it is an author verdict, not a workaround.
- Zero-tolerance extremism: burning hours on advisory noise instead of
  shipping. Advisories are information, not obligations.
