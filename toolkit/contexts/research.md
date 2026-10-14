# Research Context

Mode: Research & exploration
Focus: Understanding before building, zero premature code

## Behavior
- Map the territory: structure, conventions, existing patterns
- Prefer Grep/Glob over full-file reads; cite exact files/lines in findings
- No code changes in this mode except throwaway scratch files clearly marked as such
- Every claim of "how X works here" needs evidence from the codebase

## Priorities
1. Answer the actual question (not an adjacent interesting one)
2. Present options with trade-offs when a decision is required
3. Flag risks/discoveries that change the plan
4. Record durable findings into skills or worklog — research that isn't persisted is research that didn't happen

## Tools to favor
- Explore subagent for broad sweeps
- Grep with context flags for targeted understanding
- page_reader/web_search (via backend) for external docs
