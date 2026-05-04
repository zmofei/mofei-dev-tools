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
    URLSearchParams,
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

test('base64 image functions parse data URLs, raw payloads, and image byte sizes', () => {
  const {
    detectImageMimeTypeFromBase64,
    extensionForImageMimeType,
    formatImageBytes,
    isSupportedImageMimeType,
    isValidBase64Payload,
    parseBase64ImageInput,
    stripBase64Whitespace,
  } = loadTsModule('src/lib/base64-image-tool.ts');

  const onePixelPng = 'iVBORw0KGgo=';
  assert.equal(stripBase64Whitespace('iVBORw0K\nGgo='), onePixelPng);
  assert.equal(isValidBase64Payload(onePixelPng), true);
  assert.equal(isValidBase64Payload('not image base64'), false);
  assert.equal(isSupportedImageMimeType('image/webp'), true);
  assert.equal(isSupportedImageMimeType('text/plain'), false);
  assert.equal(detectImageMimeTypeFromBase64(onePixelPng), 'image/png');
  assert.equal(extensionForImageMimeType('image/webp'), 'webp');

  assert.deepEqual(plain(parseBase64ImageInput(`data:image/png;base64,${onePixelPng}`)), {
    dataUrl: `data:image/png;base64,${onePixelPng}`,
    mimeType: 'image/png',
    base64: onePixelPng,
  });
  assert.deepEqual(plain(parseBase64ImageInput(`data:image/jpeg;charset=utf-8;base64,${onePixelPng}`)), {
    dataUrl: `data:image/png;base64,${onePixelPng}`,
    mimeType: 'image/png',
    base64: onePixelPng,
  });
  assert.deepEqual(plain(parseBase64ImageInput(onePixelPng, 'image/jpeg')), {
    dataUrl: `data:image/png;base64,${onePixelPng}`,
    mimeType: 'image/png',
    base64: onePixelPng,
  });
  assert.throws(() => parseBase64ImageInput('data:text/plain;base64,aGVsbG8='), /Invalid Base64 image data/);
  assert.equal(formatImageBytes(512), '512 B');
  assert.equal(formatImageBytes(1536), '1.5 KB');
  assert.equal(formatImageBytes(2 * 1024 * 1024), '2.00 MB');
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

test('timezone functions convert local inputs and classify working hours', () => {
  const {
    buildDateFromLocalInput,
    customTimeZoneId,
    dateRelation,
    encodeShareState,
    findPlaceById,
    formatTime,
    getTimeParts,
    getTimeStatus,
    parseShareState,
  } = loadTsModule('src/lib/timezone-tool.ts');

  const helsinkiDate = buildDateFromLocalInput('2026-04-30', '18:30', 'Europe/Helsinki');
  assert.ok(helsinkiDate);
  assert.equal(formatTime(helsinkiDate, 'America/Los_Angeles'), '08:30');
  assert.equal(formatTime(helsinkiDate, 'Asia/Shanghai'), '23:30');

  const helsinkiParts = getTimeParts(helsinkiDate, 'Europe/Helsinki');
  assert.equal(helsinkiParts.offsetLabel, 'UTC+3');
  assert.equal(getTimeStatus({ hour: 10 }, { workStart: 9, workEnd: 17 }), 'working');
  assert.equal(getTimeStatus({ hour: 7 }, { workStart: 9, workEnd: 17 }), 'sleeping');
  assert.equal(getTimeStatus({ hour: 20 }, { workStart: 9, workEnd: 17 }), 'sleeping');
  assert.equal(getTimeStatus({ hour: 2 }, { workStart: 9, workEnd: 17 }), 'sleeping');
  assert.equal(dateRelation(helsinkiDate, 'Asia/Tokyo', 'America/Los_Angeles'), 'next');

  const share = encodeShareState(['helsinki', 'tokyo'], helsinkiDate);
  assert.deepEqual(plain(parseShareState(new URLSearchParams(share)).placeIds), ['helsinki', 'tokyo']);

  const customId = customTimeZoneId('Europe/Oslo');
  assert.equal(findPlaceById(customId).timeZone, 'Europe/Oslo');
  assert.deepEqual(plain(parseShareState(new URLSearchParams(encodeShareState([customId], helsinkiDate))).placeIds), [customId]);
});

test('timezone functions apply daylight saving offsets for selected dates', () => {
  const { getTimeParts } = loadTsModule('src/lib/timezone-tool.ts');

  const winter = new Date('2026-01-15T12:00:00.000Z');
  const summer = new Date('2026-07-15T12:00:00.000Z');

  assert.equal(getTimeParts(winter, 'America/Los_Angeles').offsetLabel, 'UTC-8');
  assert.equal(getTimeParts(summer, 'America/Los_Angeles').offsetLabel, 'UTC-7');
  assert.equal(getTimeParts(winter, 'Europe/Helsinki').offsetLabel, 'UTC+2');
  assert.equal(getTimeParts(summer, 'Europe/Helsinki').offsetLabel, 'UTC+3');
  assert.equal(getTimeParts(winter, 'Asia/Shanghai').offsetLabel, 'UTC+8');
  assert.equal(getTimeParts(summer, 'Asia/Shanghai').offsetLabel, 'UTC+8');
});

test('timezone search helpers match places and custom IANA zones', () => {
  const {
    createCustomPlaceFromTimeZone,
    customTimeZoneId,
    getSupportedTimeZones,
    matchPlaceInput,
    matchTimeZoneInput,
    normalizePlaceIds,
    placeInputLabel,
    parseShareState,
    searchCityTimeZonePlaces,
    timeZoneName,
    timeZoneOption,
  } = loadTsModule('src/lib/timezone-tool.ts');

  assert.equal(placeInputLabel(matchPlaceInput('Shanghai', [])), 'Shanghai, China (Asia/Shanghai)');
  assert.equal(matchPlaceInput('China', ['shanghai'])?.id, 'beijing');
  assert.equal(matchPlaceInput('Shanghai', ['shanghai']), undefined);
  assert.equal(matchPlaceInput('  america/new_york  ', [])?.id, 'new-york');

  const panamaOption = timeZoneOption('America/Panama');
  assert.deepEqual(plain(panamaOption), {
    label: 'Panama (America/Panama)',
    searchText: 'panama america/panama',
    timeZone: 'America/Panama',
  });
  assert.equal(timeZoneName('America/Argentina/Buenos_Aires'), 'Buenos Aires');
  assert.equal(matchTimeZoneInput('Panama', [panamaOption], [])?.timeZone, 'America/Panama');
  assert.equal(matchTimeZoneInput('America/Panama', [panamaOption], [])?.timeZone, 'America/Panama');
  assert.equal(matchTimeZoneInput('Panama', [panamaOption], [customTimeZoneId('America/Panama')]), undefined);
  assert.equal(searchCityTimeZonePlaces('Munic', [])[0]?.name, 'Munich');
  assert.equal(matchPlaceInput('Munich', [])?.timeZone, 'Europe/Berlin');
  const munichId = searchCityTimeZonePlaces('Munic', [])[0].id;
  assert.deepEqual(plain(parseShareState(new URLSearchParams(`zones=helsinki,${munichId}`)).placeIds), ['helsinki', munichId]);

  const panama = createCustomPlaceFromTimeZone('America/Panama');
  assert.equal(panama?.id, customTimeZoneId('America/Panama'));
  assert.equal(panama?.name, 'Panama');
  assert.equal(createCustomPlaceFromTimeZone('Not/A_Time_Zone'), undefined);

  assert.deepEqual(plain(normalizePlaceIds(['tokyo', 'helsinki', 'tokyo', 'missing', customTimeZoneId('Europe/Oslo')])), [
    'helsinki',
    'tokyo',
    customTimeZoneId('Europe/Oslo'),
  ]);

  assert.ok(getSupportedTimeZones().includes('UTC'));
});

test('timezone work ranges normalize colors and match local hours', () => {
  const {
    DEFAULT_WORK_RANGE_COLOR,
    WORK_RANGE_COLORS,
    getMatchingWorkRange,
    hexToRgba,
    normalizeWorkRange,
    normalizeWorkRangeColor,
    workRangeLabel,
  } = loadTsModule('src/lib/timezone-tool.ts');

  assert.deepEqual(plain(WORK_RANGE_COLORS), ['#ffffff', '#67e8f9', '#6ee7b7', '#fcd34d', '#fda4af']);
  assert.equal(DEFAULT_WORK_RANGE_COLOR, '#ffffff');
  assert.equal(normalizeWorkRangeColor('#12ABef'), '#12abef');
  assert.equal(normalizeWorkRangeColor('cyan'), '#67e8f9');
  assert.equal(normalizeWorkRangeColor('bad-color'), '#ffffff');
  assert.equal(hexToRgba('#67e8f9', 0.18), 'rgba(103, 232, 249, 0.18)');

  assert.deepEqual(plain(normalizeWorkRange({ start: -3, end: 99, color: 'rose' })), {
    start: 0,
    end: 24,
    color: '#fda4af',
  });
  assert.deepEqual(plain(normalizeWorkRange({ start: 23, end: 5, color: '#123456' })), {
    start: 23,
    end: 24,
    color: '#123456',
  });
  assert.deepEqual(plain(normalizeWorkRange({ start: 9, end: 17 })), {
    start: 9,
    end: 17,
    color: '#ffffff',
  });

  const ranges = [
    normalizeWorkRange({ start: 9, end: 12, color: '#ffffff' }),
    normalizeWorkRange({ start: 13, end: 17, color: '#67e8f9' }),
  ];
  assert.equal(getMatchingWorkRange(8, ranges), null);
  assert.equal(getMatchingWorkRange(9, ranges)?.color, '#ffffff');
  assert.equal(getMatchingWorkRange(12, ranges), null);
  assert.equal(getMatchingWorkRange(16, ranges)?.color, '#67e8f9');
  assert.equal(workRangeLabel(ranges[1]), '13-16');
});

test('timezone share state rejects invalid zones and keeps custom zones', () => {
  const {
    DEFAULT_TIME_PLACES,
    customTimeZoneId,
    encodeShareState,
    parseShareState,
  } = loadTsModule('src/lib/timezone-tool.ts');

  const selectedDate = new Date('2026-04-30T15:30:00.000Z');
  const customId = customTimeZoneId('America/Panama');
  const parsed = parseShareState(new URLSearchParams(encodeShareState(['missing', 'london', customId], selectedDate)));

  assert.deepEqual(plain(parsed.placeIds), ['london', customId]);
  assert.equal(parsed.selectedDate?.toISOString(), selectedDate.toISOString());

  const fallback = parseShareState(new URLSearchParams('zones=missing&time=not-a-date'));
  assert.deepEqual(plain(fallback.placeIds), plain(DEFAULT_TIME_PLACES));
  assert.equal(fallback.selectedDate, null);
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

test('json formatter functions format, minify, inspect, and create paths', () => {
  const {
    formatJson,
    getJsonStats,
    jsonPathForChild,
    normalizeJsonLike,
    normalizeJsonLikeWithReasons,
  } = loadTsModule('src/lib/json-format-tool.ts');

  const input = '{"name":"Mofei","items":[1,true,null],"meta":{"city":"Helsinki"}}';
  const result = formatJson(input, 2);

  assert.equal(result.ok, true);
  assert.equal(result.parser, 'strict');
  assert.equal(result.minified, input);
  assert.match(result.formatted, /\n  "items": \[/);
  assert.equal(result.stats.keys, 4);
  assert.equal(result.stats.arrays, 1);
  assert.equal(result.stats.objects, 2);
  assert.equal(result.stats.booleans, 1);
  assert.equal(result.stats.nulls, 1);
  assert.equal(jsonPathForChild('$.meta', 'city'), '$.meta.city');
  assert.equal(jsonPathForChild('$', 'not-simple key'), '$["not-simple key"]');
  assert.equal(jsonPathForChild('$.items', 0), '$.items[0]');

  assert.deepEqual(plain(getJsonStats({ ok: true, list: [1, 2] })), {
    keys: 2,
    arrays: 1,
    objects: 1,
    strings: 0,
    numbers: 2,
    booleans: 1,
    nulls: 0,
    maxDepth: 2,
  });

  const invalid = formatJson('{bad');
  assert.equal(invalid.ok, false);
  assert.match(invalid.error, /JSON|property|position/i);

  const jsonLike = `{
    auth: "剧中人",
    gender: 'male',
    website: "http://bh-lay.com",
    hobbies: ["photography", "coding",],
  }`;
  const tolerant = formatJson(jsonLike);

  assert.equal(tolerant.ok, true);
  assert.equal(tolerant.parser, 'tolerant');
  assert.deepEqual(plain(tolerant.tolerantReasons), ['unquotedKeys', 'singleQuotedStrings', 'trailingCommas']);
  assert.equal(tolerant.value.auth, '剧中人');
  assert.equal(tolerant.value.gender, 'male');
  assert.deepEqual(plain(tolerant.value.hobbies), ['photography', 'coding']);
  assert.deepEqual(JSON.parse(normalizeJsonLike(jsonLike)), plain(tolerant.value));
  assert.deepEqual(plain(normalizeJsonLikeWithReasons('{// note\nok: true}').reasons), ['comments', 'unquotedKeys']);
});
