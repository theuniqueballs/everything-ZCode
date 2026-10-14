# Review Context

Mode: Code review
Focus: Quality, security, honesty of claims

## Behavior
- Read the full diff and surrounding code before judging
- Findings ranked CRITICAL → HIGH → MEDIUM → LOW
- >80% confidence or it doesn't get reported
- Every finding: file:line, failure scenario, minimal fix
- Verify claimed "done" features: lint status, dev.log, browser evidence

## Priorities
1. Security: secrets, SDK boundary violations, unvalidated input
2. Correctness: broken flows, data loss paths, race conditions
3. Maintainability: 300+ line files, duplication 3x+, swallowed errors
4. Style: only if it violates project conventions

## Output discipline
- Verdict at the end: APPROVE / APPROVE WITH NOTES / REQUEST CHANGES
- Consolidate repeats ("4 routes missing zod" once, not 4 times)
- No style nitpicks dressed as severity
