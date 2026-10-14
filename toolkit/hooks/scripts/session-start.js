#!/usr/bin/env node
/**
 * SessionStart hook — restore working context at session start.
 * Prints the tail of worklog.md so the agent starts with full memory.
 * Set WORKLOG_PATH to override the default location.
 */
const fs = require('fs');
const path = require('path');

const worklogPath =
  process.env.WORKLOG_PATH ||
  path.join(process.cwd(), 'worklog.md');

try {
  if (!fs.existsSync(worklogPath)) {
    console.log(
      '[session-start] No worklog.md found. First session? Consider creating one for cross-session memory.'
    );
    process.exit(0);
  }

  const content = fs.readFileSync(worklogPath, 'utf8');
  const lines = content.split('\n');
  const tail = lines.slice(-60).join('\n'); // last section is the freshest

  console.log('[session-start] Restoring context from worklog.md (tail):');
  console.log('---');
  console.log(tail);
  console.log('---');
  console.log(
    '[session-start] Read the full worklog.md if you need earlier history. Update it when you finish work.'
  );
} catch (err) {
  console.error(`[session-start] Failed to read worklog: ${err.message}`);
}
