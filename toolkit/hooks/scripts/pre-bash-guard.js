#!/usr/bin/env node
/**
 * PreToolUse(Bash) guard — block the classic footguns before they run.
 * Reads tool input from stdin: { tool_name, tool_input: { command } }
 * Exit code 2 = block the command; 0 = allow.
 */
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}');
    const command = (input.tool_input && input.tool_input.command) || '';

    const rules = [
      {
        test: /next\s+build|bun\s+run\s+build/,
        reason:
          'BLOCKED: `next build` is forbidden in this environment (dev server on port 3000 only). Use `bun run lint` for validation.',
      },
      {
        test: /rm\s+-rf\s+(\/|~|\$HOME)(\s|$)/,
        reason: 'BLOCKED: recursive delete of a root/home path. If you truly need this, run it manually after review.',
      },
      {
        test: /git\s+push\s+--force(\s|$)|git\s+push\s+-f(\s|$)/,
        reason: 'BLOCKED: force push. Use --force-with-lease or rebase properly.',
      },
      {
        test: /chmod\s+-R\s+777/,
        reason: 'BLOCKED: world-writable permissions. Use targeted permissions instead.',
      },
    ];

    for (const rule of rules) {
      if (rule.test.test(command)) {
        console.error('[pre-bash-guard] ' + rule.reason);
        process.exit(2);
      }
    }
    process.exit(0);
  } catch (err) {
    process.exit(0); // fail open — never break the session because of the guard
  }
});
