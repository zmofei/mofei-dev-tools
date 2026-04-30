export type TimezonePlace = {
  id: string;
  name: string;
  country: string;
  timeZone: string;
  workStart: number;
  workEnd: number;
};

export type TimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
  offsetLabel: string;
  abbreviation: string;
};

export type TimeStatus = 'working' | 'sleeping';

export type TimeZoneOption = {
  label: string;
  searchText: string;
  timeZone: string;
};

export type WorkRange = {
  start: number;
  end: number;
  color: string;
};

export const DEFAULT_TIME_PLACES = ['helsinki', 'san-francisco', 'new-york', 'london', 'shanghai', 'tokyo'];
const CUSTOM_TIMEZONE_PREFIX = 'tz:';
export const HOME_PLACE_ID = 'helsinki';
export const DEFAULT_WORK_RANGE_COLOR = '#ffffff';
export const WORK_RANGE_COLORS = ['#ffffff', '#67e8f9', '#6ee7b7', '#fcd34d', '#fda4af'];

const LEGACY_WORK_RANGE_COLORS: Record<string, string> = {
  white: '#ffffff',
  cyan: '#67e8f9',
  emerald: '#6ee7b7',
  amber: '#fcd34d',
  rose: '#fda4af',
};

export const TIMEZONE_PLACES: TimezonePlace[] = [
  { id: 'helsinki', name: 'Helsinki', country: 'Finland', timeZone: 'Europe/Helsinki', workStart: 9, workEnd: 17 },
  { id: 'san-francisco', name: 'San Francisco', country: 'United States', timeZone: 'America/Los_Angeles', workStart: 9, workEnd: 17 },
  { id: 'new-york', name: 'New York', country: 'United States', timeZone: 'America/New_York', workStart: 9, workEnd: 17 },
  { id: 'london', name: 'London', country: 'United Kingdom', timeZone: 'Europe/London', workStart: 9, workEnd: 17 },
  { id: 'berlin', name: 'Berlin', country: 'Germany', timeZone: 'Europe/Berlin', workStart: 9, workEnd: 17 },
  { id: 'paris', name: 'Paris', country: 'France', timeZone: 'Europe/Paris', workStart: 9, workEnd: 17 },
  { id: 'tallinn', name: 'Tallinn', country: 'Estonia', timeZone: 'Europe/Tallinn', workStart: 9, workEnd: 17 },
  { id: 'beijing', name: 'Beijing', country: 'China', timeZone: 'Asia/Shanghai', workStart: 9, workEnd: 18 },
  { id: 'shanghai', name: 'Shanghai', country: 'China', timeZone: 'Asia/Shanghai', workStart: 9, workEnd: 18 },
  { id: 'hong-kong', name: 'Hong Kong', country: 'Hong Kong', timeZone: 'Asia/Hong_Kong', workStart: 9, workEnd: 18 },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', timeZone: 'Asia/Singapore', workStart: 9, workEnd: 18 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', timeZone: 'Asia/Tokyo', workStart: 9, workEnd: 18 },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', timeZone: 'Asia/Seoul', workStart: 9, workEnd: 18 },
  { id: 'sydney', name: 'Sydney', country: 'Australia', timeZone: 'Australia/Sydney', workStart: 9, workEnd: 17 },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates', timeZone: 'Asia/Dubai', workStart: 9, workEnd: 18 },
  { id: 'bangalore', name: 'Bangalore', country: 'India', timeZone: 'Asia/Kolkata', workStart: 9, workEnd: 18 },
  { id: 'utc', name: 'UTC', country: 'Coordinated Universal Time', timeZone: 'UTC', workStart: 9, workEnd: 17 },
];

const TWO_DIGIT = '2-digit' as const;

function getDateTimeFormat(timeZone: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    ...options,
  });
}

function partsMap(date: Date, timeZone: string) {
  const parts = getDateTimeFormat(timeZone, {
    year: 'numeric',
    month: TWO_DIGIT,
    day: TWO_DIGIT,
    hour: TWO_DIGIT,
    minute: TWO_DIGIT,
    weekday: 'short',
    timeZoneName: 'shortOffset',
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function getTimeParts(date: Date, timeZone: string): TimeParts {
  const map = partsMap(date, timeZone);
  const abbreviation = getDateTimeFormat(timeZone, { timeZoneName: 'short' })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value ?? timeZone;

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: map.weekday,
    offsetLabel: map.timeZoneName === 'GMT' ? 'UTC+0' : map.timeZoneName.replace('GMT', 'UTC'),
    abbreviation,
  };
}

export function formatTime(date: Date, timeZone: string, hour12 = false) {
  return new Intl.DateTimeFormat(hour12 ? 'en-US' : 'en-GB', {
    timeZone,
    hour: TWO_DIGIT,
    minute: TWO_DIGIT,
    hour12,
  }).format(date);
}

export function formatDateLabel(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getTimeStatus(parts: Pick<TimeParts, 'hour'>, place: Pick<TimezonePlace, 'workStart' | 'workEnd'>): TimeStatus {
  if (parts.hour >= place.workStart && parts.hour < place.workEnd) return 'working';
  return 'sleeping';
}

export function placeInputLabel(place: TimezonePlace) {
  return `${place.name}, ${place.country} (${place.timeZone})`;
}

export function placeInputValues(place: TimezonePlace) {
  return [
    placeInputLabel(place),
    place.name,
    place.country,
    place.timeZone,
  ].map((value) => value.toLowerCase());
}

export function matchPlaceInput(value: string, selectedIds: string[]) {
  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue) return undefined;
  const selected = new Set(selectedIds);

  return TIMEZONE_PLACES.find((place) => !selected.has(place.id) && placeInputValues(place).includes(normalizedValue));
}

export function getSupportedTimeZones() {
  const intlWithSupportedValues = Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[];
  };

  return ['UTC', ...(intlWithSupportedValues.supportedValuesOf?.('timeZone') ?? [])];
}

export function timeZoneName(timeZone: string) {
  if (timeZone === 'UTC') return 'UTC';
  return timeZone.split('/').pop()?.replaceAll('_', ' ') || timeZone;
}

export function timeZoneOption(timeZone: string): TimeZoneOption {
  const name = timeZoneName(timeZone);

  return {
    label: name === timeZone ? timeZone : `${name} (${timeZone})`,
    searchText: `${name} ${timeZone}`.toLowerCase(),
    timeZone,
  };
}

export function matchTimeZoneInput(value: string, options: TimeZoneOption[], selectedIds: string[]) {
  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue) return undefined;
  const selected = new Set(selectedIds);

  return options.find((option) => {
    if (selected.has(customTimeZoneId(option.timeZone))) return false;
    return option.label.toLowerCase() === normalizedValue ||
      option.timeZone.toLowerCase() === normalizedValue ||
      timeZoneName(option.timeZone).toLowerCase() === normalizedValue;
  });
}

