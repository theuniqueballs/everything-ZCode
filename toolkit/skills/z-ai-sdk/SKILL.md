---
name: z-ai-sdk
description: Using z-ai-web-dev-sdk in ZCode projects — LLM chat, VLM vision, image generation, TTS, ASR, web search, page reader. Backend-only. Use when adding any AI capability to the app.
---

# z-ai-web-dev-sdk Usage

## The One Rule

**Backend only.** The SDK lives exclusively in `src/app/api/*/route.ts` (or mini-services). Importing it in a client component is a critical bug.

## Capability Map

| Need | Function | Where |
|------|----------|-------|
| Chatbot, text generation | `chat.completions.create` | API route |
| Image understanding | `chat.completions.create` with image | API route |
| Generate images | `images.generations` | API route |
| Text to speech | `tts.completions` | API route |
| Speech to text | `asr` (base64 audio) | API route |
| Live web info | `functions.invoke('web_search')` | API route |
| Read a webpage | `functions.invoke('page_reader')` | API route |

## Patterns

### LLM chat (streaming to client)

```typescript
// src/app/api/chat/route.ts
import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const zai = await ZAI.create();
  const stream = await zai.chat.completions.create({
    messages,
    stream: true,
  });
  // pipe stream chunks to a ReadableStream response
}
```

### Image generation → save to /public

```typescript
const zai = await ZAI.create();
const res = await zai.images.generations({
  prompt: 'minimal hero illustration, emerald palette',
  size: '1024x1024',
});
// res.data[0].base64 → fs.writeFile to public/ or return base64 to client
```

### Web search

```typescript
const result = await zai.functions.invoke('web_search', {
  query: 'next.js 16 release notes',
  num: 10,
});
```

## Frontend Integration

- Client calls YOUR api route: `fetch('/api/chat', { method: 'POST', body })`
- Show streaming text progressively; abort with `AbortController` on unmount
- Loading states mandatory — AI calls take seconds, not milliseconds
- Error surfaces: toast + inline retry, never silent failure

## Pitfalls

- `ZAI.create()` per request is fine; don't cache the instance across hot reloads.
- Validate message shape with zod before forwarding to the model (prompt injection surface).
- Long generations: set timeouts and cap `max_tokens` sensibly.
- Never log full user prompts + API responses at scale — dev.log bloat.
