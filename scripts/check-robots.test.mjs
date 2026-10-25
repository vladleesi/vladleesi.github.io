import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { checkRobots } from './check-robots.mjs';

const origin = 'https://vladleesi.dev';
const policy = `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;

test('the published robots policy allows all crawlers, pages, and assets', async () => {
  checkRobots(await readFile(new URL('../robots.txt', import.meta.url), 'utf8'), origin);
});

test('comments, CRLF, field casing, and insignificant whitespace are accepted', () => {
  checkRobots(` # Public site\r\n USER-AGENT :  * # All crawlers\r\nAllow:\t/\r\n\r\nSITEMAP: ${origin}/sitemap.xml\r\n`, origin);
});

for (const [name, text] of [
  ['blocked pages', policy.replace('Allow: /', 'Disallow: /posts/')],
  ['blocked CSS and JS', policy + 'Disallow: /assets/\n'],
  ['crawler-specific restrictions', policy + 'User-agent: Googlebot\nDisallow: /\n'],
  ['a restricted crawler group', policy.replace('User-agent: *', 'User-agent: Googlebot')],
  ['a restricted allow rule', policy.replace('Allow: /', 'Allow: /posts/')],
  ['missing sitemap', policy.replace(`Sitemap: ${origin}/sitemap.xml`, '')],
  ['a noncanonical sitemap', policy.replace(origin, 'https://example.com')],
  ['malformed directives', policy.replace('Allow:', 'Allow')],
  ['an empty policy', '']
]) {
  test(`rejects ${name}`, () => {
    assert.throws(() => checkRobots(text, origin), { code: 'ERR_ASSERTION' });
  });
}
