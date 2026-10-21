import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const origin = 'https://vladleesi.dev';

async function listFiles(directory, prefix = '') {
  const result = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    if (entry.name.startsWith('.')) continue;
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Cannot publish symlink: ${name}`);
    if (entry.isDirectory()) result.push(...await listFiles(resolve(directory, entry.name), name + '/'));
    else if (entry.isFile()) result.push(name);
  }
  return result;
}

export async function buildSite(source = projectRoot, destination = resolve(source, '_site')) {
  const root = resolve(source);
  const output = resolve(destination);
  if (output === root || root.startsWith(output + sep)) throw new Error('Build output must not replace the source or its parent.');
  const assets = new Map();
  const hash = createHash('sha256').update(await readFile(fileURLToPath(import.meta.url)));
  for (const file of await listFiles(resolve(root, 'assets'), 'assets/')) {
    const bytes = await readFile(resolve(root, file));
    assets.set('/' + file, bytes);
    hash.update(file).update('\0').update(bytes).update('\0');
  }
  // One content-derived version also covers dependencies such as fonts and icons.
  const version = hash.digest('hex').slice(0, 16);
  function versionUrl(value, file) {
    if (!value || value.startsWith('#')) return value;
    const url = new URL(value, origin + '/' + file);
    if (url.origin !== origin || !url.pathname.startsWith('/assets/')) return value;
    if (!assets.has(decodeURIComponent(url.pathname))) throw new Error(`${file}: missing asset ${value}`);
    url.searchParams.set('v', version);
    return value.split(/[?#]/)[0] + url.search + url.hash;
  }
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const [path, bytes] of assets) {
    const target = resolve(output, '.' + path);
    await mkdir(dirname(target), { recursive: true });
    let content = bytes;
    if (path.endsWith('.css')) {
      content = bytes.toString('utf8').replace(/url\(\s*(?:(["'])(.*?)\1|([^'")]+))\s*\)/gi, (match, quote, quoted, unquoted) => {
        const value = (quoted ?? unquoted).trim();
        const updated = versionUrl(value, path.slice(1));
        return updated === value ? match : `url(${quote || ''}${updated}${quote || ''})`;
      });
    }
    await writeFile(target, content);
  }
  const pages = ['index.html', ...(await readdir(resolve(root, 'posts'))).filter(file => file.endsWith('.html')).sort().map(file => 'posts/' + file)];
  for (const file of pages) {
    const sourceHtml = await readFile(resolve(root, file), 'utf8');
    // Only resource tags change; article, resume, canonical and social URLs stay stable.
    const html = sourceHtml.replace(/<(?:link|script|img|source)\b[^>]*>/gi, tag => tag.replace(/\b(href|src)=(['"])(.*?)\2/gi, (match, attribute, quote, value) => {
      const updated = versionUrl(value.replaceAll('&amp;', '&'), file).replaceAll('&', '&amp;');
      return `${attribute}=${quote}${updated}${quote}`;
    }));
    const target = resolve(output, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, html);
  }
  for (const file of ['CNAME', 'robots.txt', 'sitemap.xml', 'feed.xml']) await cp(resolve(root, file), resolve(output, file));
  await writeFile(resolve(output, '.nojekyll'), '');
  return { output, version, pages: pages.length, assets: assets.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildSite();
  console.log(`Built ${result.pages} pages and ${result.assets} assets in ${relative(projectRoot, result.output)}/ (version ${result.version}).`);
}
