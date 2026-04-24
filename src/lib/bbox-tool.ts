export type BoundingBox = {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
};

export function normalizeBbox(bbox: BoundingBox): BoundingBox | null {
  const values = [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat];
  if (values.some((value) => !Number.isFinite(value))) return null;
  if (bbox.minLng < -180 || bbox.maxLng > 180 || bbox.minLat < -90 || bbox.maxLat > 90) return null;
  if (bbox.minLng >= bbox.maxLng || bbox.minLat >= bbox.maxLat) return null;
  return bbox;
}

export function parseBboxInput(input: string): BoundingBox | null {
  const cleanInput = input.trim();
  if (!cleanInput) return null;

  try {
    const parsed = JSON.parse(cleanInput);
    if (Array.isArray(parsed.bbox) && parsed.bbox.length === 4) {
      return normalizeBbox({
        minLng: Number(parsed.bbox[0]),
        minLat: Number(parsed.bbox[1]),
        maxLng: Number(parsed.bbox[2]),
        maxLat: Number(parsed.bbox[3]),
      });
    }

    if (parsed?.type === 'Feature' && parsed.geometry?.type === 'Polygon') {
      const ring = parsed.geometry.coordinates?.[0];
      if (Array.isArray(ring) && ring.length > 0) {
        const lngs = ring.map((coord: number[]) => Number(coord[0]));
        const lats = ring.map((coord: number[]) => Number(coord[1]));
        return normalizeBbox({
          minLng: Math.min(...lngs),
          minLat: Math.min(...lats),
          maxLng: Math.max(...lngs),
          maxLat: Math.max(...lats),
        });
      }
    }
  } catch {
    // Fall back to plain numeric input.
  }

  const numbers = cleanInput
    .split(/[,\s]+/)
    .filter(Boolean)
    .slice(0, 4)
    .map(Number);

  if (numbers.length !== 4) return null;

  return normalizeBbox({
    minLng: numbers[0],
    minLat: numbers[1],
    maxLng: numbers[2],
    maxLat: numbers[3],
  });
}

export function formatBboxParam(bbox: BoundingBox) {
  return [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat].map((value) => value.toFixed(6)).join(',');
}

export function calculateBboxMetrics(bbox: BoundingBox) {
  const centerLat = (bbox.minLat + bbox.maxLat) / 2;
  const centerLng = (bbox.minLng + bbox.maxLng) / 2;
  const earthRadiusKm = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const width = earthRadiusKm * toRad(bbox.maxLng - bbox.minLng) * Math.cos(toRad(centerLat));
  const height = earthRadiusKm * toRad(bbox.maxLat - bbox.minLat);

  return {
    center: { lat: centerLat, lng: centerLng },
    width,
    height,
    area: width * height,
  };
}

export function createBboxPolygonFeature(bbox: BoundingBox) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [bbox.minLng, bbox.minLat],
        [bbox.maxLng, bbox.minLat],
        [bbox.maxLng, bbox.maxLat],
        [bbox.minLng, bbox.maxLat],
        [bbox.minLng, bbox.minLat],
      ]],
    },
    properties: {},
  };
}
