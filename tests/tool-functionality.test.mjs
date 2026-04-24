import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const moduleCache = new Map();

function loadTsModule(path) {
  const absolutePath = new URL(`../${path}`, import.meta.url).pathname;
  if (moduleCache.has(absolutePath)) return moduleCache.get(absolutePath);

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
    require: localRequire,
  }, { filename: absolutePath });

  moduleCache.set(absolutePath, cjsModule.exports);
  return cjsModule.exports;
}

function assertClose(actual, expected, tolerance, message) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: expected ${actual} to be within ${tolerance} of ${expected}`);
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test('base64 functions encode, decode, validate, and detect Base64 text', () => {
  const {
    convertBase64Text,
    decodeBase64Text,
    encodeBase64Text,
    looksLikeBase64,
  } = loadTsModule('src/lib/base64-tool.ts');

  const encoded = encodeBase64Text('Mofei 工具');
  assert.equal(encoded, 'TW9mZWkg5bel5YW3');
  assert.equal(decodeBase64Text(encoded), 'Mofei 工具');
  assert.deepEqual(plain(convertBase64Text('hello', 'encode')), { result: 'aGVsbG8=', error: '' });
  assert.deepEqual(plain(convertBase64Text('not base64', 'decode')), { result: '', error: 'Invalid Base64 string' });
  assert.equal(looksLikeBase64('TW9mZWkg5bel5YW3'), true);
  assert.equal(looksLikeBase64('plain text'), false);
});

test('objectid functions generate deterministic ids and extract timestamp components', () => {
  const {
    analyzeObjectId,
    extractObjectIdTimestamp,
    generateObjectId,
    isValidObjectId,
  } = loadTsModule('src/lib/objectid-tool.ts');

  const timestamp = Date.UTC(2026, 3, 24, 12, 0, 0);
  const objectId = generateObjectId(timestamp, 'aabbccddee', '000001');

  assert.equal(objectId, '69eb5b40aabbccddee000001');
  assert.equal(isValidObjectId(objectId), true);
  assert.equal(isValidObjectId('invalid'), false);
  assert.equal(extractObjectIdTimestamp(objectId), timestamp);
  assert.deepEqual(plain(analyzeObjectId(objectId)), {
    timestampHex: '69eb5b40',
    randomHex: 'aabbccddee',
    counterHex: '000001',
    timestamp,
  });
});

test('bbox functions parse common inputs, format share params, compute metrics, and create polygons', () => {
  const {
    calculateBboxMetrics,
    createBboxPolygonFeature,
    formatBboxParam,
    parseBboxInput,
  } = loadTsModule('src/lib/bbox-tool.ts');

  const bbox = { minLng: 24, minLat: 60, maxLng: 25, maxLat: 61 };
  assert.deepEqual(plain(parseBboxInput('24,60,25,61')), bbox);
  assert.deepEqual(plain(parseBboxInput(JSON.stringify({ bbox: [24, 60, 25, 61] }))), bbox);
  assert.equal(parseBboxInput('25,60,24,61'), null);
  assert.equal(formatBboxParam(bbox), '24.000000,60.000000,25.000000,61.000000');

  const metrics = calculateBboxMetrics(bbox);
  assert.deepEqual(plain(metrics.center), { lat: 60.5, lng: 24.5 });
  assertClose(metrics.width, 54.7, 0.8, 'bbox width');
  assertClose(metrics.height, 111.2, 0.8, 'bbox height');
  assertClose(metrics.area, 6080, 150, 'bbox area');

  assert.deepEqual(plain(createBboxPolygonFeature(bbox).geometry.coordinates[0]), [
    [24, 60],
    [25, 60],
    [25, 61],
    [24, 61],
    [24, 60],
  ]);
});

test('coordinate converter functions parse and convert WGS84, Web Mercator, DMS, and UTM', () => {
  const {
    ddToDms,
    dmsToDd,
    getUtmZone,
    parseDecimalCoordinatePair,
    validateWgs84Coordinate,
    webMercatorToWgs84,
    wgs84ToUtm,
    wgs84ToWebMercator,
  } = loadTsModule('src/lib/coordinate-converter-tool.ts');

  assert.deepEqual(plain(parseDecimalCoordinatePair('24.9384, 60.1699')), { lng: 24.9384, lat: 60.1699 });
  assert.deepEqual(plain(parseDecimalCoordinatePair('60.1699, 24.9384', 'lat_lng')), { lng: 24.9384, lat: 60.1699 });
  assert.throws(() => validateWgs84Coordinate(24, 100), /Latitude/);

  const mercator = wgs84ToWebMercator(24.9384, 60.1699);
  const wgs84 = webMercatorToWgs84(...mercator);
  assertClose(wgs84[0], 24.9384, 0.000001, 'web mercator longitude roundtrip');
  assertClose(wgs84[1], 60.1699, 0.000001, 'web mercator latitude roundtrip');

  const dms = ddToDms(60.1699, true);
  assert.equal(dms, `60°10'11.64"N`);
  assertClose(dmsToDd(dms), 60.1699, 0.00001, 'DMS roundtrip');

  assert.equal(getUtmZone(24.9384), 35);
  const utm = wgs84ToUtm(24.9384, 60.1699);
  assert.equal(utm.zone, 35);
  assert.equal(utm.hemisphere, 'N');
  assertClose(utm.easting, 385000, 2000, 'UTM easting');
  assertClose(utm.northing, 6670000, 5000, 'UTM northing');
});

