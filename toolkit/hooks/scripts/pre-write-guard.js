#!/usr/bin/env node
/**
 * PreToolUse(Write|Edit) guard — static analysis before writing files.
 * Warns about common ZCode mistakes: SDK in client code, debug leftovers.
 * Reads the tool input from stdin as JSON: { tool_name, tool_input: { file_path, content? } }
 */
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw || '{}');
    const filePath = (input.tool_input && input.tool_input.file_path) || '';
    const content =
      (input.tool_input && (input.tool_input.content || input.tool_input.new_string)) || '';

    const warnings = [];

    // 1. SDK in client code — critical boundary violation
    if (/\.tsx?$/.test(filePath) && content.includes("'use client'") === false) {
      // server files are fine
    }
    if (filePath && /\.tsx?$/.test(filePath) && /z-ai-web-dev-sdk/.test(content)) {
      const hasUseClient = content.split('\n').some((l) => l.trim() === "'use client'" || l.trim() === '"use client"');
      if (hasUseClient) {
        warnings.push('CRITICAL: z-ai-web-dev-sdk imported in a CLIENT component. Move to src/app/api/*/route.ts.');
      }
    }

    // 2. Absolute localhost fetch — gateway rule violation
    if (/fetch\(\s*[`'"]https?:\/\/(localhost|127\.0\.0\.1)/.test(content)) {
      warnings.push('GATEWAY: absolute localhost fetch detected. Use relative URLs; non-3000 ports need ?XTransformPort=<port>.');
    }

    // 3. Debug leftovers
    const consoleLogCount = (content.match(/console\.log\(/g) || []).length;
    if (consoleLogCount > 5) {
      warnings.push(`HYGIENE: ${consoleLogCount} console.log calls in one write — consider cleaning before commit.`);
    }

    if (/@ts-ignore/.test(content)) {
      warnings.push('TYPES: @ts-ignore detected. Fix the type instead of silencing it.');
    }

    if (warnings.length > 0) {
      console.error('[pre-write-guard] Warnings for ' + filePath + ':');
      warnings.forEach((w) => console.error('  - ' + w));
      // Non-blocking: warnings only. Exit 0 to allow the write.
    }
    process.exit(0);
  } catch (err) {
    // Never block work because the guard itself failed.
    process.exit(0);
  }
});
