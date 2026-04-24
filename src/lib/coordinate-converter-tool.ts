import proj4 from 'proj4';

export type CoordinateOrder = 'lat_lng' | 'lng_lat';

const WGS84_PROJ = '+proj=longlat +datum=WGS84 +no_defs';
const WEB_MERCATOR_MAX_LAT = 85.05112878;
const WEB_MERCATOR_MAX = 20037508.34;

export function parseDecimalCoordinatePair(input: string, order: CoordinateOrder = 'lng_lat') {
  const parts = input.split(',').map((part) => Number(part.trim()));
  if (parts.length !== 2 || parts.some((part) => !Number.isFinite(part))) {
    throw new Error('Invalid coordinate format');
  }

  return order === 'lat_lng'
    ? { lng: parts[1], lat: parts[0] }
    : { lng: parts[0], lat: parts[1] };
}

export function validateWgs84Coordinate(lng: number, lat: number) {
  if (lat < -90 || lat > 90) throw new Error('Latitude must be between -90 and 90.');
  if (lng < -180 || lng > 180) throw new Error('Longitude must be between -180 and 180.');
}

export function wgs84ToWebMercator(lng: number, lat: number): [number, number] {
  if (Math.abs(lat) > WEB_MERCATOR_MAX_LAT) {
    throw new Error(`Web Mercator latitude must be between -${WEB_MERCATOR_MAX_LAT} and ${WEB_MERCATOR_MAX_LAT}.`);
  }

  const x = (lng * WEB_MERCATOR_MAX) / 180;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * WEB_MERCATOR_MAX) / 180;
  return [x, y];
}

export function webMercatorToWgs84(x: number, y: number): [number, number] {
  if (Math.abs(x) > WEB_MERCATOR_MAX || Math.abs(y) > WEB_MERCATOR_MAX) {
    throw new Error(`Web Mercator X/Y must be within +/-${WEB_MERCATOR_MAX}.`);
  }

  const lng = (x / WEB_MERCATOR_MAX) * 180;
  let lat = (y / WEB_MERCATOR_MAX) * 180;
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return [lng, lat];
}

export function ddToDms(dd: number, isLat: boolean) {
  const deg = Math.floor(Math.abs(dd));
  const min = Math.floor((Math.abs(dd) - deg) * 60);
  const sec = ((Math.abs(dd) - deg - min / 60) * 3600).toFixed(2);
  const dir = isLat ? (dd >= 0 ? 'N' : 'S') : (dd >= 0 ? 'E' : 'W');
  return `${deg}°${min}'${sec}"${dir}`;
}

export function dmsToDd(dms: string) {
  const match = dms.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/);
  if (!match) throw new Error('Invalid DMS format');

  const deg = Number(match[1]);
  const min = Number(match[2]);
  const sec = Number(match[3]);
  const dir = match[4];
  const dd = deg + min / 60 + sec / 3600;
  return dir === 'S' || dir === 'W' ? -dd : dd;
}

export function getUtmZone(lng: number) {
  return Math.min(60, Math.max(1, Math.floor((lng + 180) / 6) + 1));
}

export function getUtmDefinition(zone: number, northern: boolean) {
  if (zone < 1 || zone > 60) throw new Error('UTM zone must be between 1 and 60');
  return `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs${northern ? '' : ' +south'}`;
}

export function wgs84ToUtm(lng: number, lat: number) {
  const zone = getUtmZone(lng);
  const northern = lat >= 0;
  const [easting, northing] = proj4(WGS84_PROJ, getUtmDefinition(zone, northern), [lng, lat]) as [number, number];

  return {
    zone,
    hemisphere: northern ? 'N' : 'S',
    easting,
    northing,
  };
}
