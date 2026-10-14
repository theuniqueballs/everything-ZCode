# Testing & Verification

The standard of done in ZCode: browser-verified interactivity, not a passing build.

## Verification Loop (every feature, no exceptions)

1. **Static** — `bun run lint` exits clean. No new `@ts-ignore`, no new `any`.
2. **Runtime** — tail `/home/z/my-project/dev.log`: clean compile, no stack traces on touched routes.
3. **Browser** — agent-browser over the golden path:
   - Page renders (no blank/error boundary/hydration crash)
   - Primary buttons/forms/tabs/modals produce expected results
   - Backend data actually displays — eternal spinner = FAIL
4. **Layout** — mobile (375px) + desktop (1280px); sticky footer contract holds.

## Coverage Expectations

- Pure logic (parsers, reducers, utils): test edge cases first — empty, huge, malformed.
- API routes: at minimum, success + validation-failure paths via direct handler checks.
- UI: covered by the browser loop; automated component tests optional.
- Don't chase a global %; chase coverage of every branch you wrote THIS session.

## TDD Preference

For non-trivial logic: failing test first (RED), minimal implementation (GREEN), cleanup (REFACTOR). A test that never failed is decoration.

## Honesty Rule

- NEVER report a feature as done without running the loop.
- If something can't be verified in this environment, say exactly that — unverified claims are bugs in the report.
