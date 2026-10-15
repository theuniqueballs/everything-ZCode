---
name: no-retroactive-checks
description: Delivered work is never re-judged by rules that did not exist at delivery time. New gates apply to new work; re-verifying old artifacts under a newer rule pack requires an explicit grandfathering decision.
---

# No Retroactive Checks

Rules are not time machines. A delivered batch — code shipped, contract
signed, config published — is judged by the rules THAT WERE IN FORCE at
delivery. Newer rules apply to newer work only.

## The Failure It Prevents

A gate suite grows: v1.3 has 12 checks, v1.8 has 31. Re-running today's
suite on a batch delivered under v1.3 produces hard FAILs against laws that
did not exist when the batch shipped. The «first run is always clean»
contract breaks: re-verification of PAST work becomes a lie generator, and
the signal value of a FAIL collapses (is it a regression or time travel?).

## How To Apply

1. Each delivered artifact records its verification context: the rule-pack
   version / hash in force at delivery (a `sha10`, a recipe version, a
   commit — anything stable).
2. Gates run against a delivered artifact distinguish two modes:
   - **delivery-time mode** — rules frozen at the recorded version (for
     regression checks: did the artifact itself change?);
   - **head mode** — current rules, for NEW work only.
3. Upgrading a delivered artifact to a newer rule pack is an explicit
   migration: run the new gates, fix, re-deliver, record the new context.
4. If you cannot record the context (legacy artifacts), the default is
   grandfathering: old work passes unless proven broken in ITS OWN terms.

## Anti-patterns

- «Just re-run everything under the new suite to be safe» — you are not
  being safe, you are manufacturing failures.
- Retro-strictness as quality theater: failing old work proves nothing
  about old work and devalues the signal for new work.
- The opposite extreme — never tightening anything because «old stuff would
  fail»: tightening is fine; the scope of enforcement is what stays honest.