test('geojson functions validate data, make preview URLs, detect large payloads, and format sizes', () => {
  const {
    createGeoJsonPreviewUrl,
    formatGeoJsonFileSize,
    shouldUseGistForGeoJson,
    validateGeoJsonText,
  } = loadTsModule('src/lib/geojson-tool.ts');

  const feature = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [24.9384, 60.1699] },
    properties: { name: 'Helsinki' },
  };

  assert.deepEqual(plain(validateGeoJsonText(JSON.stringify(feature))), feature);
  assert.throws(() => validateGeoJsonText('{"type":"Nope"}'), /Invalid GeoJSON type/);
  assert.ok(createGeoJsonPreviewUrl(feature).startsWith('https://geojson.io/#data=data:application/json,'));
  assert.equal(shouldUseGistForGeoJson('x'.repeat(8001)), true);
  assert.equal(shouldUseGistForGeoJson('x'.repeat(8000)), false);
  assert.equal(formatGeoJsonFileSize(512), '512 B');
  assert.equal(formatGeoJsonFileSize(1536), '1.5 KB');
});

test('json extract functions suggest paths, create columns, and extract row values', () => {
  const {
    createAutoColumns,
    createColumnNameFromPath,
    extractJsonRows,
    generateSuggestedJsonPaths,
    getJsonPathValue,
  } = loadTsModule('src/lib/json-extract-tool.ts');

  const json = [
    { properties: { title: 'A', count: 2 }, tags: ['x', 'y'] },
    { properties: { title: 'B', count: 3 }, tags: ['z'] },
  ];

  assert.equal(createColumnNameFromPath('$.properties.title', 0), 'Title');
  assert.deepEqual(plain(createAutoColumns(['$.items[*]', '$.properties.title'])[0]), {
    id: '1',
    name: 'Title',
    path: '$.properties.title',
  });
  assert.equal(getJsonPathValue(json[0], '$.properties.title'), 'A');
  assert.deepEqual(plain(getJsonPathValue(json[0], '$.tags[*]')), ['x', 'y']);
  assert.deepEqual(plain(extractJsonRows(json, [
    { id: '1', name: 'Title', path: '$.properties.title' },
    { id: '2', name: 'Count', path: '$.properties.count' },
  ])), [
    { Title: 'A', Count: 2 },
    { Title: 'B', Count: 3 },
  ]);
  assert.ok(generateSuggestedJsonPaths(json[0]).includes('$.properties.title'));
  assert.ok(generateSuggestedJsonPaths(json[0]).includes('$.tags[*]'));
});
