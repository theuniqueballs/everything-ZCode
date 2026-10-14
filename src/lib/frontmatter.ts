/** Parse a simple YAML frontmatter block (key: single-line value). Pure — safe for client. */
export function parseFrontmatter(content: string): {
  meta: Record<string, string>;
  body: string;
} {
  const meta: Record<string, string> = {};
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta, body: content };

  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key && value) meta[key] = value;
  }
  return { meta, body: content.slice(match[0].length) };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
