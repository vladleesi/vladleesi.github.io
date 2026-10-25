import assert from 'node:assert/strict';

export function checkRobots(text, origin) {
  const directives = text.split(/\r?\n/).map(line => line.replace(/#.*$/, '').trim()).filter(Boolean)
    .map(line => line.replace(/^([^:]+):\s*/, (_, name) => name.trim().toLowerCase() + ': '));
  // This public site needs one allow-all group, including CSS/JS, and its sitemap.
  // Reject additional rules/groups rather than implementing a general robots parser.
  assert.deepEqual(directives, [
    'user-agent: *',
    'allow: /',
    `sitemap: ${origin}/sitemap.xml`
  ], 'robots.txt must allow every crawler and path and advertise the canonical sitemap');
}
