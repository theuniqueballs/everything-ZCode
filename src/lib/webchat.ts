import { parseFrontmatter } from './frontmatter';
import type { ToolkitCategoryId, ToolkitItem } from './toolkit-types';

/**
 * Web-chat compatibility layer.
 *
 * EZC configs are written for the ZCode CLI/IDE (file-based `.zcode/` configs),
 * but users increasingly want the same behaviour inside web chats such as
 * SuperZ on chat.z.ai. A web chat cannot load `~/.zcode/` files — the config
 * must be delivered as a prompt. This module decides, per category, whether
 * that conversion is meaningful and builds the paste-ready prompt.
 *
 * Native install paths below are verified against zcode.z.ai docs (agents,
 * skills, AGENTS.md pages).
 */

export type WebChatSupport = 'full' | 'partial' | 'none';

const SUPPORT: Record<ToolkitCategoryId, WebChatSupport> = {
  /* Prompt fully conveys the config's behaviour. */
  agents: 'full',
  skills: 'full',
  rules: 'full',
  contexts: 'full',
  /* Prompt works, but it is a template — arguments/placeholders are manual. */
  commands: 'partial',
  /* JS event handlers / CLI settings — cannot live in a web chat. */
  hooks: 'none',
  settings: 'none',
};

export function webchatSupport(category: ToolkitCategoryId): WebChatSupport {
  return SUPPORT[category];
}

export function canUseInChat(category: ToolkitCategoryId): boolean {
  return SUPPORT[category] !== 'none';
}

/** Skill directory name, e.g. "skills/z-ai-sdk/SKILL.md" → "z-ai-sdk". */
function skillDir(item: ToolkitItem): string {
  return item.path.split('/')[1] ?? item.name;
}

/** File base name, e.g. "agents/code-reviewer.md" → "code-reviewer". */
function fileBase(item: ToolkitItem): string {
  const base = item.path.split('/').pop() ?? item.name;
  return base.replace(/\.(md|json|js)$/, '');
}

/**
 * Native (CLI/IDE) install target per category, verified against
 * zcode.z.ai docs. `mode: 'place'` = put the file there as-is;
 * `mode: 'merge'` = merge the content into the target file.
 * `null` → no verified native hint (web-chat prompt is the way).
 */
export function nativeInstallHint(
  item: ToolkitItem,
): { path: string; mode: 'place' | 'merge' } | null {
  switch (item.category) {
    case 'agents':
      return { path: `~/.zcode/agents/${fileBase(item)}.md`, mode: 'place' };
    case 'skills':
      return { path: `~/.zcode/skills/${skillDir(item)}/SKILL.md`, mode: 'place' };
    case 'rules':
    case 'contexts':
      return { path: '~/.zcode/AGENTS.md', mode: 'merge' };
    case 'commands':
      return { path: `~/.zcode/commands/${fileBase(item)}.md`, mode: 'place' };
    default:
      return null;
  }
}

/** Opening frame of the generated prompt, per category (model-facing, EN). */
const FRAMES: Partial<
  Record<ToolkitCategoryId, (name: string, desc: string) => string>
> = {
  agents: (name, desc) =>
    `Act as the "${name}" agent for this conversation.\nRole: ${desc}\nTreat everything between the markers below as your system prompt.`,
  skills: (name, desc) =>
    `Adopt the skill "${name}".\nUse it whenever my request matches: ${desc}\nFollow the skill instructions between the markers below.`,
  rules: (_name, desc) =>
    `Adopt the following standing rules for this entire conversation and apply them to every response.\nScope: ${desc}`,
  contexts: (name, desc) =>
    `Switch to the working context "${name}" for this conversation.\nPurpose: ${desc}\nTreat the text between the markers below as a system-prompt overlay.`,
  commands: (name, desc) =>
    `Prompt template "${name}": ${desc}\nReplace any <placeholders> in the template with real values from my request, then execute it.`,
};

/**
 * Build a paste-ready prompt for a web chat (chat.z.ai / SuperZ, or any
 * other assistant that accepts text instructions). The config body is
 * embedded verbatim; the frame adapts to the category.
 */
export function buildChatPrompt(item: ToolkitItem): string {
  const { body } = parseFrontmatter(item.content);
  const desc = item.meta.description || item.description;
  const frame = FRAMES[item.category];
  const head = frame
    ? frame(item.name, desc)
    : `Follow the configuration "${item.name}": ${desc}`;

  const trimmedBody = body.trim();

  return [
    head,
    '',
    '--- configuration begin ---',
    trimmedBody,
    '--- configuration end ---',
    '',
    'Acknowledge with one short line, then apply this configuration from now on. If an instruction assumes CLI capabilities a web chat does not have (filesystem, git, local tools), adapt gracefully instead of refusing.',
  ].join('\n');
}
