#!/usr/bin/env node
/**
 * Stop hook — checkpoint reminder when the agent finishes responding.
 * Checks whether worklog.md was touched in this session; nudges if not.
 */
const fs = require('fs');
const path = require('path');

const worklogPath = process.env.WORKLOG_PATH || path.join(process.cwd(), 'worklog.md');

try {
  if (!fs.existsSync(worklogPath)) {
    console.log(
      '[stop-checkpoint] Reminder: no worklog.md updates this project yet. Run /checkpoint to persist session state.'
    );
    process.exit(0);
  }

  const stat = fs.statSync(worklogPath);
  const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);

  if (ageHours > 8) {
    console.log(
      '[stop-checkpoint] worklog.md is over 8 hours stale. If this session did meaningful work, append a checkpoint (see /checkpoint).'
    );
  } else {
    console.log('[stop-checkpoint] worklog.md is fresh. Good session hygiene.');
  }
  process.exit(0);
} catch (err) {
  process.exit(0);
}
