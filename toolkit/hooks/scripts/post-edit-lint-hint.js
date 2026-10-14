#!/usr/bin/env node
/**
 * PostToolUse(Edit|Write) hint — remind to lint after meaningful edit bursts.
 * Tracks edit counts in a temp file; every 10 edits suggests running lint.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const COUNTER = path.join(os.tmpdir(), 'zcode-edit-counter');
const THRESHOLD = 10;

try {
  let count = 0;
  try {
    count = parseInt(fs.readFileSync(COUNTER, 'utf8'), 10) || 0;
  } catch (_) {
    count = 0;
  }
  count += 1;
  fs.writeFileSync(COUNTER, String(count));

  if (count % THRESHOLD === 0) {
    console.log(
      `[post-edit-hint] ${count} edits this session. Suggestion: run \`bun run lint\` and tail dev.log to catch drift early.`
    );
  }
  process.exit(0);
} catch (err) {
  process.exit(0);
}
