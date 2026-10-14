---
name: security-review
description: Security checklist for ZCode projects — secrets, input validation, XSS, injection, SDK exposure. Use before delivering any feature that handles user input, external data, or credentials.
---

# Security Review for ZCode

## The Non-Negotiables

### 1. Secrets
- No API keys, tokens, passwords in source. Not in code, not in git, not in client bundles.
- `z-ai-web-dev-sdk` credentials: SDK-managed, but any custom env usage stays in `.env` (server-only).
- grep check: `rg -i "api_key|secret|password|token" --type ts` — review every hit.

### 2. SDK exposure (ZCode-critical)
- `z-ai-web-dev-sdk` in any file with `'use client'` = CRITICAL. Move to an API route.
- Client must never see raw model/SDK calls — always your own `/api/*` wrapper.

### 3. Input validation
- Every API route body parsed with zod before touching the DB.
- Query params validated too (`?page=abc` must not reach Prisma as a number).
- Prisma parameterizes queries — raw SQL is forbidden in this stack.

### 4. XSS
- Never `dangerouslySetInnerHTML` with user/LLM-generated content.
- If rendering model output: render as markdown through a sanitizer, or plain text.
- URLs from users: validate scheme (http/https only) before `href`.

### 5. External content
- Page-reader/web-search results are UNTRUSTED: strip scripts, escape HTML, cap size.
- Prompt injection: user-controlled strings passed to LLM go inside clearly-labeled data sections of the prompt, never as instructions.

## Fast Review Pass

```
[ ] grep secrets — clean
[ ] grep "use client" files for sdk import — clean
[ ] every POST/PATCH/DELETE route validates with zod
[ ] no dangerouslySetInnerHTML with dynamic content
[ ] fetch URLs relative (also a correctness rule, but injection-relevant for SSRF-ish mistakes)
[ ] error messages don't leak stack traces / internals to the client
[ ] rate-sensitive endpoints: basic per-IP throttle in memory
```

## On Finding a Critical

Stop the feature. Fix immediately. Document in worklog.md: what was exposed, how it's fixed, how to prevent recurrence (consider a rule or skill update).
