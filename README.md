<div align="center">

# ⚡ Everything ZCode

**A complete collection of production-ready configs for ZCode / Z.ai — agents, commands, skills, rules, hooks and contexts, forged in real-world development with GLM models.**

Plus an interactive catalog website: instant ranked search, ⌘K palette, favorites, syntax highlighting, deep links, diff comparison, analytics, ZIP export, RU/EN and vim-style navigation.

**🌐 Live site: [theuniqueballs.github.io/everything-ZCode](https://theuniqueballs.github.io/everything-ZCode/)**

[![Deploy](https://github.com/theuniqueballs/everything-ZCode/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/theuniqueballs/everything-ZCode/actions/workflows/deploy-pages.yml) [![Configs](https://img.shields.io/badge/configs-45-emerald)](#-catalog) [![Categories](https://img.shields.io/badge/categories-7-emerald)](#-catalog) [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org) [![Bun](https://img.shields.io/badge/bun-%3E%3D1.1-f472b6)](https://bun.sh) [![License](https://img.shields.io/badge/license-MIT-emerald)](LICENSE)

[🇷🇺 Русская версия →](README.ru.md)

![Everything ZCode catalog](docs/screenshots/catalog.png)

</div>

---

## 🎯 Why

[everything-claude-code](https://github.com/WorldFlowAI/everything-claude-code) assembled an excellent library of configs for Claude Code. **Everything ZCode** is the same idea, adapted to the real-world **ZCode / Z.ai** environment (GLM models): dev logs, `agent-browser` verification, the worklog protocol, bun, the `XTransformPort` gateway and an SDK that only runs on the backend.

Every config is battle-tested practice, not a template in a vacuum: how to review code, do TDD, fix builds, manage context and keep things secure.

## 📦 Catalog

| Category | Count | What's inside |
|---|---:|---|
| 🤖 [Agents](toolkit/agents) | 8 | `code-reviewer`, `build-error-resolver`, `e2e-runner`, `refactor-cleaner`, `doc-updater`, `api-designer`, `ui-polisher`, `worklog-keeper` |
| ⌨️ [Commands](toolkit/commands) | 10 | `/plan`, `/review`, `/tdd`, `/fix-build`, `/refactor`, `/verify`, `/learn`, `/checkpoint`, `/handoff`, `/ui-polish` |
| ✨ [Skills](toolkit/skills) | 8 | `nextjs-16-patterns`, `z-ai-sdk`, `prisma-sqlite`, `shadcn-ui-theming`, `browser-verification`, `security-review`, `continuous-learning`, `context-management` |
| 📏 [Rules](toolkit/rules) | 6 | code style, agent delegation, context management, git workflow, security, testing |
| 🪝 [Hooks](toolkit/hooks) | 7 | pre-bash-guard, pre-write-guard, post-edit-lint-hint, session-start, stop-checkpoint-reminder + `hooks.json` |
| 🧠 [Contexts](toolkit/contexts) | 3 | dev, research, review |
| ⚙️ [Settings](toolkit/settings.json) | 3 | `settings.json`, `marketplace.json`, `README` |

**45 files** — each with YAML frontmatter in a format compatible with everything-claude-code.

## 🚀 Quick start

### Use the configs

1. Copy the files you need from `toolkit/` into your ZCode configuration (agents → `.zcode/agents/`, commands → `.zcode/commands/`, etc. — depending on your setup).
2. Or open the [live catalog](https://theuniqueballs.github.io/everything-ZCode/), find what you need via search/⌘K and hit **Copy**.
3. Adapt them to your project — the files are small and self-documenting.

### Run the catalog site locally

```bash
bun install        # or npm install / pnpm install
bun run dev        # http://localhost:3000
```

> The site reads the `toolkit/` files directly via the `/api/toolkit` API — add a config and it instantly appears in the catalog.

## 🌐 GitHub Pages deployment

The site deploys to **GitHub Pages** automatically via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):

- triggers on every push to `main`, a daily schedule (21:00 UTC = midnight MSK, keeping «config of the day» fresh) and manual dispatch
- builds a **static export** (`output: export` + basePath `/everything-ZCode`); the catalog is pre-generated into `toolkit-catalog.json` by `scripts/gen-catalog-json.ts`
- no secrets required — uses the built-in `GITHUB_TOKEN` with Pages permissions

## 🖥 Website features

- **Ranked search** — exact/prefix name matches rank above content mentions; multi-token AND; highlighting in both the list and the palette
- **Bilingual UI (RU/EN)** — toggle in the header, persisted choice, `<html lang>` kept in sync; the whole UI is translated, including toasts, dialogs and shortcuts
- **⌘K palette** — jump to any config or action
- **Slide-out detail sheet** — click any config (in the catalog, the config of the day, the palette or a deep link) and a readable panel slides out: full contents, table of contents, copy/download/share actions, similar configs and a link to the file on GitHub
- **Config of the day** — deterministic daily pick (Europe/Moscow calendar, changes at MSK midnight) + **date carousel**: ←/→ arrows (mouse and keyboard) browse yesterday's/tomorrow's configs and beyond, with relative labels («Yesterday», «in 5 days»), a back-to-today button and an in-place detail view — no surprise page jumps
- **Toolkit analytics** — category distribution, top-5 largest configs, aggregates
- **Favorites** ★ and **recents** — persisted in localStorage; favorites support **named collections** (create/switch/rename/delete) and **JSON import/export**
- **Syntax-highlighted preview** (bash/json/ts/yaml/…) with a table of contents
- **Deep links** — `#item=commands/tdd.md`, shareable URL for any config
- **Diff comparison** of two configs in unified mode with a similarity percentage
- **Similar configs** — smart recommendations in the preview (Jaccard over description words + category bonus)
- **Export**: copy a config or a whole category, download a file, **ZIP of the whole toolkit**, **ZIP of search results**
- **List density** — comfortable/compact catalog mode (persisted), memoized rows
- **Keyboard**: `j/k` / `↑↓` — navigate the list and palette, `/` — focus search, `⌘K` — palette, `?` — all shortcuts (grouped cheat-sheet)
- **SEO**: sitemap.xml, robots.txt, OG image, canonical metadata + dynamic per-item OG cards (`/api/og?item=…` in the server deployment)
- Dark/light theme, responsive from 375px, sticky footer, animations

![Mobile version](docs/screenshots/mobile.png)

## 🗂 Structure

```
├── toolkit/            # 45 configs (agents, commands, skills, rules, hooks…)
│   ├── agents/         # 8 subagents
│   ├── commands/       # 10 slash commands
│   ├── skills/         # 8 skills
│   ├── rules/          # 6 rules
│   ├── hooks/          # 5 hook scripts + hooks.json
│   ├── contexts/       # 3 contexts
│   └── settings.json   # settings + marketplace.json
├── src/                # catalog website (Next.js 16 App Router)
│   ├── app/api/toolkit # API: reads the catalog from toolkit/
│   └── components/     # catalog UI (shadcn/ui + Tailwind 4)
├── scripts/            # gen-catalog-json.ts — static catalog for GitHub Pages
└── prisma/             # DB schema (sqlite) for future site features
```

## 🙏 Acknowledgements

The project is a fork-adaptation of [**everything-claude-code**](https://github.com/WorldFlowAI/everything-claude-code) by WorldFlowAI. The idea, the format conventions (agents/commands/hooks with frontmatter) and the inspiration come from there; the content was rewritten from scratch for the ZCode / Z.ai environment.

## 📄 License

[MIT](LICENSE) © 2026 theuniqueballs. Feel free to copy and adapt the configs — that's exactly what they were written for.
