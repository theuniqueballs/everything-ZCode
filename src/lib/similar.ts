import type { ToolkitItem } from './toolkit-types';

/**
 * Lightweight "similar configs" heuristic:
 * Jaccard similarity over word sets (name + title + description),
 * with a small same-category bonus. Pure, no deps, memoized per item.
 */

const STOPWORDS = new Set([
  // ru
  'для', 'и', 'в', 'на', 'с', 'по', 'при', 'все', 'как', 'это', 'чтобы', 'или',
  'конфиг', 'конфигов', 'файл', 'файлы',
  // en
  'and', 'for', 'with', 'that', 'this', 'from', 'into', 'when', 'your', 'you',
  'are', 'not', 'but', 'can', 'has', 'have', 'will', 'each', 'any', 'all', 'use',
  'using', 'used', 'the',
]);

/** Lowercase word tokens, length ≥ 3, without stopwords. */
function tokenize(text: string): Set<string> {
  const tokens = new Set<string>();
  for (const raw of text.toLowerCase().split(/[^a-zа-яё0-9]+/i)) {
    if (raw.length >= 3 && !STOPWORDS.has(raw)) tokens.add(raw);
  }
  return tokens;
}

/** Jaccard index: |A∩B| / |A∪B| ∈ [0, 1]. */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  return intersection / (a.size + b.size - intersection);
}

/** Memoized token sets — items are immutable during a session. */
const tokenCache = new WeakMap<ToolkitItem, Set<string>>();

function tokensOf(item: ToolkitItem): Set<string> {
  let tokens = tokenCache.get(item);
  if (!tokens) {
    tokens = tokenize(`${item.name} ${item.title} ${item.description}`);
    tokenCache.set(item, tokens);
  }
  return tokens;
}

export interface SimilarItem {
  item: ToolkitItem;
  /** Final score (Jaccard + category bonus), 0..1+. */
  score: number;
}

/** Same-category bonus added to the raw Jaccard score. */
const CATEGORY_BONUS = 0.08;
/** Minimum score to be considered "similar" at all. */
const MIN_SCORE = 0.05;

export function findSimilar(
  current: ToolkitItem,
  all: ToolkitItem[],
  topN = 3,
): SimilarItem[] {
  const base = tokensOf(current);
  return all
    .filter((item) => item.path !== current.path)
    .map((item) => ({
      item,
      score: jaccard(base, tokensOf(item)) + (item.category === current.category ? CATEGORY_BONUS : 0),
    }))
    .filter((entry) => entry.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