export function normalizePlaceIds(ids: string[]) {
  const seen = new Set<string>([HOME_PLACE_ID]);
  return [
    HOME_PLACE_ID,
    ...ids.filter((id) => {
      if (id === HOME_PLACE_ID || seen.has(id) || !findPlaceById(id)) return false;
      seen.add(id);
      return true;
    }),
  ];
}

export function normalizeWorkRangeColor(value: unknown) {
  if (typeof value !== 'string') return DEFAULT_WORK_RANGE_COLOR;
  const normalized = value.trim().toLowerCase();
  if (LEGACY_WORK_RANGE_COLORS[normalized]) return LEGACY_WORK_RANGE_COLORS[normalized];
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : DEFAULT_WORK_RANGE_COLOR;
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = normalizeWorkRangeColor(hex).slice(1);
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function normalizeWorkRange(range: Partial<WorkRange>): WorkRange {
  const start = Math.min(23, Math.max(0, Number(range.start) || 0));
  const end = Math.min(24, Math.max(start + 1, Number(range.end) || start + 1));
  const color = normalizeWorkRangeColor(range.color);
  return { start, end, color };
}

export function workRangeLabel(range: WorkRange) {
  return `${range.start}-${range.end - 1}`;
}

export function getMatchingWorkRange(hour: number, ranges: WorkRange[]) {
  return ranges.find((range) => hour >= range.start && hour < range.end) ?? null;
}

export function dateKeyInTimeZone(date: Date, timeZone: string) {
  const parts = getTimeParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export function dateRelation(date: Date, targetTimeZone: string, referenceTimeZone: string) {
  const target = dateKeyInTimeZone(date, targetTimeZone);
  const reference = dateKeyInTimeZone(date, referenceTimeZone);

  if (target === reference) return 'same';
  return target > reference ? 'next' : 'previous';
}

export function findPlaceById(id: string) {
  if (id.startsWith(CUSTOM_TIMEZONE_PREFIX)) {
    return createCustomPlaceFromTimeZone(id.slice(CUSTOM_TIMEZONE_PREFIX.length));
  }

  return TIMEZONE_PLACES.find((place) => place.id === id);
}

export function customTimeZoneId(timeZone: string) {
  return `${CUSTOM_TIMEZONE_PREFIX}${timeZone}`;
}

export function createCustomPlaceFromTimeZone(timeZone: string): TimezonePlace | undefined {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
  } catch {
    return undefined;
  }

  const fallbackName = timeZone.split('/').pop()?.replaceAll('_', ' ') || timeZone;

  return {
    id: customTimeZoneId(timeZone),
    name: fallbackName,
    country: 'Custom time zone',
    timeZone,
    workStart: 9,
    workEnd: 17,
  };
}

export function buildDateFromLocalInput(date: string, time: string, sourceTimeZone: string) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const approximateUtc = Date.UTC(year, month - 1, day, hour, minute);
  const offset = getTimeZoneOffsetMinutes(new Date(approximateUtc), sourceTimeZone);
  const candidate = new Date(approximateUtc - offset * 60_000);
  const candidateParts = getTimeParts(candidate, sourceTimeZone);

  if (
    candidateParts.year === year &&
    candidateParts.month === month &&
    candidateParts.day === day &&
    candidateParts.hour === hour &&
    candidateParts.minute === minute
  ) {
    return candidate;
  }

  const correctedOffset = getTimeZoneOffsetMinutes(candidate, sourceTimeZone);
  return new Date(approximateUtc - correctedOffset * 60_000);
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = getTimeParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

export function encodeShareState(placeIds: string[], selectedDate: Date) {
  const params = new URLSearchParams();
  params.set('zones', placeIds.join(','));
  params.set('time', selectedDate.toISOString());
  return params.toString();
}

export function parseShareState(searchParams: URLSearchParams) {
  const zones = searchParams.get('zones')?.split(',').filter(Boolean) ?? [];
  const validZones = zones.filter((id) => Boolean(findPlaceById(id)));
  const time = searchParams.get('time');
  const parsedTime = time ? new Date(time) : null;

  return {
    placeIds: validZones.length ? validZones : DEFAULT_TIME_PLACES,
    selectedDate: parsedTime && !Number.isNaN(parsedTime.getTime()) ? parsedTime : null,
  };
}
