import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../src/lib/edge-request-policy.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
vm.runInNewContext(output, { exports, URL, Response });
const { probeResponse } = exports;
const request = (path, method = 'GET') => new Request(`https://example.test${path}`, { method, ...(method === 'POST' ? { body: 'probe payload' } : {}) });

test('known probes receive a small 404 without consuming request bodies', async () => {
  for (const path of ['/.env', '/cms/.env', '/.env.bak', '/.git/HEAD', '/.git/config.bak', '/.aws/credentials', '/@vite/env', '/%2Eenv', '/.ENV']) {
    const req = request(path, 'POST');
    const response = probeResponse(req);
    assert.equal(response.status, 404, path);
    assert.equal(await response.text(), 'Not found');
    assert.equal(req.bodyUsed, false);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
  assert.equal(await probeResponse(request('/.env', 'HEAD')).text(), '');
});

test('pages, APIs, assets, unknown pages and well-known paths fall through', () => {
  for (const path of ['/', '/zh/base64', '/de/bbox', '/api/github-device', '/api/github-token', '/_next/static/test.js', '/.well-known/traffic-advice', '/unknown', '/.environment', '/%invalid', '/base64?value=/.env']) {
    assert.equal(probeResponse(request(path)), undefined, path);
  }
});
