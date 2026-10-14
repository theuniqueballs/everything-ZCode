export type DiffLineType = 'same' | 'add' | 'remove';

export interface DiffLine {
  type: DiffLineType;
  text: string;
}

export interface DiffStats {
  added: number;
  removed: number;
  same: number;
  /** Similarity 0..100 — shared lines relative to the bigger input. */
  similarity: number;
}

/**
 * Classic LCS line diff with common prefix/suffix trimming.
 * Toolkit configs are small (<500 lines each), so the O(n·m) DP table is fine.
 */
export function diffLines(aText: string, bText: string): DiffLine[] {
  const a = aText.split('\n');
  const b = bText.split('\n');
  const n = a.length;
  const m = b.length;

  // Trim common prefix/suffix to shrink the DP table dramatically
  // for configs that share frontmatter or endings.
  let start = 0;
  while (start < n && start < m && a[start] === b[start]) start++;
  let endA = n;
  let endB = m;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const midA = a.slice(start, endA);
  const midB = b.slice(start, endB);
  const rows = midA.length;
  const cols = midB.length;

  const width = cols + 1;
  const dp = new Uint16Array((rows + 1) * width);
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      dp[r * width + c] =
        midA[r] === midB[c]
          ? dp[(r + 1) * width + (c + 1)] + 1
          : Math.max(dp[(r + 1) * width + c], dp[r * width + (c + 1)]);
    }
  }

  const out: DiffLine[] = [];
  for (let i = 0; i < start; i++) out.push({ type: 'same', text: a[i] });

  let r = 0;
  let c = 0;
  while (r < rows && c < cols) {
    if (midA[r] === midB[c]) {
      out.push({ type: 'same', text: midA[r] });
      r++;
      c++;
    } else if (dp[(r + 1) * width + c] >= dp[r * width + (c + 1)]) {
      out.push({ type: 'remove', text: midA[r] });
      r++;
    } else {
      out.push({ type: 'add', text: midB[c] });
      c++;
    }
  }
  while (r < rows) out.push({ type: 'remove', text: midA[r++] });
  while (c < cols) out.push({ type: 'add', text: midB[c++] });

  for (let i = endA; i < n; i++) out.push({ type: 'same', text: a[i] });
  return out;
}

export function diffStats(lines: DiffLine[], aText: string, bText: string): DiffStats {
  let added = 0;
  let removed = 0;
  let same = 0;
  for (const line of lines) {
    if (line.type === 'add') added++;
    else if (line.type === 'remove') removed++;
    else same++;
  }
  const maxLen = Math.max(aText.split('\n').length, bText.split('\n').length, 1);
  return {
    added,
    removed,
    same,
    similarity: Math.round((same / maxLen) * 100),
  };
}

/** Unified-diff text for clipboard export. */
export function formatUnifiedDiff(pathA: string, pathB: string, lines: DiffLine[]): string {
  const head = `--- a/toolkit/${pathA}\n+++ b/toolkit/${pathB}`;
  const body = lines
    .filter((l) => l.type !== 'same')
    .map((l) => `${l.type === 'add' ? '+' : '-'} ${l.text}`)
    .join('\n');
  return `${head}\n${body}`;
}
