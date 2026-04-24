import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const tools = ['coordinate-converter', 'objectid'];
const languages = ['en', 'zh'];

function readSource(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

function extractBalancedBlock(source, needle) {
  const start = source.indexOf(needle);
  assert.notEqual(start, -1, `Expected to find ${needle}`);

  const open = source.indexOf('{', start);
  assert.notEqual(open, -1, `Expected ${needle} to start an object block`);

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = open; index < source.length; index += 1) {
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

    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(open, index + 1);
      }
    }
  }

  assert.fail(`Unterminated object block for ${needle}`);
}

function loadCommonJsFromTs(path) {
  const source = readSource(path);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const cjsModule = { exports: {} };
  const context = {
    module: cjsModule,
    exports: cjsModule.exports,
    require,
  };

  vm.runInNewContext(outputText, context, { filename: path });
  return cjsModule.exports;
}

test('coordinate-converter and objectid have complete en/zh SEO entries', () => {
  const source = readSource('src/lib/tool-seo.ts');

  for (const tool of tools) {
    const toolBlock = extractBalancedBlock(source, `${tool.includes('-') ? `'${tool}'` : tool}:`);

    for (const language of languages) {
      const localeBlock = extractBalancedBlock(toolBlock, `${language}:`);
      const expectedLocale = language === 'zh' ? 'zh_CN' : 'en_US';

      for (const field of ['title', 'description', 'keywords', 'category', 'classification', 'locale']) {
        assert.match(localeBlock, new RegExp(`\\b${field}\\s*:`), `${tool} ${language} is missing ${field}`);
      }

      assert.match(localeBlock, new RegExp(`locale\\s*:\\s*['"]${expectedLocale}['"]`), `${tool} ${language} has the wrong locale`);
      assert.match(localeBlock, /keywords\s*:\s*\[[\s\S]*?['"][^'"]+['"][\s\S]*?\]/, `${tool} ${language} needs non-empty keywords`);

      for (const socialField of ['openGraph', 'twitter']) {
        const socialBlock = extractBalancedBlock(localeBlock, `${socialField}:`);
        assert.match(socialBlock, /\btitle\s*:/, `${tool} ${language} ${socialField} is missing title`);
        assert.match(socialBlock, /\bdescription\s*:/, `${tool} ${language} ${socialField} is missing description`);
      }
    }
  }
});

test('localized coordinate-converter and objectid pages only statically allow SITE_LANGUAGES and reject invalid languages', () => {
  for (const tool of tools) {
    const pageSource = readSource(`src/app/[lang]/${tool}/page.tsx`);

    assert.match(pageSource, /import\s+\{\s*isSiteLanguage\s*,\s*SITE_LANGUAGES\s*\}\s+from\s+['"]@\/lib\/site['"]/, `${tool} page should use shared language constants`);
    assert.match(pageSource, /export\s+const\s+dynamicParams\s*=\s*false/, `${tool} page should disable dynamic params`);
    assert.match(pageSource, /if\s*\(\s*!isSiteLanguage\(lang\)\s*\)\s*\{\s*notFound\(\);\s*\}/, `${tool} page should reject invalid languages`);
    assert.match(pageSource, /return\s+SITE_LANGUAGES\.map\(\(lang\)\s*=>\s*\(\{\s*lang\s*\}\)\)/, `${tool} page static params should come from SITE_LANGUAGES`);
  }
});

test('localized coordinate-converter and objectid layouts reject invalid languages and build metadata from shared SEO config', () => {
  for (const tool of tools) {
    const layoutSource = readSource(`src/app/[lang]/${tool}/layout.tsx`);
    const seoLookup = tool.includes('-') ? `TOOL_SEO\\[['"]${tool}['"]\\]\\[lang\\]` : `TOOL_SEO\\.${tool}\\[lang\\]`;

    assert.match(layoutSource, /import\s+\{\s*isSiteLanguage\s*\}\s+from\s+['"]@\/lib\/site['"]/, `${tool} layout should validate with shared language helper`);
    assert.match(layoutSource, /export\s+const\s+dynamicParams\s*=\s*false/, `${tool} layout should disable dynamic params`);
    assert.match(layoutSource, /if\s*\(\s*!isSiteLanguage\(lang\)\s*\)\s*\{\s*notFound\(\);\s*\}/, `${tool} layout should reject invalid languages`);
    assert.match(layoutSource, new RegExp(`createToolMetadata\\(\\{\\s*slug:\\s*['"]${tool}['"],\\s*\\.\\.\\.${seoLookup}\\s*\\}\\)`), `${tool} layout should use route-level shared metadata`);
  }
});

test('canonical URL helpers keep English tools unprefixed and Chinese tools under /zh', () => {
  const { toolUrl, toolAlternates } = loadCommonJsFromTs('src/lib/site.ts');

  for (const tool of tools) {
    assert.equal(toolUrl(tool, 'en'), `https://tools.mofei.life/${tool}`);
    assert.equal(toolUrl(tool, 'zh'), `https://tools.mofei.life/zh/${tool}`);

    assert.equal(toolAlternates(tool, 'en').canonical, `https://tools.mofei.life/${tool}`);
    assert.equal(toolAlternates(tool, 'zh').canonical, `https://tools.mofei.life/zh/${tool}`);
    assert.equal(toolAlternates(tool, 'en').languages['en-US'], `https://tools.mofei.life/${tool}`);
    assert.equal(toolAlternates(tool, 'en').languages['zh-CN'], `https://tools.mofei.life/zh/${tool}`);
    assert.equal(toolAlternates(tool, 'en').languages['x-default'], `https://tools.mofei.life/${tool}`);
  }
});
