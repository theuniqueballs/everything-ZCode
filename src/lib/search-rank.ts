import type { ToolkitItem } from './toolkit-types';

/**
 * Ranked search over toolkit items.
 *
 * Multi-token queries use AND semantics (every token must match somewhere);
 * the final score is the sum of per-token scores so results with stronger
 * matches in name/title rank above content-only matches.
 */

/** Field weights for a single token. */
const W = {
  NAME_EXACT: 120,
  NAME_START: 80,
  NAME_WORD_START: 60,
  NAME_INCLUDES: 45,
  TITLE_START: 26,
  TITLE_INCLUDES: 18,
  PATH_INCLUDES: 12,
  DESC_INCLUDES: 9,
  CONTENT_INCLUDES: 3,
} as const;

function tokenScore(item: ToolkitItem, token: string): number {
  const name = item.name.toLowerCase();
  const title = (item.title || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const path = item.path.toLowerCase();

  // Best: exact / prefix / word-prefix / substring in the short name.
  if (name === token) return W.NAME_EXACT;
  if (name.startsWith(token)) return W.NAME_START;
  if (name.split(/[^a-z0-9]+/).some((word) => word.startsWith(token))) {
    return W.NAME_WORD_START;
  }
  if (name.includes(token)) return W.NAME_INCLUDES;

  if (title.startsWith(token)) return W.TITLE_START;
  if (title.includes(token)) return W.TITLE_INCLUDES;

  if (path.includes(token)) return W.PATH_INCLUDES;
  if (desc.includes(token)) return W.DESC_INCLUDES;
  if (item.content.toLowerCase().includes(token)) return W.CONTENT_INCLUDES;

  return 0;
}

/** 0 = no match; otherwise higher = better. Empty query matches everything. */
export function searchScore(item: ToolkitItem, query: string): number {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 1;
  let total = 0;
  for (const token of tokens) {
    const score = tokenScore(item, token);
    if (score === 0) return 0; // AND semantics — one miss disqualifies
    total += score;
  }
  return total;
}

/**
 * Filter + rank: keeps only matching items (stable order for ties)
 * sorted by descending score.
 */
export function rankSearchResults<T extends ToolkitItem>(items: T[], query: string): T[] {
  if (!query.trim()) return items;
  return items
    .map((item, index) => ({ item, index, score: searchScore(item, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);
}

/* ------------------------------------------------------------------ */
/* Issue #6: match-mode visibility. A hit can come from the name (the  */
/* bold row title), from visible metadata (path / description) or ONLY */
/* from the file body — the last case is invisible to the user, so the */
/* row is labeled and a snippet is shown.                              */
/* ------------------------------------------------------------------ */

export type SearchMatchKind = 'name' | 'meta' | 'content';

/** Why an item matched: 'name' — name/title hit; 'meta' — path or
 * description hit (both visible in the row); 'content' — body-only hit
 * (invisible → needs a badge + snippet). Empty query → 'name'. */
export function matchKind(item: ToolkitItem, query: string): SearchMatchKind {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 'name';
  const name = item.name.toLowerCase();
  const title = (item.title || '').toLowerCase();
  const path = item.path.toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const content = item.content.toLowerCase();
  let sawContent = false;
  for (const token of tokens) {
    if (name.includes(token) || title.includes(token)) return 'name';
    if (path.includes(token) || desc.includes(token)) {
      // visible metadata — keep scanning remaining tokens: a later token
      // may still hit the name, which ranks the row as a name-match
      sawContent = sawContent || content.includes(token);
      continue;
    }
    if (content.includes(token)) sawContent = true;
  }
  return sawContent ? 'content' : 'meta';
}

/** First content occurrence of any query token, ±radius chars, single-lined.
 * Returns null when nothing is found in the body. */
export function contentSnippet(item: ToolkitItem, query: string, radius = 48): string | null {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;
  const content = item.content;
  const lower = content.toLowerCase();
  let best: number | null = null;
  for (const token of tokens) {
    const idx = lower.indexOf(token);
    if (idx >= 0 && (best === null || idx < best)) best = idx;
  }
  if (best === null) return null;
  const start = Math.max(0, best - radius);
  const end = Math.min(content.length, best + radius + Math.max(...tokens.map((t) => t.length)));
  const raw = content.slice(start, end).replace(/\s+/g, ' ').trim();
  return `${start > 0 ? '…' : ''}${raw}${end < content.length ? '…' : ''}`;
}
