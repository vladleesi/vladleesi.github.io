import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { DOMParser } from 'linkedom';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { checkRobots } from './check-robots.mjs';
import { root as siteRoot } from './serve.mjs';

const root = resolve(process.argv[2] || siteRoot);
const requireAssetVersions = process.argv.includes('--versioned');
const assetVersions = new Set();
const origin = 'https://vladleesi.dev';
const files = ['index.html', ...(await readdir(resolve(root, 'posts'))).filter(file => file.endsWith('.html')).map(file => 'posts/' + file)];
const documents = new Map();
const canonicals = new Set();
const titles = new Set();
const descriptions = new Set();
const publicationDates = new Map();
const read = file => readFile(resolve(root, file), 'utf8');
const meta = (document, name) => document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute('content');
const asArray = value => value === undefined ? [] : Array.isArray(value) ? value : [value];
checkRobots(await read('robots.txt'), origin);
const sourcePath = url => {
  assert.equal(url.origin, origin, `Unexpected site origin: ${url}`);
  const path = decodeURIComponent(url.pathname);
  const file = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
  assert.ok(file.startsWith(root + sep), `Path outside site: ${url}`);
  return file;
};

for (const file of files) {
  const document = new DOMParser().parseFromString(await read(file), 'text/html');
  documents.set(resolve(root, file), document);
  const canonical = origin + (file === 'index.html' ? '/' : '/' + file);
  assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1, `${file}: exactly one canonical required`);
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute('href'), canonical, `${file}: canonical mismatch`);
  canonicals.add(canonical);
  assert.equal(document.documentElement.getAttribute('lang'), 'en', `${file}: missing English language`);
  assert.equal(document.querySelectorAll('h1').length, 1, `${file}: exactly one H1 required`);
  assert.ok(document.querySelector('main')?.textContent.trim(), `${file}: static main content required`);
  for (const [value, seen, label] of [[document.querySelector('title')?.textContent.trim(), titles, 'title'], [meta(document, 'description'), descriptions, 'description']]) {
    assert.ok(value && !seen.has(value), `${file}: missing or duplicate ${label}`);
    seen.add(value);
  }
  assert.ok(!/noindex|none/i.test(meta(document, 'robots') || ''), `${file}: accidentally excluded from indexing`);
  assert.equal(meta(document, 'og:url'), canonical, `${file}: Open Graph URL mismatch`);
  for (const key of ['og:title', 'og:description', 'og:image', 'og:image:alt', 'twitter:image', 'twitter:image:alt']) {
    assert.ok(meta(document, key), `${file}: missing ${key}`);
  }
  assert.equal(meta(document, 'twitter:card'), 'summary_large_image', `${file}: social card mismatch`);
  for (const key of ['og:image', 'twitter:image']) {
    const image = new URL(meta(document, key));
    assert.equal(image.protocol, 'https:', `${file}: social image must use HTTPS`);
    if (image.origin === origin) assert.ok((await stat(sourcePath(image))).isFile(), `${file}: missing social image`);
  }
  const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].map(script => JSON.parse(script.textContent));
  assert.ok(schemas.length, `${file}: missing structured data`);
  for (const schema of schemas) assert.equal(schema['@context'], 'https://schema.org', `${file}: incorrect schema context`);
  if (file.startsWith('posts/')) {
    const published = document.querySelector('.article-meta time')?.getAttribute('datetime');
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(published), `${file}: invalid publication date`);
    publicationDates.set(canonical, published);
    const article = schemas.find(schema => schema['@type'] === 'BlogPosting');
    assert.ok(article, `${file}: missing BlogPosting`);
    assert.equal(article.headline, document.querySelector('h1').textContent.trim(), `${file}: schema headline differs from article`);
    assert.equal(article.description, meta(document, 'description'), `${file}: schema description mismatch`);
    assert.equal(article.datePublished, published, `${file}: schema publication date mismatch`);
    assert.equal(article.mainEntityOfPage, canonical, `${file}: schema page mismatch`);
    assert.equal(article.author?.name, 'Vladislav Kochetov', `${file}: article author mismatch`);
    assert.equal(article.author?.url, origin + '/', `${file}: author profile mismatch`);
    assert.equal(article.image, meta(document, 'og:image'), `${file}: schema/social image mismatch`);
  } else {
    assert.ok(schemas.some(schema => schema['@type'] === 'Person'), 'Homepage: missing Person schema');
    assert.ok(schemas.some(schema => schema['@type'] === 'WebSite'), 'Homepage: missing WebSite schema');
  }
}

