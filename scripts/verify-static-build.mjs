import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('.next/prerender-manifest.json', 'utf8'));
const sitemap = await readFile('.next/server/app/sitemap.xml.body', 'utf8');
const languages = { en: 'en-US', zh: 'zh-CN', de: 'de-DE', es: 'es-ES', fr: 'fr-FR' };
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
assert.ok(paths.length > 20, 'Expected the complete public sitemap');
for (const path of paths) {
  assert.ok(manifest.routes[path], `${path} must be prerendered`);
}
let checked = 0;
for (const path of Object.keys(manifest.routes)) {
  if (path.endsWith('/timezone') || /\.(xml|txt|png|ico|svg)$/.test(path) || path.startsWith('/_')) continue;
  const html = await readFile(`.next/server/app/${path === '/' ? 'index' : path.slice(1)}.html`, 'utf8');
  const language = languages[path.split('/')[1]] || 'en-US';
  assert.ok(html.includes(`<html lang="${language}">`), `${path}: correct language in initial HTML`);
  assert.match(html, /rel="canonical"/, `${path}: canonical remains present`);
  checked++;
}
assert.ok(!Object.keys(manifest.routes).some((path) => path.startsWith('/api/')), 'APIs must remain dynamic');
console.log(`Verified ${checked} prerendered pages and ${paths.length} sitemap URLs.`);
