import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon', '.pdf': 'application/pdf'
};

export async function startServer(port = 0) {
  const server = createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, { Allow: 'GET, HEAD' }).end();
        return;
      }
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const path = pathname === '/' ? '/index.html' : pathname;
      const allowed = /^\/(?:index\.html|robots\.txt|sitemap\.xml|feed\.xml)$/.test(path)
        || /^\/posts\/[^/]+\.html$/.test(path) || path.startsWith('/assets/');
      const file = resolve(root, '.' + path);
      if (!allowed || !file.startsWith(root + sep) || path.split('/').some(part => part.startsWith('.'))) {
        response.writeHead(404).end('Not found');
        return;
      }
      const content = await readFile(file);
      response.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
        'Content-Length': content.length,
        'Cache-Control': 'public, max-age=600',
        'X-Content-Type-Options': 'nosniff'
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
  return { server, origin: `http://127.0.0.1:${server.address().port}` };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { origin } = await startServer(8000);
  console.log(`Static site: ${origin} (Ctrl+C to stop)`);
}
