# Everything ZCode

**The complete collection of ZCode / Z.ai configs for productive AI-assisted development.**

Production-ready agents, commands, skills, rules, hooks, and contexts — battle-tested patterns for building real products with ZCode and GLM models. Inspired by the everything-claude-code philosophy, rebuilt natively for the Z.ai ecosystem.

---

## What's Inside

```
toolkit/
├── agents/            # Subagents with limited scope (delegate via Task tool)
│   ├── code-reviewer.md         # Quality/security review, confidence-gated
│   ├── build-error-resolver.md  # Root-cause build/TS error fixing
│   ├── e2e-runner.md            # Browser QA via agent-browser
│   ├── refactor-cleaner.md      # Dead code cleanup, zero behavior change
│   ├── doc-updater.md           # Docs/worklog sync
│   ├── api-designer.md          # REST API design for App Router
│   ├── ui-polisher.md           # Styling, responsive, a11y passes
│   └── worklog-keeper.md        # Session continuity, handovers
│
├── commands/          # Slash commands for quick execution
│   ├── plan.md        # /plan — implementation planning
│   ├── review.md      # /review — full code review
│   ├── tdd.md         # /tdd — test-driven loop
│   ├── fix-build.md   # /fix-build — evidence-based error fixing
│   ├── refactor.md    # /refactor — safe cleanup
│   ├── verify.md      # /verify — full verification loop
│   ├── learn.md       # /learn — extract patterns into skills
│   ├── checkpoint.md  # /checkpoint — save session state
│   ├── handoff.md     # /handoff — full handover document
│   └── ui-polish.md   # /ui-polish — styling improvement pass
│
├── skills/            # Workflow definitions and domain knowledge
│   ├── nextjs-16-patterns/      # App Router, API routes, pitfalls
│   ├── z-ai-sdk/                # LLM/VLM/image/TTS/ASR/search usage
│   ├── prisma-sqlite/           # Schema patterns, db push workflow
│   ├── shadcn-ui-theming/       # Components, tokens, dark mode
│   ├── browser-verification/    # agent-browser QA loop
│   ├── security-review/         # Security checklist
│   ├── continuous-learning/     # Session → skill extraction
│   └── context-management/      # Token discipline, compaction
│
├── rules/             # Always-follow guidelines
│   ├── security.md              # Secrets, validation, SDK boundary
│   ├── coding-style.md          # TS strict, immutability, file limits
│   ├── testing.md               # Verification loop requirements
│   ├── git-workflow.md          # Commit format, hygiene
│   ├── agents.md                # Delegation strategy
│   └── context-management.md    # Token budget, memory protocol
│
├── hooks/             # Trigger-based automations (cross-platform Node.js)
│   ├── hooks.json                # SessionStart/PreToolUse/PostToolUse/Stop
│   ├── scripts/                  # 5 dependency-free scripts
│   └── README.md                 # Event reference + install
│
├── contexts/          # Mode-based system prompt overlays
│   ├── dev.md                    # Shipping mode
│   ├── review.md                 # Review mode
│   └── research.md               # Exploration mode
│
├── settings.json      # Permissions, hooks, MCP servers, model prefs
└── marketplace.json   # Toolkit manifest
```

---

## Installation

### Option 1: Copy what you need (recommended)

```bash
git clone <this-repo> everything-zcode

# Agents → your agents directory
cp everything-zcode/toolkit/agents/*.md ~/.zcode/agents/

# Rules
cp everything-zcode/toolkit/rules/*.md ~/.zcode/rules/

# Commands
cp everything-zcode/toolkit/commands/*.md ~/.zcode/commands/

# Skills (folders!)
cp -r everything-zcode/toolkit/skills/* ~/.zcode/skills/
```

### Option 2: Use hooks

Merge `toolkit/hooks/hooks.json` into your settings, then point `$ZCODE_PLUGIN_ROOT` at the toolkit folder:

```bash
export ZCODE_PLUGIN_ROOT=/path/to/everything-zcode/toolkit
```

### Option 3: Adopt the workflow only

Even without installing anything, adopt the two highest-value habits:

1. **worklog.md protocol** — every session reads it first, appends checkpoints, ends with a handover. Cross-session memory is the single biggest productivity multiplier.
2. **Verification loop** — compilation is not done. Lint + dev.log + browser golden path, every feature, no exceptions.

---

## Key Concepts

### External Memory (worklog.md)
The conversation is volatile; the worklog is not. It carries decisions, state, and next steps across sessions and between agents. Format is enforced by `/checkpoint` and `/handoff`.

### Verification Loops
Every feature passes: `lint → dev.log → browser golden path → layout`. The e2e-runner agent and browser-verification skill encode this as a repeatable protocol.

### Delegation as Context Protection
Subagents get fresh context windows. Explore for searches, code-reviewer for findings, full-stack-developer for self-contained builds. You keep orchestration; they absorb the noise.

### Continuous Learning
`/learn` converts hard-won session discoveries into skills with pitfalls sections. After ~10 sessions the toolkit encodes months of experience.

### Confidence-Gated Reviews
Reviews report only >80% confident findings with file:line evidence and failure scenarios. Severity inflation erodes trust faster than missed findings.

---

## Important Notes

### Model Selection
- `glm-4.6` for code-heavy agents (reviewer, resolver, designer)
- `glm-4.5-air` for lightweight agents (doc-updater, worklog-keeper)

### Customization
These configs encode one workflow. You should:
1. Start with what resonates
2. Modify for your stack
3. Remove what you don't use
4. Add your own patterns via `/learn`

---

## License

MIT — use freely, modify as needed, contribute back if you can.
