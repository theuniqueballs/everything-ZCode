import fs from 'fs';
import path from 'path';
import { parseFrontmatter } from './frontmatter';
import type {
  ToolkitCatalog,
  ToolkitCategory,
  ToolkitCategoryId,
  ToolkitItem,
} from './toolkit-types';

const TOOLKIT_ROOT = path.join(process.cwd(), 'toolkit');

export const CATEGORY_META: Record<
  ToolkitCategoryId,
  { label: string; labelEn: string; description: string; icon: string }
> = {
  agents: {
    label: 'Агенты',
    labelEn: 'Agents',
    description: 'Субагенты с ограниченной зоной ответственности — делегируйте им через Task tool, чтобы защитить свой контекст.',
    icon: 'Bot',
  },
  commands: {
    label: 'Команды',
    labelEn: 'Commands',
    description: 'Slash-команды для быстрых повторяемых сценариев: планирование, ревью, верификация, обучение.',
    icon: 'Slash',
  },
  skills: {
    label: 'Скиллы',
    labelEn: 'Skills',
    description: 'Знания и паттерны предметной области, которые сессия подгружает автоматически при совпадении задачи.',
    icon: 'Sparkles',
  },
  rules: {
    label: 'Правила',
    labelEn: 'Rules',
    description: 'Всегда действующие guidelines: безопасность, стиль, верификация, git-гигиена, делегирование.',
    icon: 'Scale',
  },
  hooks: {
    label: 'Хуки',
    labelEn: 'Hooks',
    description: 'Автоматизации на событиях: защита от footgun-ов, напоминания о checkpoint, восстановление памяти.',
    icon: 'Webhook',
  },
  contexts: {
    label: 'Контексты',
    labelEn: 'Contexts',
    description: 'Оверлеи системного промпта по режимам работы: разработка, ревью, исследование.',
    icon: 'Layers',
  },
  settings: {
    label: 'Настройки',
    labelEn: 'Settings',
    description: 'Готовый settings.json: права, хуки, MCP-серверы, предпочтения моделей GLM.',
    icon: 'Settings2',
  },
};

const CATEGORY_ORDER: ToolkitCategoryId[] = [
  'agents',
  'commands',
  'skills',
  'rules',
  'hooks',
  'contexts',
  'settings',
];

/** Parse frontmatter — see lib/frontmatter.ts (re-exported for server usage). */
export { parseFrontmatter };

/** Human title from a file name or frontmatter name. */
function deriveTitle(fileName: string, meta: Record<string, string>): string {
  if (meta.name) return meta.name;
  const base = fileName.replace(/\.(md|json|js)$/, '');
  return base;
}

function safeReadFile(absPath: string): string | null {
  try {
    return fs.readFileSync(absPath, 'utf8');
  } catch {
    return null;
  }
}

/** Recursively collect files under a directory. */
function collectFiles(dir: string, baseDir: string = dir): string[] {
  const out: string[] = [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectFiles(full, baseDir));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

function buildItem(absPath: string, category: ToolkitCategoryId): ToolkitItem | null {
  const relPath = path.relative(TOOLKIT_ROOT, absPath).split(path.sep).join('/');
  const content = safeReadFile(absPath);
  if (content === null) return null;

  const { meta, body } = parseFrontmatter(content);
  const fileName = path.basename(absPath);
  const title = deriveTitle(fileName, meta);
  const description =
    meta.description ||
    body
      .split('\n')
      .find((l) => l.trim() && !l.startsWith('#') && !l.startsWith('```'))
      ?.replace(/[#*`>]/g, '')
      .trim()
      .slice(0, 160) ||
    'Конфигурационный файл тулкита.';

  return {
    path: relPath,
    category,
    name: title,
    title,
    description,
    meta,
    size: Buffer.byteLength(content, 'utf8'),
    lines: content.split('\n').length,
    content,
  };
}

let cache: { catalog: ToolkitCatalog; at: number } | null = null;
const CACHE_TTL_MS = 30_000;

/** Load the full toolkit catalog (with content). Cached for 30s. */
export function loadToolkitCatalog(): ToolkitCatalog {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.catalog;

  const categories: ToolkitCategory[] = [];
  let totalItems = 0;
  let totalFiles = 0;

  for (const categoryId of CATEGORY_ORDER) {
    const meta = CATEGORY_META[categoryId];
    const items: ToolkitItem[] = [];

    if (categoryId === 'settings') {
      for (const file of ['settings.json', 'marketplace.json', 'README.md']) {
        const abs = path.join(TOOLKIT_ROOT, file);
        if (!fs.existsSync(abs)) continue;
        const item = buildItem(abs, 'settings');
        if (item) items.push(item);
      }
    } else {
      const dirPath =
        categoryId === 'hooks' ? path.join(TOOLKIT_ROOT, 'hooks') : path.join(TOOLKIT_ROOT, categoryId);
      for (const abs of collectFiles(dirPath)) {
        const item = buildItem(abs, categoryId);
        if (item) items.push(item);
      }
    }

    items.sort((a, b) => a.path.localeCompare(b.path));
    totalItems += items.length;
    totalFiles += items.length;
    categories.push({ id: categoryId, ...meta, items });
  }

  const catalog: ToolkitCatalog = {
    categories,
    totalItems,
    totalFiles,
    generatedAt: new Date().toISOString(),
  };
  cache = { catalog, at: Date.now() };
  return catalog;
}
