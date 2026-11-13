'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const release = process.argv.includes('--release');
const errors = [];
const pending = [];
const excluded = new Set(['.git', 'node_modules', 'dist', 'coverage', 'artifacts', '.idea', '.vscode']);
const privateNames = /(?:^|\/)(?:\.env(?:\..*)?|(?:data|uploads|backups)\/|[^/]+\.(?:pem|key|p12|pfx|jks|keystore|db|sqlite\d?|sqlite-(?:wal|shm)))$/i;
const textExtensions = new Set(['.html', '.js', '.cjs', '.mjs', '.css', '.json', '.md', '.svg', '.yml', '.yaml', '.toml']);
const credentialPatterns = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['provider-token', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b/],
  ['embedded-url-credentials', /https?:\/\/[^\s/:"'<>]+:[^\s/"'<>]+@/]
];
let fileCount = 0;
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    const relative = path.relative(root, full).split(path.sep).join('/');
    if (relative === '整理说明.md') continue;
    if (entry.isSymbolicLink()) {
      errors.push(`${relative}: symbolic links require manual review`);
      continue;
    }
    if ((privateNames.test(relative) && relative !== '.env.example') || (entry.isDirectory() && /(?:^|\/)(?:data|uploads|backups)$/i.test(relative))) {
      errors.push(`${relative}: private or runtime file; contents were not read`);
      continue;
    }
    if (entry.isDirectory()) {
      if (!excluded.has(entry.name)) walk(full);
      continue;
    }
    fileCount++;
    if (!textExtensions.has(path.extname(entry.name))) continue;
    const source = fs.readFileSync(full, 'utf8');
    for (const [label, pattern] of credentialPatterns) {
      if (pattern.test(source)) errors.push(`${relative}: possible ${label}; value suppressed`);
    }
    if (/\.(?:cjs|mjs|js)$/.test(entry.name)) {
      try { new vm.Script(source, { filename: relative }); }
      catch (error) { errors.push(`${relative}: ${error.name} in script`); }
    }
  }
}
walk(root);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let scriptCount = 0;
for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
  scriptCount++;
  try { new vm.Script(match[1], { filename: `index.html script ${scriptCount}` }); }
  catch (error) { errors.push(`index.html script ${scriptCount}: ${error.name}`); }
}
const assetPaths = new Set();
for (const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']|url\(\s*["']?([^\s"')]+)["']?\s*\)/gi)) {
  const value = match[1] || match[2];
  if (!value || /[$<>{}]/.test(value) || !/\.(?:svg|png|jpe?g|webp)(?:\?|$)/i.test(value)) continue;
  if (/^(?:https?:|\/\/)/i.test(value)) { errors.push('index.html: remote static asset requires review'); continue; }
  if (/^(?:data:|blob:)/i.test(value)) continue;
  const relative = value.split('?')[0].replace(/^\/+/, '');
  assetPaths.add(relative);
}
// These icons are assembled dynamically by appList rather than literal src attributes.
for (const name of ['wall', 'lostfound', 'errand', 'ranks']) assetPaths.add(`app-icons/${name}.png`);
for (const relative of assetPaths) {
  const full = path.resolve(root, relative);
  if (!full.startsWith(root + path.sep) || !fs.existsSync(full)) errors.push(`${relative}: missing local asset`);
}
if (!fs.existsSync(path.join(root, 'LICENSE'))) pending.push('Project LICENSE and copyright attribution are not confirmed.');
try {
  const assets = JSON.parse(fs.readFileSync(path.join(root, 'open-source-assets.json'), 'utf8'));
  if (assets.status !== 'confirmed' || !String(assets.evidence || '').trim()) pending.push('Brand, icon, and activity-image distribution rights are not confirmed.');
} catch { errors.push('open-source-assets.json: missing or invalid JSON'); }
console.log(`Checked ${fileCount} files, ${scriptCount} inline scripts, and ${assetPaths.size} local asset references.`);
for (const issue of errors) console.error(`ERROR: ${issue}`);
for (const issue of pending) console.log(`PENDING: ${issue}`);
if (!errors.length) console.log('Source checks passed.');
if (release && pending.length) console.error('Release checks require the pending ownership and license decisions.');
process.exitCode = errors.length || (release && pending.length) ? 1 : 0;
