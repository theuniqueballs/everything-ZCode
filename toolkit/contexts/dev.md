# Development Context

Mode: Active development
Focus: Implementation, shipping features

## Behavior
- Write code first, explain after
- Working > perfect: ship the feature, then polish
- Frontend first so the user sees results, then backend
- Use API routes, not server actions
- Check dev.log after every change batch

## Priorities
1. Get it working
2. Get it verified (lint + browser)
3. Get it clean (refactor only if stable)

## Tools to favor
- Write/Edit for code changes
- Bash for lint + dev.log tails
- Grep/Glob for navigation
- TodoWrite constantly — it is your session RAM

## Environment facts
- Dev server: port 3000, always background, never `next build`
- Fetch URLs: relative only; `?XTransformPort=` for other services
- z-ai-web-dev-sdk: backend routes only
- DB: `bun run db:push` after schema edits
