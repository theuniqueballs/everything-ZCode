---
name: continuous-learning
description: Extracting reusable patterns from ZCode sessions into skills — turning repeated problem-solving into permanent knowledge. Use after solving hard problems or at session end.
---

# Continuous Learning for ZCode

## The Insight

Every session re-solves the same problems unless solutions are persisted. The fix: convert hard-won, reusable knowledge into skills that future sessions load automatically.

## What Qualifies

| Qualifies | Doesn't qualify |
|-----------|----------------|
| Non-obvious API behavior you had to discover | Standard usage covered by docs |
| Error + reliable fix recipe (took >1 attempt) | One-off business logic |
| Integration recipe (gateway ports, SDK streaming) | Anything project-specific only |
| UI pattern that repeatedly works | Trivial patterns anyone knows |

## Extraction Workflow

1. **Trigger** — after `/learn`, session end, or the 2nd time you solve the same problem.
2. **Describe the gap** — "I spent 3 attempts discovering that Next 16 dynamic params are async."
3. **Write the skill** — `skills/<kebab-name>/SKILL.md`:
   - `name`, `description` (with trigger words — this is how future sessions find it)
   - When to use, exact working pattern (code), pitfalls (what failed first)
4. **Install** — project `skills/` folder or `~/.zcode/skills/` for global reuse.
5. **Reference** — one line in worklog.md so the next agent knows it exists.

## Skill Quality Bar

- Description contains the trigger words a future agent would actually have in context ("stream", "SSE", "chat route").
- Code block is copy-paste runnable, not pseudocode.
- Pitfalls section names the EXACT failure you hit — that's the real value.
- One skill = one idea. If you write "and also...", split it.

## Compounding Effect

Session 1 discovers → session 2 reuses → session 3 refines the skill. After ~10 sessions, the toolkit encodes months of experience — exactly how the reference everything-claude-code repo was built: "configs evolved over 10+ months of intensive daily use."
