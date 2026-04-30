import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const ROOT = new URL('../', import.meta.url);
const toolSeoSource = await readFile(new URL('src/lib/tool-seo.ts', ROOT), 'utf8');
const toolContentSource = await readFile(new URL('src/lib/tool-content.ts', ROOT), 'utf8');
const structuredDataSource = await readFile(new URL('src/components/StructuredData.tsx', ROOT), 'utf8');
const homePageContentSource = await readFile(new URL('src/components/HomePageContent.tsx', ROOT), 'utf8');
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

function loadTsModule(path) {
  const absolutePath = new URL(path, ROOT).pathname;
  const source = readFileSync(absolutePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.Node10,
    },
  });
  const cjsModule = { exports: {} };
  const localRequire = (specifier) => {
    if (specifier.startsWith('@/')) {
      return loadTsModule(`src/${specifier.slice(2)}.ts`);
    }
    return require(specifier);
  };

  vm.runInNewContext(outputText, {
    Buffer,
    exports: cjsModule.exports,
    module: cjsModule,
    process,
    require: localRequire,
  }, { filename: absolutePath });

  return cjsModule.exports;
}

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

test('base64, json-format, timezone, and geojson SEO entries contain required en and zh metadata', () => {
  for (const toolName of ['base64', "'base64-image'", "'json-format'", 'timezone', 'geojson']) {
    const seo = evaluateObjectLiteral(extractObjectLiteral(toolSeoSource, toolName));

    assert.deepEqual(Object.keys(seo).sort(), ['en', 'zh']);
    assertSeoEntry(toolName, 'en', seo.en);
    assertSeoEntry(toolName, 'zh', seo.zh);
  }
});

