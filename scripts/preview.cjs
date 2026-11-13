'use strict';

// An isolated static preview. No API implementation or upstream proxy.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || 8092);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error('Use a port number between 1024 and 65535.');
  process.exit(1);
}
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'");
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (/^\/(?:stu\/)?api(?:\/|$)/.test(pathname)) {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: '此静态预览未包含历史后端，API 请求已在本机拦截。' }));
    return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  const relative = pathname.replace(/^\/stu(?:\/|$)/, '/').replace(/^\/+/, '') || 'index.html';
  // Serve only historical public assets, never scripts, documentation, or local configuration.
  if (!/^(?:index\.html|favicon\.png|activity-background\.png|(?:app-icons|assets\/brand)\/[a-zA-Z0-9_-]+\.(?:png|svg))$/.test(relative)) {
    res.writeHead(404).end('Not found');
    return;
  }
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const resolved = await fs.realpath(target);
    if (!resolved.startsWith(root + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const data = await fs.readFile(resolved);
    res.writeHead(200, { 'Content-Type': types[path.extname(relative)] });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404).end('Not found');
  }
});
server.on('error', error => {
  console.error(`Preview failed (${error.code || 'unknown error'}).`);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`MiniZone Start static preview: http://127.0.0.1:${port}/`);
  console.log('API requests return 503 locally. No upstream proxy is configured.');
});
