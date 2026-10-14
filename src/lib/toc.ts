'use client';

/**
 * Shared slugify used both by the MarkdownViewer (heading ids)
 * and the PreviewToc (anchor links) so they always agree.
 */
export function slugifyHeading(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[`*_~\[\]()]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return base || 'heading';
}

export interface TocEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

/**
 * Extract h2/h3 headings from a markdown body (code fences ignored)
 * and build the same ids the MarkdownViewer will render.
 */
export function extractToc(body: string): TocEntry[] {
  const lines = body.split('\n');
  const entries: TocEntry[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[`*_~]/g, '').trim();
    entries.push({
      id: slugifyHeading(match[2]),
      text,
      depth: match[1].length === 2 ? 2 : 3,
    });
  }
  return entries;
}
