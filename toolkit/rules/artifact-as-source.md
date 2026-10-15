---
name: artifact-as-source
description: One source of truth per invariant — tests and gates must verify against the artifact itself, never against hand-copied numbers. Divergence between a JSON spec and code that re-states it is a latent bomb.
---

# Artifact As Source

Every invariant lives in exactly ONE artifact. Anything that consumes the
invariant reads it FROM the artifact — never from a hand-copied duplicate.

## The Failure It Prevents

A spec defines `slotsTotal: 25` in JSON. A test asserts `slots.length === 25`
as a hardcoded number. The policy later changes to 26: the code updates, the
test still says 25 — and now a CORRECT build fails a STALE check. Worse: the
test keeps "passing" a build that silently regressed, because the number was
edited on both sides.

Real case: a selftest failed 3 checks purely because constants were restated
in code instead of read from the policy file.

## How To Apply

1. Constants that gates/test/UI checks depend on live in one artifact
   (policy JSON, frontmatter, schema) — everything else derives from it.
2. Tests assert the RELATIONSHIP, not the number: `slots.length ===
   policy.law.slotsTotal`, not `slots.length === 25`.
3. If a test must pin a literal (regression guard), it must also assert the
   artifact value hasn't drifted: `expect(policy.x).toBe(25)` in the same
   check, so the two failures never disagree.
4. Migration rule: when you touch a check that restated an artifact value,
   replace the literal with the read. Do not migrate wholesale in the same
   PR as behavior changes.

## Anti-patterns

- «It's just a comment, I'll keep the number too» — comments rot first.
- Deriving in TWO places because the import path is inconvenient.
- An artifact nobody reads (spec theater): if no check derives from it, the
  artifact is decoration — delete it or wire it up.
