---
description: UI polish pass — spacing, responsiveness, dark mode, micro-interactions, accessibility
allowed-tools: Task, Read, Edit, Glob, Grep, Bash
---

Make the UI feel finished, not just functional.

## Steps

1. **Scope** — ask or determine which pages/components to polish. Default: everything touched this session.

2. **Delegate** — launch the **ui-polisher** subagent with explicit instructions:
   - Spacing consistency (p-4/p-6, gap-4/gap-6, aligned cards)
   - Mobile-first responsive check at 375/768/1280px
   - Sticky footer contract (`min-h-screen flex flex-col` + `mt-auto`)
   - Color discipline: NO blue/indigo, tokens only (`bg-background`, `text-muted-foreground`)
   - Dark mode: verify all surfaces and muted contrast
   - Hover states on all clickables, loading skeletons, pending button states
   - Toasts (sonner) for user feedback
   - A11y: aria-labels, alt text, focus rings, Escape closes dialogs

3. **Verify** — agent-browser pass at mobile + desktop widths after the pass. Check dev.log for new runtime errors.

4. **Iterate** — one polish category per pass; re-verify between passes; never redesign working layouts.

5. **Log** — append to worklog.md: what was polished, verification evidence.