let links = 0;
for (const [file, document] of documents) {
  const canonical = origin + (file === resolve(root, 'index.html') ? '/' : '/' + file.slice(root.length + 1));
  for (const element of document.querySelectorAll('[href], [src]')) {
    const value = element.getAttribute('href') ?? element.getAttribute('src');
    if (element.tagName === 'A') {
      const label = element.getAttribute('aria-label') || element.textContent.trim();
      assert.ok(!/^(?:here|click here|read more|learn more)$/i.test(label), `${file}: non-descriptive link text "${label}"`);
    }
    if (!value || /^(?:mailto:|tel:|data:)/i.test(value)) continue;
    assert.ok(!/^javascript:/i.test(value), `${file}: JavaScript URL`);
    const url = new URL(value, canonical);
    if (url.origin !== origin) continue;
    const target = sourcePath(url);
    assert.ok((await stat(target)).isFile(), `${file}: missing local target ${value}`);
    if (requireAssetVersions && url.pathname.startsWith('/assets/') && ['SCRIPT', 'LINK', 'IMG', 'SOURCE'].includes(element.tagName)) {
      assert.match(url.searchParams.get('v') || '', /^[a-f0-9]{16}$/, `${file}: missing deployment asset version on ${value}`);
      assetVersions.add(url.searchParams.get('v'));
    }
    if (url.hash && documents.has(target)) {
      assert.ok(documents.get(target).getElementById(decodeURIComponent(url.hash.slice(1))), `${file}: broken fragment ${value}`);
    }
    links++;
  }
}

if (requireAssetVersions) {
  assert.equal(assetVersions.size, 1, 'Deployment assets must use one consistent version');
  const version = [...assetVersions][0];
  for (const name of (await readdir(resolve(root, 'assets/css'))).filter(name => name.endsWith('.css'))) {
    const css = await read('assets/css/' + name);
    for (const match of css.matchAll(/url\(['"]?(\.\.\/[^'")]+)['"]?\)/g)) {
      assert.equal(new URL(match[1], origin + '/assets/css/' + name).searchParams.get('v'), version, `CSS dependency missing deployment version: ${name}`);
    }
  }
}

const parseXml = async file => {
  const source = await read(file);
  assert.equal(XMLValidator.validate(source), true, `${file}: invalid XML`);
  return new XMLParser({ ignoreAttributes: false }).parse(source);
};
const sitemap = asArray((await parseXml('sitemap.xml')).urlset?.url);
assert.deepEqual(new Set(sitemap.map(entry => entry.loc)), canonicals, 'Sitemap must contain exactly the canonical pages');
assert.equal(sitemap.length, canonicals.size, 'Sitemap contains duplicate URLs');
for (const entry of sitemap) {
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(entry.lastmod) && Number.isFinite(Date.parse(entry.lastmod)), 'Invalid sitemap lastmod');
  assert.ok(Date.parse(entry.lastmod) <= Date.now(), 'Future sitemap lastmod');
  if (publicationDates.has(entry.loc)) assert.ok(entry.lastmod >= publicationDates.get(entry.loc), 'lastmod precedes publication');
}
const feed = asArray((await parseXml('feed.xml')).rss?.channel?.item);
assert.equal(feed.length, publicationDates.size, 'RSS must list every article once');
assert.deepEqual(new Set(feed.map(item => item.link)), new Set(publicationDates.keys()), 'RSS article URLs mismatch');
for (const item of feed) {
  assert.equal(new Date(item.pubDate).toISOString().slice(0, 10), publicationDates.get(item.link), 'RSS publication date mismatch');
}
const home = documents.get(resolve(root, 'index.html'));
const writing = [...home.querySelectorAll('#posts .post-card')];
assert.deepEqual(new Set(writing.map(card => new URL(card.querySelector('a').getAttribute('href'), origin).href)), new Set(publicationDates.keys()), 'Homepage must link every article');
const dates = writing.map(card => card.querySelector('time').getAttribute('datetime'));
for (const card of writing) {
  const url = new URL(card.querySelector('a').getAttribute('href'), origin).href;
  assert.equal(card.querySelector('time').getAttribute('datetime'), publicationDates.get(url), 'Homepage publication date mismatch');
}
assert.deepEqual(dates, [...dates].sort().reverse(), 'Writing must be newest first');
console.log(`Site checks passed: ${files.length} pages, ${links} local links/assets, structured data, robots, sitemap, and RSS.`);
