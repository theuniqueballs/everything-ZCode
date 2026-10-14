---
description: Extract reusable patterns from the current session into skills — turn one-off solutions into permanent knowledge
allowed-tools: Read, Write, Edit, Glob, Grep
---

Convert this session's hard-won knowledge into reusable skills.

## Steps

1. **Replay the session** — scan worklog.md + git log for problems you solved that took more than one attempt:
   - Non-obvious API behavior discovered
   - Error pattern with a reliable fix
   - Integration recipe (e.g., gateway port forwarding, SDK streaming)
   - UI pattern that worked well

2. **Filter** — a pattern qualifies if:
   - It will recur in future sessions
   - It is not already covered by an existing skill
   - It is specific enough to act on ("how to stream LLM responses to a client via API route", not "write good code")

3. **Write the skill** — create `skills/<kebab-name>/SKILL.md`:
   ```markdown
   ---
   name: <kebab-name>
   description: One line: when this skill applies. Trigger words included.
   ---

   # <Name>

   ## When to use
   ## Steps / Pattern (with code)
   ## Pitfalls (what went wrong the first time)
   ```

4. **Index it** — if the project has a skills registry/manifest, add an entry. If skills live in `~/.zcode/skills/`, install a copy there.

5. **Log** — append to worklog.md: "Learned: <skill-name> — <one-line what it captures>".

## Anti-patterns

- Do not write skills for one-off business logic tied to a single project.
- Do not duplicate an existing skill — extend it instead.
- A skill without a concrete pitfall section is probably too shallow; dig deeper or skip.
