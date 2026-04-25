import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { join } from 'node:path';

const root = process.cwd();

function readSource(path) {
  return readFileSync(join(root, path), 'utf8');
}

function extractObjectLiteral(source, marker) {
  const markerIndex = source.indexOf(marker);
  assert.notEqual(markerIndex, -1, `Missing marker: ${marker}`);

  const start = source.indexOf('{', markerIndex);
  assert.notEqual(start, -1, `Missing object start after marker: ${marker}`);

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];

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

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }

    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;

    if (depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  assert.fail(`Unclosed object literal after marker: ${marker}`);
}

function assertHasFields(name, block, fields) {
  for (const field of fields) {
    assert.match(block, new RegExp(`\\b${field}\\s*:`), `${name} should define ${field}`);
  }
}

test('json-extract en/zh SEO config is complete and English has openGraph/twitter metadata', () => {
  const toolSeo = readSource('src/lib/tool-seo.ts');
  const jsonExtractBlock = extractObjectLiteral(toolSeo, "'json-extract':");
  const zhBlock = extractObjectLiteral(jsonExtractBlock, 'zh:');
  const enBlock = extractObjectLiteral(jsonExtractBlock, 'en:');
  const requiredSeoFields = [
    'title',
    'description',
    'keywords',
    'category',
    'classification',
    'locale',
    'openGraph',
    'twitter',
  ];

  assertHasFields('json-extract zh SEO', zhBlock, requiredSeoFields);
  assertHasFields('json-extract en SEO', enBlock, requiredSeoFields);
  assert.match(enBlock, /locale:\s*'en_US'/, 'English json-extract SEO should use en_US locale');

  const enOpenGraphBlock = extractObjectLiteral(enBlock, 'openGraph:');
  const enTwitterBlock = extractObjectLiteral(enBlock, 'twitter:');

  assertHasFields('json-extract en openGraph', enOpenGraphBlock, ['title', 'description']);
  assertHasFields('json-extract en twitter', enTwitterBlock, ['title', 'description']);

  const rootRoute = readSource('src/app/json-extract/page.tsx');
  const localizedLayout = readSource('src/app/[lang]/json-extract/layout.tsx');

  assert.match(rootRoute, /createToolMetadata\(\{\s*slug:\s*'json-extract',\s*\.\.\.getToolSeo\('json-extract',\s*'en'\)/s);
  assert.match(localizedLayout, /createToolMetadata\(\{\s*slug:\s*'json-extract',\s*\.\.\.TOOL_SEO\['json-extract'\]\[lang\]/s);
});

test('json-format SEO and localized routes follow canonical tool routing', () => {
  const toolSeo = readSource('src/lib/tool-seo.ts');
  const site = readSource('src/lib/site.ts');
  const structuredData = readSource('src/components/StructuredData.tsx');
  const jsonFormatBlock = extractObjectLiteral(toolSeo, "'json-format':");
  const zhBlock = extractObjectLiteral(jsonFormatBlock, 'zh:');
  const enBlock = extractObjectLiteral(jsonFormatBlock, 'en:');
  const requiredSeoFields = [
    'title',
    'description',
    'keywords',
    'category',
    'classification',
    'locale',
    'openGraph',
    'twitter',
  ];

  assert.match(site, /'json-format'/, 'json-format should be included in TOOL_SLUGS');
  assertHasFields('json-format zh SEO', zhBlock, requiredSeoFields);
  assertHasFields('json-format en SEO', enBlock, requiredSeoFields);
  assert.match(enBlock, /locale:\s*'en_US'/, 'English json-format SEO should use en_US locale');
  assert.match(zhBlock, /locale:\s*'zh_CN'/, 'Chinese json-format SEO should use zh_CN locale');
  assert.match(structuredData, /case\s+'json-format':/, 'StructuredData should include json-format');

  const rootRoute = readSource('src/app/json-format/page.tsx');
  const localizedPage = readSource('src/app/[lang]/json-format/page.tsx');
  const localizedLayout = readSource('src/app/[lang]/json-format/layout.tsx');

  assert.match(rootRoute, /createToolMetadata\(\{\s*slug:\s*'json-format',\s*\.\.\.getToolSeo\('json-format',\s*'en'\)/s);
  assert.match(rootRoute, /StructuredData\s+type="tool"\s+language="en"\s+slug="json-format"/);
  assert.match(localizedPage, /isSiteLanguage\(lang\)/, 'localized json-format page should validate lang');
  assert.match(localizedPage, /generateStaticParams\(\)/, 'localized json-format page should statically enumerate languages');
  assert.match(localizedPage, /SITE_LANGUAGES\.map/, 'localized json-format page should use SITE_LANGUAGES');
  assert.match(localizedLayout, /createToolMetadata\(\{\s*slug:\s*'json-format',\s*\.\.\.TOOL_SEO\['json-format'\]\[lang\]/s);
});

test('bbox SEO configuration covers every BBOX language and hreflang mapping', () => {
  const bboxI18n = readSource('src/lib/bbox-i18n.ts');
  const languageList = bboxI18n.match(/BBOX_LANGUAGES\s*=\s*\[([^\]]+)\]/s);
  assert.ok(languageList, 'BBOX_LANGUAGES should be defined');

  const languages = [...languageList[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual(languages, ['en', 'zh', 'de', 'es', 'fr']);

  const seoBlock = extractObjectLiteral(bboxI18n, 'BBOX_SEO:');
  const hreflangBlock = extractObjectLiteral(bboxI18n, 'BBOX_HREFLANG:');
  const expectedHreflang = {
    en: 'en-US',
    zh: 'zh-CN',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
  };

  for (const language of languages) {
    const entry = extractObjectLiteral(seoBlock, `${language}:`);
    assertHasFields(`bbox ${language} SEO`, entry, [
      'title',
      'description',
      'keywords',
      'category',
      'classification',
      'locale',
      'openGraphTitle',
      'openGraphDescription',
    ]);
    assert.match(hreflangBlock, new RegExp(`\\b${language}:\\s*'${expectedHreflang[language]}'`));
  }
});

test('bbox route metadata uses bbox-i18n constants for multilingual SEO', () => {
  const toolSeo = readSource('src/lib/tool-seo.ts');
  const bboxLayout = readSource('src/app/[lang]/bbox/layout.tsx');

  assert.match(toolSeo, /import\s+\{\s*BBOX_SEO\s*\}\s+from\s+'@\/lib\/bbox-i18n'/);
  assert.match(toolSeo, /const\s+seo\s*=\s*BBOX_SEO\[language\]/);
  assert.match(toolSeo, /zh:\s*bboxToolSeo\('zh'\)/);
  assert.match(toolSeo, /en:\s*bboxToolSeo\('en'\)/);

  assert.match(
    bboxLayout,
    /import\s+\{[^}]*BBOX_SEO[^}]*bboxAlternateLocales[^}]*bboxAlternates[^}]*bboxUrl[^}]*isBBoxLanguage[^}]*\}\s+from\s+'@\/lib\/bbox-i18n'/s,
  );
  assert.match(bboxLayout, /const\s+seo\s*=\s*BBOX_SEO\[language\]/);
  assert.match(bboxLayout, /alternateLocale:\s*bboxAlternateLocales\(language\)/);
  assert.match(bboxLayout, /canonicalUrl:\s*bboxUrl\(language\)/);
  assert.match(bboxLayout, /alternates:\s*\{\s*\.\.\.bboxAlternates\(\),\s*canonical:\s*bboxUrl\(language\)/s);
});

test('sitemap emits bbox en/zh/de/es/fr/x-default alternates from bbox-i18n', () => {
  const sitemap = readSource('src/app/sitemap.ts');

  assert.match(sitemap, /import\s+\{\s*BBOX_HREFLANG,\s*BBOX_LANGUAGES,\s*bboxUrl\s*\}\s+from\s+'@\/lib\/bbox-i18n'/);
  assert.match(sitemap, /for\s*\(\s*const\s+language\s+of\s+BBOX_LANGUAGES\s*\)/);
  assert.match(sitemap, /url:\s*bboxUrl\(language\)/);

  for (const language of ['en', 'zh', 'de', 'es', 'fr']) {
    assert.match(
      sitemap,
      new RegExp(`\\[BBOX_HREFLANG\\.${language}\\]:\\s*bboxUrl\\('${language}'\\)`),
      `sitemap should include bbox ${language} alternate`,
    );
  }

  assert.match(sitemap, /'x-default':\s*bboxUrl\('en'\)/, 'sitemap should include bbox x-default alternate');
});

test('bbox localized route rejects unsupported languages and disables dynamic params', () => {
  const bboxLayout = readSource('src/app/[lang]/bbox/layout.tsx');
  const bboxPage = readSource('src/app/[lang]/bbox/page.tsx');

  for (const [name, source] of [
    ['layout', bboxLayout],
    ['page', bboxPage],
  ]) {
    assert.match(source, /import\s+\{\s*notFound\s*\}\s+from\s+'next\/navigation'/, `bbox ${name} should import notFound`);
    assert.match(source, /isBBoxLanguage\(lang\)/, `bbox ${name} should check isBBoxLanguage(lang)`);
    assert.match(source, /notFound\(\)/, `bbox ${name} should call notFound for unsupported languages`);
    assert.match(source, /export\s+const\s+dynamicParams\s*=\s*false/, `bbox ${name} should set dynamicParams=false`);
  }

  assert.match(bboxPage, /generateStaticParams\(\)/);
  assert.match(bboxPage, /BBOX_LANGUAGES\.map\(\(lang\)\s*=>\s*\(\{\s*lang\s*\}\)\)/);
});
