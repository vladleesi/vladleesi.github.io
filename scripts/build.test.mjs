import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { buildSite } from './build.mjs';

test('deployment versions cover asset changes and dependencies without changing source or publishing development files', async () => {
  const root = await mkdtemp(resolve(tmpdir(), 'portfolio-build-'));
  try {
    for (const path of ['assets/css', 'assets/js', 'assets/fonts', 'assets/.private', 'posts', 'reports', 'node_modules']) await mkdir(resolve(root, path), { recursive: true });
    const html = `<link rel="stylesheet" href="assets/css/styles.css?v=old"><link rel="preload" href="assets/fonts/font.woff2"><script src="assets/js/theme.js" defer></script><noscript><link rel="icon" href="assets/icon.svg"></noscript><img src="assets/icon.svg" alt=""><a href="assets/resume.pdf">Resume</a><link rel="canonical" href="https://vladleesi.dev/"><script src="https://example.com/external.js"></script>`;
    const css = `@font-face { src: url('../fonts/font.woff2'); } body { background: url(https://example.com/image.png); filter: url(#filter); }`;
    const files = {
      'index.html': html, 'posts/article.html': '<link rel="stylesheet" href="../assets/css/styles.css"><a href="../">Home</a>',
      'assets/css/styles.css': css, 'assets/js/theme.js': 'console.log("theme");',
      'assets/fonts/font.woff2': 'font one', 'assets/icon.svg': '<svg></svg>', 'assets/resume.pdf': 'resume',
      'assets/.private/secret': 'excluded', 'assets/.DS_Store': 'excluded',
      'CNAME': 'vladleesi.dev', 'robots.txt': 'User-agent: *', 'feed.xml': '<rss/>', 'sitemap.xml': '<urlset/>',
      'AGENTS.md': 'private instructions', 'package.json': '{}', 'reports/private.txt': 'excluded'
    };
    for (const [file, contents] of Object.entries(files)) await writeFile(resolve(root, file), contents);
    const first = await buildSite(root);
    const read = file => readFile(resolve(first.output, file), 'utf8');
    const outputHtml = await read('index.html');
    assert.ok(outputHtml.includes(`styles.css?v=${first.version}`));
    assert.ok(outputHtml.includes(`font.woff2?v=${first.version}`));
    assert.ok(outputHtml.includes(`theme.js?v=${first.version}`));
    assert.ok(outputHtml.includes(`<noscript><link rel="icon" href="assets/icon.svg?v=${first.version}"></noscript>`));
    assert.ok(outputHtml.includes(`<img src="assets/icon.svg?v=${first.version}"`));
    assert.ok(outputHtml.includes('<a href="assets/resume.pdf">'));
    assert.ok(outputHtml.includes('href="https://vladleesi.dev/"'));
    assert.ok(outputHtml.includes('src="https://example.com/external.js"'));
    assert.ok((await read('assets/css/styles.css')).includes(`url('../fonts/font.woff2?v=${first.version}')`));
    assert.ok((await read('assets/css/styles.css')).includes('url(https://example.com/image.png)'));
    assert.ok((await read('assets/css/styles.css')).includes('url(#filter)'));
    assert.ok((await read('posts/article.html')).includes(`../assets/css/styles.css?v=${first.version}`));
    assert.equal(await readFile(resolve(root, 'index.html'), 'utf8'), html);
    assert.equal(await readFile(resolve(root, 'assets/css/styles.css'), 'utf8'), css);
    assert.deepEqual((await readdir(first.output)).sort(), ['.nojekyll', 'CNAME', 'assets', 'feed.xml', 'index.html', 'posts', 'robots.txt', 'sitemap.xml']);
    assert.ok(!(await readdir(resolve(first.output, 'assets'))).some(name => name.startsWith('.')));
    await writeFile(resolve(first.output, 'obsolete.txt'), 'old build');
    const second = await buildSite(root);
    assert.equal(second.version, first.version);
    assert.equal(await read('index.html'), outputHtml);
    assert.ok(!(await readdir(second.output)).includes('obsolete.txt'));
    await writeFile(resolve(root, 'index.html'), html + '<p>Text only</p>');
    assert.equal((await buildSite(root)).version, first.version);
    await writeFile(resolve(root, 'assets/fonts/font.woff2'), 'font two');
    const fontChange = await buildSite(root);
    assert.notEqual(fontChange.version, first.version);
    assert.ok((await read('assets/css/styles.css')).includes(`font.woff2?v=${fontChange.version}`));
    assert.ok((await read('index.html')).includes(`font.woff2?v=${fontChange.version}`));
    await writeFile(resolve(root, 'assets/css/styles.css'), css + 'body { color: purple; }');
    const cssChange = await buildSite(root);
    assert.notEqual(cssChange.version, fontChange.version);
    assert.ok((await read('index.html')).includes(`styles.css?v=${cssChange.version}`));
    await writeFile(resolve(root, 'assets/js/theme.js'), 'console.log("updated");');
    const scriptChange = await buildSite(root);
    assert.notEqual(scriptChange.version, cssChange.version);
    assert.ok((await read('index.html')).includes(`theme.js?v=${scriptChange.version}`));
    await writeFile(resolve(root, 'assets/icon.svg'), '<svg><path/></svg>');
    const iconChange = await buildSite(root);
    assert.notEqual(iconChange.version, scriptChange.version);
    assert.ok((await read('index.html')).includes(`theme.js?v=${iconChange.version}`));
    await assert.rejects(buildSite(root, root), /must not replace/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
