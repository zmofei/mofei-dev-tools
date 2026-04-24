import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const ROOT = new URL('../', import.meta.url);
const toolSeoSource = await readFile(new URL('src/lib/tool-seo.ts', ROOT), 'utf8');
const siteSource = await readFile(new URL('src/lib/site.ts', ROOT), 'utf8');
const sitemapSource = await readFile(new URL('src/app/sitemap.ts', ROOT), 'utf8');
const localizedHomeSource = await readFile(new URL('src/app/[lang]/page.tsx', ROOT), 'utf8');
const localizedPrivacySource = await readFile(new URL('src/app/[lang]/privacy/page.tsx', ROOT), 'utf8');

const REQUIRED_SEO_FIELDS = [
  'title',
  'description',
  'keywords',
  'category',
  'classification',
  'locale',
];

function extractObjectLiteral(source, propertyName) {
  const propertyIndex = source.indexOf(`${propertyName}:`);
  assert.notEqual(propertyIndex, -1, `Expected to find ${propertyName} in source`);

  const start = source.indexOf('{', propertyIndex);
  assert.notEqual(start, -1, `Expected ${propertyName} to be an object literal`);

  let depth = 0;
  let quote = null;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }

    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;

    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  assert.fail(`Expected ${propertyName} object literal to close`);
}

function evaluateObjectLiteral(literal) {
  return Function(`"use strict"; return (${literal});`)();
}

function assertSeoEntry(toolName, language, seo) {
  for (const field of REQUIRED_SEO_FIELDS) {
    assert.ok(seo[field], `${toolName}.${language}.${field} should exist`);
  }

  assert.equal(typeof seo.title, 'string', `${toolName}.${language}.title should be text`);
  assert.equal(typeof seo.description, 'string', `${toolName}.${language}.description should be text`);
  assert.ok(Array.isArray(seo.keywords), `${toolName}.${language}.keywords should be an array`);
  assert.ok(seo.keywords.length > 0, `${toolName}.${language}.keywords should not be empty`);
  assert.equal(typeof seo.category, 'string', `${toolName}.${language}.category should be text`);
  assert.equal(typeof seo.classification, 'string', `${toolName}.${language}.classification should be text`);
  assert.equal(seo.locale, language === 'zh' ? 'zh_CN' : 'en_US');
}

test('base64 and geojson SEO entries contain required en and zh metadata', () => {
  for (const toolName of ['base64', 'geojson']) {
    const seo = evaluateObjectLiteral(extractObjectLiteral(toolSeoSource, toolName));

    assert.deepEqual(Object.keys(seo).sort(), ['en', 'zh']);
    assertSeoEntry(toolName, 'en', seo.en);
    assertSeoEntry(toolName, 'zh', seo.zh);
  }
});

test('ordinary tool path rules keep English unprefixed and Chinese under /zh', () => {
  assert.match(siteSource, /export function toolPath\(slug: ToolSlug, language: SiteLanguage = 'en'\)/);
  assert.match(siteSource, /language === 'zh' \? `\/zh\/\$\{slug\}` : `\/\$\{slug\}`/);
  assert.doesNotMatch(siteSource, /`\/en\/\$\{slug\}`/);

  for (const slug of ['base64', 'geojson']) {
    assert.match(siteSource, new RegExp(`'${slug}'`), `${slug} should be a configured tool slug`);
  }
});

test('sitemap gives ordinary tools en-US, zh-CN, and x-default alternates', () => {
  assert.match(sitemapSource, /if \(slug === 'bbox'\)/, 'bbox should remain the special localized sitemap case');
  assert.match(sitemapSource, /'en-US': `\$\{SITE_URL\}\/\$\{slug\}`/);
  assert.match(sitemapSource, /'zh-CN': `\$\{SITE_URL\}\/zh\/\$\{slug\}`/);
  assert.match(sitemapSource, /'x-default': `\$\{SITE_URL\}\/\$\{slug\}`/);

  for (const slug of ['base64', 'geojson']) {
    assert.match(sitemapSource, new RegExp(`${slug}: \\{ changeFrequency:`), `${slug} should be in TOOL_CONFIG`);
  }
});

test('localized base64 and geojson pages reject unsupported languages', async () => {
  for (const toolName of ['base64', 'geojson']) {
    const pageSource = await readFile(new URL(`src/app/[lang]/${toolName}/page.tsx`, ROOT), 'utf8');
    const layoutSource = await readFile(new URL(`src/app/[lang]/${toolName}/layout.tsx`, ROOT), 'utf8');

    for (const [kind, source] of [
      ['page', pageSource],
      ['layout', layoutSource],
    ]) {
      assert.match(source, /import\s+\{\s*notFound\s*\}\s+from\s+'next\/navigation'/, `${toolName} ${kind} should import notFound`);
      assert.match(source, /isSiteLanguage\(lang\)/, `${toolName} ${kind} should validate lang`);
      assert.match(source, /notFound\(\)/, `${toolName} ${kind} should reject unsupported lang`);
      assert.match(source, /export\s+const\s+dynamicParams\s*=\s*false/, `${toolName} ${kind} should disable dynamic params`);
    }

    assert.match(pageSource, /SITE_LANGUAGES\.map\(\(lang\)\s*=>\s*\(\{\s*lang\s*\}\)\)/, `${toolName} static params should use SITE_LANGUAGES`);
    assert.doesNotMatch(pageSource, /lang === 'zh' \? 'zh' : 'en'/, `${toolName} page should not silently normalize unsupported languages`);
    assert.doesNotMatch(layoutSource, /lang === 'zh' \? 'zh' : 'en'/, `${toolName} layout should not silently normalize unsupported languages`);
  }
});

test('localized homepage and privacy page reject unsupported languages', () => {
  for (const [name, source] of [
    ['localized homepage', localizedHomeSource],
    ['localized privacy page', localizedPrivacySource],
  ]) {
    assert.match(source, /import\s+\{\s*notFound\s*\}\s+from\s+'next\/navigation'/, `${name} should import notFound`);
    assert.match(source, /isSiteLanguage\(lang\)/, `${name} should validate lang`);
    assert.match(source, /notFound\(\)/, `${name} should reject unsupported lang`);
    assert.match(source, /export\s+const\s+dynamicParams\s*=\s*false/, `${name} should disable dynamic params`);
    assert.match(source, /SITE_LANGUAGES\.map\(\(lang\)\s*=>\s*\(\{\s*lang\s*\}\)\)/, `${name} static params should use SITE_LANGUAGES`);
    assert.doesNotMatch(source, /lang === 'zh' \? 'zh' : 'en'/, `${name} should not silently normalize unsupported languages`);
  }
});
