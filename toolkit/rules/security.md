# Security

Mandatory security checks. These apply to every file you write and every feature you deliver.

## Secrets
- NEVER hardcode API keys, tokens, passwords, connection strings.
- Environment variables for anything sensitive; `.env` never committed.
- If you encounter a leaked secret: flag it, rotate recommendation, never reproduce it in output.

## SDK Boundary
- `z-ai-web-dev-sdk` is BACKEND-ONLY. It must never appear in a file with `'use client'`.
- All AI capabilities are exposed through your own API routes with zod-validated inputs.

## Input Validation
- Parse and validate EVERY request body and query param with zod before use.
- Trust nothing from the client: types lie, fetch can be called directly.
- Prisma parameterizes queries — raw SQL strings are forbidden.

## Output Safety
- No `dangerouslySetInnerHTML` with user or LLM content.
- Sanitize/strip anything fetched from external sources (page_reader, web_search) before rendering.
- Error responses to clients: generic messages. Stack traces stay in server logs.

## Abuse Surface
- User strings passed to LLMs go in data-labeled prompt sections, never as instructions.
- Cap payload sizes; throttle obviously expensive endpoints (AI generation, search).
