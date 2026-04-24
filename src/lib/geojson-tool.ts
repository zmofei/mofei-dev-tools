const VALID_GEOJSON_TYPES = new Set([
  'Feature',
  'FeatureCollection',
  'Point',
  'LineString',
  'Polygon',
  'MultiPoint',
  'MultiLineString',
  'MultiPolygon',
  'GeometryCollection',
]);

export function validateGeoJsonText(text: string) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !VALID_GEOJSON_TYPES.has(parsed.type)) {
    throw new Error('Invalid GeoJSON type');
  }

  return parsed;
}

export function createGeoJsonPreviewUrl(geoJson: unknown) {
  return `https://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(geoJson))}`;
}

export function shouldUseGistForGeoJson(text: string, thresholdBytes = 8000) {
  return Buffer.byteLength(text, 'utf8') > thresholdBytes;
}

export function formatGeoJsonFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
