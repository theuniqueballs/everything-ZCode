---
name: shadcn-ui-theming
description: shadcn/ui component usage and theming rules for ZCode — what exists, token discipline, dark mode, color restrictions. Use when building or styling any UI.
---

# shadcn/ui + Theming for ZCode

## Available Components (src/components/ui/)

Full New York style set is pre-installed: button, card, dialog, sheet, drawer, tabs, accordion, select, dropdown-menu, popover, tooltip, command, table, form, input, textarea, checkbox, switch, slider, radio-group, calendar, badge, avatar, alert, progress, skeleton, scroll-area, separator, sonner (toasts), sidebar, resizable, carousel, chart, and more.

**Rule: compose from these before writing custom UI.**

## Token Discipline

```tsx
// RIGHT — semantic tokens
<div className="bg-background text-foreground">
  <Card className="bg-card border-border">
    <p className="text-muted-foreground">
  <Button className="bg-primary text-primary-foreground">

// WRONG — raw colors that break dark mode
<div className="bg-white text-black">
<div className="text-gray-500">
```

- NEVER blue or indigo unless the user explicitly requested it.
- Accent hierarchy: `primary` for actions, `secondary` for less prominent, `muted-foreground` for helper text, `destructive` only for errors/deletion.

## Dark Mode

- `next-themes` with `class` strategy; default to dark for dev-tool aesthetics.
- Every surface needs both-mode verification. Test with the toggle, not assumption.
- Custom scrollbar styling for scroll containers (thin, subtle, both modes).

## Composition Patterns

```tsx
// Card consistency
<Card className="p-6">          // pick p-4 OR p-6 per section, don't mix
  <CardHeader />
  <CardContent className="space-y-4" />

// Long lists — scroll inside, never stretch the page
<ScrollArea className="max-h-96 overflow-y-auto">

// Forms — react-hook-form + zod + shadcn form
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
```

## Footer Contract (mandatory)

```tsx
<div className="min-h-screen flex flex-col">
  <main className="flex-1">{children}</main>
  <footer className="mt-auto border-t ...">...</footer>
</div>
```

Footer sticks to bottom on short pages, pushes down naturally on long ones, never overlays content. Respect safe-area insets on mobile.

## Polish Checklist

- Hover on ALL clickables (`hover:bg-accent transition-colors`)
- Icon-only buttons get `aria-label` + `sr-only` text
- Focus rings visible (`focus-visible:ring-2 ring-ring`)
- Skeletons for loading; disabled+spinner for pending buttons
- Toast via sonner for action feedback (copied, saved, error)