test('timezone SEO targets multilingual time zone comparison intent', async () => {
  const seo = evaluateObjectLiteral(extractObjectLiteral(toolSeoSource, 'timezone'));
  const rootPageSource = await readFile(new URL('src/app/timezone/page.tsx', ROOT), 'utf8');
  const pageComponentSource = await readFile(new URL('src/app/timezone/PageComponent.tsx', ROOT), 'utf8');
  const localizedLayoutSource = await readFile(new URL('src/app/[lang]/timezone/layout.tsx', ROOT), 'utf8');

  assert.match(seo.en.title, /World Time Compare & Time Zone Converter/);
  assert.match(seo.en.description, /IANA time zones/i);
  assert.match(seo.en.description, /DST/);
  assert.match(seo.en.description, /share cross-time-zone meeting setups/);
  assert.ok(seo.en.keywords.includes('city timezone converter'));
  assert.ok(seo.en.keywords.includes('working hours overlap'));
  assert.ok(seo.zh.keywords.includes('时区对照'));
  assert.ok(seo.zh.keywords.includes('城市时间换算'));
  assert.ok(seo.zh.keywords.includes('跨时区会议'));

  assert.match(rootPageSource, /createToolMetadata\(\{\s*slug:\s*'timezone',\s*\.\.\.getToolSeo\('timezone',\s*'en'\)/s);
  assert.match(rootPageSource, /StructuredData\s+type="tool"\s+language="en"\s+slug="timezone"/);
  assert.match(localizedLayoutSource, /createToolMetadata\(\{\s*slug:\s*'timezone',\s*\.\.\.TOOL_SEO\.timezone\[lang\]\s*\}\)/s);
  assert.match(structuredDataSource, /case\s+'timezone':/);
  assert.match(structuredDataSource, /applicationCategory:\s*'UtilitiesApplication'/);
  assert.match(structuredDataSource, /'@type':\s*'FAQPage'/);
  assert.match(structuredDataSource, /timezone-breadcrumb-jsonld/);
  assert.doesNotMatch(structuredDataSource, /timezone-howto-jsonld/);
  assert.match(structuredDataSource, /description:\s*tool\.description/);
  assert.match(structuredDataSource, /categoryAnchor\s*=\s*slug === 'timezone' \? 'productivity-tools' : 'dev-tools'/);
  assert.match(pageComponentSource, /faqTitle:/);
  assert.match(pageComponentSource, /How can I find a good meeting time across time zones\?/);
  assert.match(pageComponentSource, /怎么找跨时区会议时间？/);
  assert.match(pageComponentSource, /event\(`timezone_\$\{action\}`/);
  for (const eventName of [
    'search_commit',
    'search_no_match',
    'add_place',
    'add_custom_timezone',
    'select_time',
    'work_range_update',
    'work_range_color_custom',
    'drag_reorder_place',
    'share_success',
  ]) {
    assert.match(pageComponentSource, new RegExp(`trackTimezone\\('${eventName}'`), `timezone should track ${eventName}`);
  }
  assert.match(toolContentSource, /timezone:\s*\{/);
  assert.match(toolContentSource, /date differences/);
  assert.match(toolContentSource, /跨时区会议配置/);
  assert.match(homePageContentSource, /id=\{`\$\{category\.key\}-tools`\}/);
});

test('ordinary tool path rules keep English unprefixed and Chinese under /zh', () => {
  assert.match(siteSource, /export function toolPath\(slug: ToolSlug, language: SiteLanguage = 'en'\)/);
  assert.match(siteSource, /language === 'zh' \? `\/zh\/\$\{slug\}` : `\/\$\{slug\}`/);
  assert.doesNotMatch(siteSource, /`\/en\/\$\{slug\}`/);

  for (const slug of ['base64', 'base64-image', 'json-format', 'timezone', 'geojson']) {
    assert.match(siteSource, new RegExp(`'${slug}'`), `${slug} should be a configured tool slug`);
  }
});

test('sitemap gives ordinary tools en-US, zh-CN, and x-default alternates', () => {
  assert.match(sitemapSource, /const TODAY = '2026-04-30'/);
  assert.match(sitemapSource, /if \(slug === 'bbox'\)/, 'bbox should remain the special localized sitemap case');
  assert.match(sitemapSource, /'en-US': `\$\{SITE_URL\}\/\$\{slug\}`/);
  assert.match(sitemapSource, /'zh-CN': `\$\{SITE_URL\}\/zh\/\$\{slug\}`/);
  assert.match(sitemapSource, /'x-default': `\$\{SITE_URL\}\/\$\{slug\}`/);

  for (const slug of ['base64', 'base64-image', 'json-format', 'timezone', 'geojson']) {
    const keyPattern = slug.includes('-') ? `'${slug}'` : slug;
    assert.match(sitemapSource, new RegExp(`${keyPattern}: \\{ changeFrequency:`), `${slug} should be in TOOL_CONFIG`);
  }
});

test('generated sitemap and robots include ordinary tool canonical routes', () => {
  const sitemap = loadTsModule('src/app/sitemap.ts').default();
  const robots = loadTsModule('src/app/robots.ts').default();
  const urls = sitemap.map((entry) => entry.url);

  for (const slug of ['base64-image', 'json-format', 'timezone']) {
    const englishEntry = sitemap.find((entry) => entry.url === `https://tools.mofei.life/${slug}`);
    const chineseEntry = sitemap.find((entry) => entry.url === `https://tools.mofei.life/zh/${slug}`);

    assert.ok(englishEntry, `English ${slug} URL should be in sitemap`);
    assert.ok(chineseEntry, `Chinese ${slug} URL should be in sitemap`);
    assert.ok(!urls.includes(`https://tools.mofei.life/en/${slug}`), `non-canonical /en/${slug} should not be in sitemap`);

    for (const entry of [englishEntry, chineseEntry]) {
      assert.deepEqual(JSON.parse(JSON.stringify(entry.alternates.languages)), {
        'en-US': `https://tools.mofei.life/${slug}`,
        'zh-CN': `https://tools.mofei.life/zh/${slug}`,
        'x-default': `https://tools.mofei.life/${slug}`,
      });
    }

    assert.ok(robots.rules.allow.includes(`/${slug}`), `robots should allow English ${slug} route`);
    assert.ok(robots.rules.allow.includes(`/zh/${slug}`), `robots should allow Chinese ${slug} route`);
  }

  assert.ok(robots.rules.disallow.includes('/api/'), 'robots should keep API routes disallowed');
  assert.ok(robots.rules.disallow.includes('/cdn-cgi/'), 'robots should disallow Cloudflare edge helper routes');
});

test('localized base64, json-format, timezone, and geojson pages reject unsupported languages', async () => {
  for (const toolName of ['base64', 'base64-image', 'json-format', 'timezone', 'geojson']) {
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
