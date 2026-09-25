import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

test('shared tool SEO only references existing local image assets', () => {
  const source = readFileSync(new URL('../src/lib/tool-seo.ts', import.meta.url), 'utf8');
  const paths = [...source.matchAll(/absoluteUrl\('([^']+)'\)/g)].map((match) => match[1]);
  assert.ok(paths.length > 0);
  for (const path of paths) {
    assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), `Missing SEO image: ${path}`);
  }
});
