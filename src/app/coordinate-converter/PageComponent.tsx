"use client"
import { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import proj4 from 'proj4';
import {
  GlassPanel,
  StatusToast,
} from '@mofei-dev/ui';
import Foot from '@/components/Common/Foot';
import { ToolContentSection, ToolHero, ToolPageShell } from '@/components/Common/ToolLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { event } from '@/components/GoogleAnalytics';
import { useSearchParams } from 'next/navigation';
import { toolPath } from '@/lib/site';

/**
 * GIS Coordinate Conversion Tool
 * 
 * Algorithm Declaration:
 * The coordinate conversion algorithms used in this tool are based on publicly available
 * resources from the internet and open source GIS community, including but not limited to:
 * - WGS84 decimal degrees and DMS: format conversion
 * - UTM projection conversion: powered by proj4 with WGS84 datum
 * - Web Mercator conversion: Based on EPSG:3857 standard
 */

// Coordinate system definitions
interface CoordinateSystem {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  example: string;
  exampleZh: string;
  format: 'dd' | 'dms' | 'utm' | 'mgrs' | 'mercator';
}

interface ConversionResult {
  system: CoordinateSystem;
  coordinates: string;
  formatted: string;
  valid: boolean;
  error?: string;
}

interface BatchConversionResult {
  line: number;
  original: string;
  results: ConversionResult[];
  hasError: boolean;
  error?: string;
}

interface ParsedCoordinateLine {
  line: number;
  original: string;
  coords?: [number, number];
  error?: string;
}

type CoordinateOrder = 'lat_lng' | 'lng_lat';

const TOOL_USAGE_CATEGORY = 'Tool Usage';

const trackCoordinateEvent = (action: string, label: string, value?: number) => {
  event(`coordinate_converter_${action}`, TOOL_USAGE_CATEGORY, label, value);
};

const getNonEmptyLineCount = (input: string) => input.split('\n').filter(line => line.trim() !== '').length;

const getCoordinateErrorCode = (message: string) => {
  if (message.includes('Invalid DMS')) return 'invalid_dms';
  if (message.includes('Invalid UTM')) return 'invalid_utm';
  if (message.includes('Invalid Web Mercator')) return 'invalid_web_mercator';
  if (message.includes('Web Mercator latitude')) return 'web_mercator_latitude_range';
  if (message.includes('Web Mercator X/Y')) return 'web_mercator_xy_range';
  if (message.includes('Latitude') || message.includes('纬度')) return 'latitude_range';
  if (message.includes('Longitude') || message.includes('经度')) return 'longitude_range';
  if (message.includes('Invalid coordinate')) return 'invalid_coordinate';

  return 'unknown';
};

function LabelIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.045] text-white/58">
      {children}
    </span>
  );
}

function CoordinateIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 21s6.75-5.85 6.75-11.25a6.75 6.75 0 10-13.5 0C5.25 15.15 12 21 12 21z" />
      <circle cx="12" cy="9.75" r="2.25" strokeWidth={1.75} />
    </svg>
  );
}

function InputIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.75 6.75h12.5M5.75 12h8.5M5.75 17.25h12.5" />
    </svg>
  );
}

function ResultIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.75 7.25h7.5M4.75 16.75h7.5M15.25 6l4 4-4 4" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.25 10H9.75" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" strokeWidth={1.75} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 10.75v4.75M12 8.25h.01" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7.25h9A1.75 1.75 0 0118.75 9v9A1.75 1.75 0 0117 19.75H8A1.75 1.75 0 016.25 18V9A1.75 1.75 0 018 7.25z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14.75 7.25V6A1.75 1.75 0 0013 4.25H6A1.75 1.75 0 004.25 6v7A1.75 1.75 0 006 14.75h.25" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.7 12.7l6.6 3.8M15.3 7.5L8.7 11.3" />
      <circle cx="6" cy="12" r="2.5" strokeWidth={1.75} />
      <circle cx="18" cy="6" r="2.5" strokeWidth={1.75} />
      <circle cx="18" cy="18" r="2.5" strokeWidth={1.75} />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.75v9.5M8.5 10.75L12 14.25l3.5-3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.75 18.75h12.5" />
    </svg>
  );
}

function ExampleIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6.75 5.75h10.5v12.5H6.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.25 9.25h5.5M9.25 12h5.5M9.25 14.75h3" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7.25 7.25l9.5 9.5M16.75 7.25l-9.5 9.5" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6 9l6 6 6-6" />
    </svg>
  );
}

const coordinateSystems: CoordinateSystem[] = [
  {
    id: 'wgs84',
    name: 'WGS84 (Decimal Degrees)',
    nameZh: 'WGS84 (十进制度)',
    description: 'World Geodetic System 1984, GPS standard',
    descriptionZh: '世界大地测量系统1984，GPS标准',
    example: '39.9042, 116.4074',
    exampleZh: '39.9042, 116.4074',
    format: 'dd'
  },
  {
    id: 'wgs84_dms',
    name: 'WGS84 (Degrees Minutes Seconds)',
    nameZh: 'WGS84 (度分秒)',
    description: 'WGS84 in degrees, minutes, seconds format',
    descriptionZh: 'WGS84度分秒格式',
    example: '39°54\'15.12"N, 116°24\'26.64"E',
    exampleZh: '39°54\'15.12"N, 116°24\'26.64"E',
    format: 'dms'
  },
  {
    id: 'gcj02',
    name: 'GCJ-02 (Mars Coordinates)',
    nameZh: 'GCJ-02 (火星坐标)',
    description: 'Chinese encrypted coordinate system',
    descriptionZh: '中国加密坐标系统',
    example: '39.9056, 116.4139',
    exampleZh: '39.9056, 116.4139',
    format: 'dd'
  },
  {
    id: 'bd09',
    name: 'BD-09 (Baidu Coordinates)',
    nameZh: 'BD-09 (百度坐标)',
    description: 'Baidu Maps coordinate system',
    descriptionZh: '百度地图坐标系统',
    example: '39.9119, 116.4204',
    exampleZh: '39.9119, 116.4204',
    format: 'dd'
  },
  {
    id: 'utm',
    name: 'UTM (Universal Transverse Mercator)',
    nameZh: 'UTM (通用横轴墨卡托)',
    description: 'UTM coordinate system with zone',
    descriptionZh: 'UTM坐标系统带区号',
    example: '50T 447192.3 4417528.5',
    exampleZh: '50T 447192.3 4417528.5',
    format: 'utm'
  },
  {
    id: 'web_mercator',
    name: 'Web Mercator (EPSG:3857)',
    nameZh: 'Web墨卡托 (EPSG:3857)',
    description: 'Web mapping standard projection',
    descriptionZh: '网络地图标准投影',
    example: '12958528.0, 4849865.0',
    exampleZh: '12958528.0, 4849865.0',
    format: 'mercator'
  }
];

const hiddenCoordinateSystemIds = new Set(['gcj02', 'bd09']);
const visibleCoordinateSystems = coordinateSystems.filter(system => !hiddenCoordinateSystemIds.has(system.id));

// Constants for coordinate conversions
const pi = Math.PI;
const WGS84_PROJ = '+proj=longlat +datum=WGS84 +no_defs';
const WEB_MERCATOR_MAX_LAT = 85.05112878;
const WEB_MERCATOR_MAX = 20037508.34;

const getMessage = (language: string, zh: string, en: string) => language === 'zh' ? zh : en;

const isUtmNorthern = (zoneLetterOrHemisphere: string) => {
  const value = zoneLetterOrHemisphere.toUpperCase();
  if (value === 'N') return true;
  if (value === 'S') return false;
  return value >= 'N';
};

const getUtmDefinition = (zone: number, northern: boolean) => {
  if (zone < 1 || zone > 60) {
    throw new Error('UTM zone must be between 1 and 60');
  }

  return `+proj=utm +zone=${zone} +datum=WGS84 +units=m +no_defs${northern ? '' : ' +south'}`;
};

const getUtmZone = (lng: number) => Math.min(60, Math.max(1, Math.floor((lng + 180) / 6) + 1));

const wgs84ToUtm = (lng: number, lat: number) => {
  const zone = getUtmZone(lng);
  const northern = lat >= 0;
  const [easting, northing] = proj4(WGS84_PROJ, getUtmDefinition(zone, northern), [lng, lat]) as [number, number];

  return {
    zone,
    hemisphere: northern ? 'N' : 'S',
    easting,
    northing,
  };
};

const utmToWgs84 = (zone: number, zoneLetterOrHemisphere: string, easting: number, northing: number): [number, number] => {
  const northern = isUtmNorthern(zoneLetterOrHemisphere);
  return proj4(getUtmDefinition(zone, northern), WGS84_PROJ, [easting, northing]) as [number, number];
};

const parseDecimalPair = (input: string) => {
  const parts = input.split(',').map(p => p.trim());
  if (parts.length !== 2) return null;

  const first = Number(parts[0]);
  const second = Number(parts[1]);
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;

  return [first, second] as [number, number];
};

const canSwapCoordinateOrder = (input: string, systemId: string, coordinateOrder: CoordinateOrder) => {
  if (systemId !== 'wgs84') return false;

  return input
    .split('\n')
    .some(line => {
      const pair = parseDecimalPair(line.trim());
      if (!pair) return false;

      if (coordinateOrder === 'lat_lng') {
        return Math.abs(pair[0]) > 90 && Math.abs(pair[0]) <= 180 && Math.abs(pair[1]) <= 90;
      }

      return Math.abs(pair[1]) > 90 && Math.abs(pair[1]) <= 180 && Math.abs(pair[0]) <= 90;
    });
};

const getOutputOrderLabel = (systemId: string, language: string, coordinateOrder: CoordinateOrder) => {
  if (systemId === 'web_mercator') {
    return getMessage(language, '输出顺序：X, Y（米）', 'Output order: X, Y in meters');
  }

  if (systemId === 'utm') {
    return getMessage(language, '输出顺序：Zone Hemisphere Easting Northing', 'Output order: Zone Hemisphere Easting Northing');
  }

  return coordinateOrder === 'lat_lng'
    ? getMessage(language, '输出顺序：纬度, 经度', 'Output order: latitude, longitude')
    : getMessage(language, '输出顺序：经度, 纬度', 'Output order: longitude, latitude');
};

const createRangeError = (lng: number, lat: number, language: string, coordinateOrder: CoordinateOrder = 'lat_lng') => {
  if (Math.abs(lat) > 90 && Math.abs(lat) <= 180 && Math.abs(lng) <= 90) {
    return coordinateOrder === 'lat_lng'
      ? getMessage(
        language,
        '纬度不能超过 90。你可能输入了“经度, 纬度”，请改成“纬度, 经度”，或改用“经度, 纬度”。',
        'Latitude must be between -90 and 90. You may have entered longitude first; switch to longitude, latitude.'
      )
      : getMessage(
        language,
        '纬度不能超过 90。你可能输入了“纬度, 经度”，请改用“纬度, 经度”。',
        'Latitude must be between -90 and 90. You may have entered latitude first; switch to latitude, longitude.'
      );
  }

  if (Math.abs(lat) > 90) {
    return getMessage(language, '纬度必须在 -90 到 90 之间。', 'Latitude must be between -90 and 90.');
  }

  if (Math.abs(lng) > 180) {
    return getMessage(language, '经度必须在 -180 到 180 之间。', 'Longitude must be between -180 and 180.');
  }

  return '';
};

const validateWgs84Range = (lng: number, lat: number, language: string, coordinateOrder: CoordinateOrder) => {
  const error = createRangeError(lng, lat, language, coordinateOrder);
  if (error) throw new Error(error);
};

const localizeCoordinateError = (message: string, language: string) => {
  const errorMap: Record<string, { zh: string; en: string }> = {
    'Invalid coordinate format': {
      zh: '无法识别坐标。请使用逗号分隔两个数字，例如 39.9042, 116.4074。',
      en: 'Could not read the coordinate. Use two numbers separated by a comma, for example 39.9042, 116.4074.'
    },
    'Invalid DMS format': {
      zh: '无法识别度分秒坐标。请使用类似 39°54\'15.12"N, 116°24\'26.64"E 的格式。',
      en: 'Could not read the DMS coordinate. Use a format like 39°54\'15.12"N, 116°24\'26.64"E.'
    },
    'Invalid UTM format': {
      zh: '无法识别 UTM 坐标。请使用类似 50N 447192.3 4417528.5 的格式。',
      en: 'Could not read the UTM coordinate. Use a format like 50N 447192.3 4417528.5.'
    },
    'Invalid UTM numbers': {
      zh: 'UTM 的 Easting 和 Northing 必须是数字。',
      en: 'UTM easting and northing must be numbers.'
    },
    'Invalid Web Mercator format': {
      zh: '无法识别 Web Mercator 坐标。请使用 X, Y 两个数字。',
      en: 'Could not read the Web Mercator coordinate. Use X, Y numbers.'
    }
  };

  const mapped = errorMap[message];
  if (mapped) return language === 'zh' ? mapped.zh : mapped.en;

  if (message.startsWith('Web Mercator latitude')) {
    return getMessage(language, `Web Mercator 纬度必须在 -${WEB_MERCATOR_MAX_LAT} 到 ${WEB_MERCATOR_MAX_LAT} 之间。`, message);
  }

  if (message.startsWith('Web Mercator X/Y')) {
    return getMessage(language, `Web Mercator 的 X/Y 必须在 ±${WEB_MERCATOR_MAX} 范围内。`, message);
  }

  return message;
};

// Web Mercator conversions
const wgs84ToWebMercator = (lng: number, lat: number): [number, number] => {
  if (Math.abs(lat) > WEB_MERCATOR_MAX_LAT) {
    throw new Error(`Web Mercator latitude must be between -${WEB_MERCATOR_MAX_LAT} and ${WEB_MERCATOR_MAX_LAT}`);
  }

  const x = lng * 20037508.34 / 180;
  let y = Math.log(Math.tan((90 + lat) * pi / 360)) / (pi / 180);
  y = y * 20037508.34 / 180;
  return [x, y];
};

const webMercatorToWgs84 = (x: number, y: number): [number, number] => {
  if (Math.abs(x) > WEB_MERCATOR_MAX || Math.abs(y) > WEB_MERCATOR_MAX) {
    throw new Error(`Web Mercator X/Y must be within ±${WEB_MERCATOR_MAX}`);
  }

  const lng = x / 20037508.34 * 180;
  let lat = y / 20037508.34 * 180;
  lat = 180 / pi * (2 * Math.atan(Math.exp(lat * pi / 180)) - pi / 2);
  return [lng, lat];
};

// Degrees/Minutes/Seconds conversions
const ddToDms = (dd: number, isLat: boolean): string => {
  const deg = Math.floor(Math.abs(dd));
  const min = Math.floor((Math.abs(dd) - deg) * 60);
  const sec = ((Math.abs(dd) - deg - min / 60) * 3600).toFixed(2);
  const dir = isLat ? (dd >= 0 ? 'N' : 'S') : (dd >= 0 ? 'E' : 'W');
  return `${deg}°${min}'${sec}"${dir}`;
};

const dmsToDd = (dms: string): number => {
  const regex = /(\d+)°(\d+)'([\d.]+)"([NSEW])/;
  const match = dms.match(regex);
  if (!match) throw new Error('Invalid DMS format');
  
  const deg = parseInt(match[1]);
  const min = parseInt(match[2]);
  const sec = parseFloat(match[3]);
  const dir = match[4];
  
  let dd = deg + min / 60 + sec / 3600;
  if (dir === 'S' || dir === 'W') dd = -dd;
  
  return dd;
};

function CoordinateConverterPageContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const [inputCoords, setInputCoords] = useState('');
  const [sourceSystem, setSourceSystem] = useState('wgs84');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [batchResults, setBatchResults] = useState<BatchConversionResult[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [coordinateOrder, setCoordinateOrder] = useState<CoordinateOrder>('lng_lat');
  const [inputTextareaHeight, setInputTextareaHeight] = useState(168);
  const resizeStartRef = useRef<{ y: number; height: number } | null>(null);

  const titleText = t('coordinate-converter.title');
  const subtitleText = t('coordinate-converter.subtitle');

  const updateUrlOrder = useCallback((order: CoordinateOrder) => {
    const params = new URLSearchParams(window.location.search);
    params.set('order', order);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, []);

  const startInputResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    resizeStartRef.current = {
      y: event.clientY,
      height: inputTextareaHeight,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!resizeStartRef.current) return;

      const nextHeight = resizeStartRef.current.height + moveEvent.clientY - resizeStartRef.current.y;
      setInputTextareaHeight(Math.max(144, Math.min(560, nextHeight)));
    };

    const handlePointerUp = () => {
      resizeStartRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [inputTextareaHeight]);

  // Parse single coordinate line based on format
  const parseCoordinates = useCallback((input: string, systemId: string): [number, number] => {
    const trimmed = input.trim();
    
    if (systemId === 'wgs84_dms') {
      // Parse DMS format: 39°54'15.12"N, 116°24'26.64"E
      const parts = trimmed.split(',').map(p => p.trim());
      if (parts.length !== 2) throw new Error('Invalid DMS format');
      
      const first = dmsToDd(parts[0]);
      const second = dmsToDd(parts[1]);
      const lat = coordinateOrder === 'lat_lng' ? first : second;
      const lng = coordinateOrder === 'lat_lng' ? second : first;
      return [lng, lat];
    } else if (systemId === 'utm') {
      // Parse UTM format: 50N 447192.3 4417528.5 or 50T 447192.3 4417528.5
      const match = trimmed.match(/^(\d{1,2})\s*([A-Za-z])\s+([\d.]+)\s+([\d.]+)$/);
      if (!match) throw new Error('Invalid UTM format');
      
      const zone = parseInt(match[1], 10);
      const easting = parseFloat(match[3]);
      const northing = parseFloat(match[4]);
      if (!Number.isFinite(easting) || !Number.isFinite(northing)) throw new Error('Invalid UTM numbers');

      return utmToWgs84(zone, match[2], easting, northing);
    } else if (systemId === 'web_mercator') {
      // Parse Web Mercator format: 12958528.0, 4849865.0
      const parts = trimmed.split(',').map(p => parseFloat(p.trim()));
      if (parts.length !== 2) throw new Error('Invalid Web Mercator format');
      
      return webMercatorToWgs84(parts[0], parts[1]);
    } else {
      // Parse decimal degrees: 39.9042, 116.4074
      const parts = parseDecimalPair(trimmed);
      if (!parts) throw new Error('Invalid coordinate format');
      
      return coordinateOrder === 'lat_lng'
        ? [parts[1], parts[0]]
        : [parts[0], parts[1]];
    }
  }, [coordinateOrder]);

  // Parse multiple coordinates (one per line)
  const parseMultipleCoordinates = useCallback((input: string, systemId: string): ParsedCoordinateLine[] => {
    const lines = input.split('\n');
    const results: ParsedCoordinateLine[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          const coords = parseCoordinates(line, systemId);
          results.push({
            line: i + 1,
            coords,
            original: line
          });
        } catch (error) {
          results.push({
            line: i + 1,
            original: line,
            error: error instanceof Error ? error.message : 'Invalid coordinate format'
          });
        }
      }
    }
    
    return results;
  }, [parseCoordinates]);

  // Convert coordinates to all supported systems
  const convertCoordinates = useCallback((lng: number, lat: number): ConversionResult[] => {
    const results: ConversionResult[] = [];
    
    // First convert to WGS84 if needed
    const wgs84Lng = lng;
    const wgs84Lat = lat;
    
    // Generate results for all coordinate systems
    visibleCoordinateSystems.forEach(system => {
      try {
        let convertedLng = wgs84Lng;
        let convertedLat = wgs84Lat;
        let formatted = '';
        
        if (system.id === 'wgs84') {
          formatted = coordinateOrder === 'lat_lng'
            ? `${convertedLat.toFixed(6)}, ${convertedLng.toFixed(6)}`
            : `${convertedLng.toFixed(6)}, ${convertedLat.toFixed(6)}`;
        } else if (system.id === 'wgs84_dms') {
          const latDms = ddToDms(convertedLat, true);
          const lngDms = ddToDms(convertedLng, false);
          formatted = coordinateOrder === 'lat_lng'
            ? `${latDms}, ${lngDms}`
            : `${lngDms}, ${latDms}`;
        } else if (system.id === 'utm') {
          const utm = wgs84ToUtm(wgs84Lng, wgs84Lat);
          formatted = `${utm.zone}${utm.hemisphere} ${utm.easting.toFixed(3)} ${utm.northing.toFixed(3)}`;
        } else if (system.id === 'web_mercator') {
          [convertedLng, convertedLat] = wgs84ToWebMercator(wgs84Lng, wgs84Lat);
          formatted = `${convertedLng.toFixed(1)}, ${convertedLat.toFixed(1)}`;
        }
        
        results.push({
          system,
          coordinates: `${convertedLng}, ${convertedLat}`,
          formatted,
          valid: true
        });
      } catch (error) {
        results.push({
          system,
          coordinates: '',
          formatted: '',
          valid: false,
          error: error instanceof Error ? localizeCoordinateError(error.message, language) : getMessage(language, '转换失败', 'Conversion error')
        });
      }
    });
    
    return results;
  }, [coordinateOrder, language]);

  // Load data from URL parameters on mount
  useEffect(() => {
    const coords = searchParams.get('coords');
    const system = searchParams.get('system');
    const order = searchParams.get('order');
    const requestedOrder = order === 'lng_lat' || order === 'lat_lng' ? order : null;
    
    if (coords && system && visibleCoordinateSystems.some(visibleSystem => visibleSystem.id === system)) {
      if (requestedOrder && requestedOrder !== coordinateOrder) {
        setCoordinateOrder(requestedOrder);
        trackCoordinateEvent('url_order_loaded', `system:${system}|order:${requestedOrder}`, coords.length);
        return;
      }

      setIsLoadingFromUrl(true);
      setInputCoords(coords);
      setSourceSystem(system);
      
      // Auto-convert after setting values
      setTimeout(() => {
        try {
          const lines = coords.split('\n').filter(line => line.trim() !== '');

          if (lines.length > 1) {
            const parsedCoords = parseMultipleCoordinates(coords, system);
            const loadedBatchResults: BatchConversionResult[] = parsedCoords.map(parsedCoord => {
              if (!parsedCoord.coords) {
                return {
                  line: parsedCoord.line,
                  original: parsedCoord.original,
                  results: [],
                  hasError: true,
                  error: localizeCoordinateError(parsedCoord.error || 'Invalid coordinate format', language)
                };
              }

              const [lng, lat] = parsedCoord.coords;

              const rangeError = system !== 'utm' && system !== 'web_mercator'
                ? createRangeError(lng, lat, language, coordinateOrder)
                : '';

              if (rangeError) {
                return {
                  line: parsedCoord.line,
                  original: parsedCoord.original,
                  results: [],
                  hasError: true,
                  error: rangeError
                };
              }

              return {
                line: parsedCoord.line,
                original: parsedCoord.original,
                results: convertCoordinates(lng, lat),
                hasError: false
              };
            });

            setResults([]);
            setBatchResults(loadedBatchResults);
            trackCoordinateEvent(
              'url_batch_loaded',
              `system:${system}|order:${requestedOrder || coordinateOrder}|ok:${loadedBatchResults.filter(batch => !batch.hasError).length}|error:${loadedBatchResults.filter(batch => batch.hasError).length}`,
              lines.length
            );
          } else {
            const [lng, lat] = parseCoordinates(coords, system);
            if (lng !== undefined && lat !== undefined) {
              const conversionResults = convertCoordinates(lng, lat);
              setResults(conversionResults);
              setBatchResults([]);
              trackCoordinateEvent('url_single_loaded', `system:${system}|order:${requestedOrder || coordinateOrder}`, coords.length);
            }
          }
        } catch (error) {
          console.error('Error parsing URL parameters:', error);
          setError(getMessage(language, '分享链接里的坐标无效，请重新输入或加载示例。', 'The shared link contains invalid coordinates. Enter coordinates again or load an example.'));
          trackCoordinateEvent('url_load_error', `system:${system}|order:${requestedOrder || coordinateOrder}`, coords.length);
        }
        setIsLoadingFromUrl(false);
      }, 100);
    }
  }, [searchParams, parseCoordinates, parseMultipleCoordinates, convertCoordinates, language, coordinateOrder]);

  // Handle coordinate conversion
  const handleConvert = useCallback(() => {
    if (!inputCoords.trim()) {
      setError(t('coordinate-converter.enterCoordinates'));
      trackCoordinateEvent('convert_error', `system:${sourceSystem}|order:${coordinateOrder}|reason:empty`, 0);
      return;
    }

    setIsProcessing(true);
    setError('');
    setResults([]);
    setBatchResults([]);

    try {
      // Check if input contains multiple lines
      const lines = inputCoords.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length > 1) {
        // Batch processing
        const parsedCoords = parseMultipleCoordinates(inputCoords, sourceSystem);
        const batchResults: BatchConversionResult[] = [];
        
        for (const parsedCoord of parsedCoords) {
          if (!parsedCoord.coords) {
            batchResults.push({
              line: parsedCoord.line,
              original: parsedCoord.original,
              results: [],
              hasError: true,
              error: localizeCoordinateError(parsedCoord.error || 'Invalid coordinate format', language)
            });
            continue;
          }

          const [lng, lat] = parsedCoord.coords;
          
          // Validate coordinate ranges
          const rangeError = sourceSystem !== 'utm' && sourceSystem !== 'web_mercator'
            ? createRangeError(lng, lat, language, coordinateOrder)
            : '';

          if (rangeError) {
            batchResults.push({
              line: parsedCoord.line,
              original: parsedCoord.original,
              results: [],
              hasError: true,
              error: rangeError
            });
            continue;
          }
          
          const conversionResults = convertCoordinates(lng, lat);
          batchResults.push({
            line: parsedCoord.line,
            original: parsedCoord.original,
            results: conversionResults,
            hasError: false
          });
        }
        
        setBatchResults(batchResults);
        
        trackCoordinateEvent(
          'batch_convert',
          `system:${sourceSystem}|order:${coordinateOrder}|ok:${batchResults.filter(batch => !batch.hasError).length}|error:${batchResults.filter(batch => batch.hasError).length}`,
          parsedCoords.length
        );
      } else {
        // Single coordinate processing
        const [lng, lat] = parseCoordinates(inputCoords, sourceSystem);
        
        // Validate coordinate ranges
        if (sourceSystem !== 'utm' && sourceSystem !== 'web_mercator') {
          validateWgs84Range(lng, lat, language, coordinateOrder);
        }
        
        const conversionResults = convertCoordinates(lng, lat);
        setResults(conversionResults);
        
        trackCoordinateEvent('single_convert', `system:${sourceSystem}|order:${coordinateOrder}`, inputCoords.length);
      }
    } catch (err: unknown) {
      const reason = err instanceof Error ? err.message : 'Unknown conversion error';
      setError(err instanceof Error ? localizeCoordinateError(err.message, language) : getMessage(language, '无法识别坐标。请使用逗号分隔两个数字。', 'Could not read the coordinate. Use two numbers separated by a comma.'));
      setResults([]);
      setBatchResults([]);
      trackCoordinateEvent('convert_error', `system:${sourceSystem}|order:${coordinateOrder}|reason:${getCoordinateErrorCode(reason)}`, inputCoords.length);
    } finally {
      setIsProcessing(false);
    }
  }, [inputCoords, sourceSystem, parseCoordinates, parseMultipleCoordinates, convertCoordinates, t, language, coordinateOrder]);

  // Load example coordinates
  const loadExample = () => {
    const system = visibleCoordinateSystems.find(s => s.id === sourceSystem);
    if (system) {
      const example = sourceSystem === 'wgs84' && coordinateOrder === 'lng_lat' ? '116.4074, 39.9042' : system.example;
      setInputCoords(example);
      setError('');
      trackCoordinateEvent('example_loaded', `system:${sourceSystem}|order:${coordinateOrder}`, example.length);
    }
  };

  // Copy result to clipboard
  const copyResult = (text: string, systemId: string) => {
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(systemId);
      setTimeout(() => setCopySuccess(''), 2000);
      trackCoordinateEvent('copy_result', `system:${systemId}|mode:${batchResults.length > 0 ? 'batch' : 'single'}`, text.length);
    }).catch(err => {
      console.error('Failed to copy:', err);
      setError(getMessage(language, '复制失败，请手动选择结果复制。', 'Copy failed. Select the result manually and copy it.'));
      trackCoordinateEvent('copy_error', `system:${systemId}|mode:${batchResults.length > 0 ? 'batch' : 'single'}`, text.length);
    });
  };

  // Clear all data
  const handleClear = () => {
    setInputCoords('');
    setResults([]);
    setBatchResults([]);
    setError('');
    setCopySuccess('');
    setShareSuccess(false);
    trackCoordinateEvent('clear', `had_output:${hasOutput}|input_length:${inputCoords.length}`, getNonEmptyLineCount(inputCoords));
  };

  // Copy result link to clipboard
  const shareResults = async () => {
    if (results.length === 0 && batchResults.length === 0) return;

    // Update URL with current parameters first
    const baseUrl = `${window.location.origin}${toolPath('coordinate-converter', language === 'zh' ? 'zh' : 'en')}`;
    const params = new URLSearchParams({
      coords: inputCoords,
      system: sourceSystem,
      order: coordinateOrder
    });
    const shareUrl = `${baseUrl}?${params.toString()}`;

    if (shareUrl.length > 1800) {
      setError(getMessage(language, '批量内容过长，不适合放进分享链接。请导出 JSON 或 CSV 文件。', 'This batch is too large for a reliable share link. Export JSON or CSV instead.'));
      trackCoordinateEvent('share_error', `reason:url_too_long|system:${sourceSystem}|order:${coordinateOrder}`, shareUrl.length);
      return;
    }

    // Update browser URL without reload
    window.history.replaceState({}, '', shareUrl);

    try {
      // Copy URL to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
      trackCoordinateEvent('share', `system:${sourceSystem}|order:${coordinateOrder}|mode:${batchResults.length > 0 ? 'batch' : 'single'}`, shareUrl.length);
    } catch (error) {
      console.error('Copy link failed:', error);
      setError(getMessage(language, '分享链接复制失败，请手动复制浏览器地址。', 'Could not copy the share link. Copy the browser address manually.'));
      trackCoordinateEvent('share_error', `reason:clipboard|system:${sourceSystem}|order:${coordinateOrder}`, shareUrl.length);
    }
  };

  // Export results as JSON
  const exportAsJSON = () => {
    if (results.length === 0 && batchResults.length === 0) return;

    let exportData;
    
    if (batchResults.length > 0) {
      // Batch export
      exportData = {
        timestamp: new Date().toISOString(),
        sourceSystem: sourceSystem,
        type: 'batch',
        totalLines: batchResults.length,
        successLines: batchResults.filter(batch => !batch.hasError).length,
        errorLines: batchResults.filter(batch => batch.hasError).length,
        results: batchResults.map(batch => ({
          line: batch.line,
          original: batch.original,
          status: batch.hasError ? 'error' : 'ok',
          hasError: batch.hasError,
          error: batch.error || null,
          conversions: batch.results.filter(r => r.valid).map(result => ({
            system: result.system.id,
            systemName: language === 'zh' ? result.system.nameZh : result.system.name,
            coordinates: result.formatted
          }))
        }))
      };
    } else {
      // Single export
      exportData = {
        timestamp: new Date().toISOString(),
        sourceSystem: sourceSystem,
        type: 'single',
        sourceCoordinates: inputCoords,
        results: results.filter(r => r.valid).map(result => ({
          system: result.system.id,
          systemName: language === 'zh' ? result.system.nameZh : result.system.name,
          coordinates: result.formatted
        }))
      };
    }

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coordinate-conversion-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    trackCoordinateEvent('export_json', `system:${sourceSystem}|mode:${batchResults.length > 0 ? 'batch' : 'single'}`, jsonContent.length);
  };

  // Export results as CSV
  const exportAsCSV = () => {
    if (results.length === 0 && batchResults.length === 0) return;

    let headers: string[];
    let rows: string[][];
    
    if (batchResults.length > 0) {
      // Batch CSV export
      headers = ['Line', 'Original', 'Status', 'Error', 'System', 'System Name', 'Coordinates'];
      rows = [];
      
      batchResults.forEach(batch => {
        if (batch.hasError) {
          rows.push([
            batch.line.toString(),
            batch.original,
            'error',
            batch.error || 'Invalid coordinate',
            '',
            '',
            ''
          ]);
        } else {
          batch.results.filter(r => r.valid).forEach(result => {
            rows.push([
              batch.line.toString(),
              batch.original,
              'ok',
              '',
              result.system.id,
              language === 'zh' ? result.system.nameZh : result.system.name,
              result.formatted
            ]);
          });
        }
      });
    } else {
      // Single CSV export
      headers = ['System', 'System Name', 'Coordinates'];
      rows = results.filter(r => r.valid).map(result => [
        result.system.id,
        language === 'zh' ? result.system.nameZh : result.system.name,
        result.formatted
      ]);
    }

    const csvContent = [headers, ...rows].map(row =>
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coordinate-conversion-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    trackCoordinateEvent('export_csv', `system:${sourceSystem}|mode:${batchResults.length > 0 ? 'batch' : 'single'}`, rows.length);
  };

  const hasOutput = results.length > 0 || batchResults.length > 0;
  const currentSystem = visibleCoordinateSystems.find(s => s.id === sourceSystem);
  const currentExample = sourceSystem === 'wgs84'
    ? coordinateOrder === 'lng_lat'
      ? '116.4074, 39.9042'
      : '39.9042, 116.4074'
    : currentSystem?.example;
  const shouldShowSwapOrder = canSwapCoordinateOrder(inputCoords, sourceSystem, coordinateOrder);
  const batchSuccessCount = batchResults.filter(batch => !batch.hasError).length;
  const batchErrorCount = batchResults.filter(batch => batch.hasError).length;
  const coordinateOrderOptions: Array<{ value: CoordinateOrder; label: string }> = coordinateOrder === 'lng_lat'
    ? [
      { value: 'lng_lat', label: getMessage(language, '经度, 纬度', 'Longitude, latitude') },
      { value: 'lat_lng', label: getMessage(language, '纬度, 经度', 'Latitude, longitude') },
    ]
    : [
      { value: 'lat_lng', label: getMessage(language, '纬度, 经度', 'Latitude, longitude') },
      { value: 'lng_lat', label: getMessage(language, '经度, 纬度', 'Longitude, latitude') },
    ];

  const handleSwapOrder = () => {
    const nextOrder = coordinateOrder === 'lat_lng' ? 'lng_lat' : 'lat_lng';
    setCoordinateOrder(nextOrder);
    updateUrlOrder(nextOrder);
    setError('');
    trackCoordinateEvent('coordinate_order_swapped', `system:${sourceSystem}|from:${coordinateOrder}|to:${nextOrder}`, inputCoords.length);
  };

  return (
    <ToolPageShell itemScope itemType="https://schema.org/WebApplication">
      <ToolHero
        backHref={language === 'en' ? '/' : '/zh'}
        backLabel={t('coordinate-converter.backToTools')}
        title={titleText}
        subtitle={subtitleText}
        infoSections={[
          {
            title: language === 'zh' ? '什么是坐标转换？' : 'What is coordinate conversion?',
            body: language === 'zh'
              ? '坐标转换会在不同地理坐标系统和投影之间换算位置，例如 WGS84、Web Mercator、DMS 和 UTM。'
              : 'Coordinate conversion transforms locations between geographic coordinate systems and projections such as WGS84, Web Mercator, DMS, and UTM.',
          },
          {
            title: language === 'zh' ? '如何使用这个工具？' : 'How to use this tool',
            body: language === 'zh'
              ? '选择源格式和目标格式，输入坐标后即可转换。你可以切换经纬度顺序、批量处理坐标，并复制转换结果。'
              : 'Choose source and target formats, enter coordinates, and convert. You can switch latitude/longitude order, process multiple coordinates, and copy results.',
          },
        ]}
        titleProps={{ itemProp: 'name' }}
        descriptionProps={{ itemProp: 'description' }}
      />
        <ToolContentSection>
          <div className="w-full space-y-5">
            {isLoadingFromUrl && (
              <StatusToast
                variant="success"
                title={t('coordinate-converter.loadingFromUrl')}
              />
            )}
            {shareSuccess && (
              <StatusToast
                variant="success"
                title={t('coordinate-converter.shared')}
              />
            )}
            {error && (
              <StatusToast
                variant="error"
                title={error}
              />
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="space-y-5">
                <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
                  <h2 className="mb-4 inline-flex items-center gap-2 text-base font-semibold text-white">
                    <LabelIcon>
                      <InputIcon />
                    </LabelIcon>
                    {t('coordinate-converter.inputCoordinates')}
                  </h2>

                  <label htmlFor="coordinate-source-system" className="mb-2 block text-sm font-medium text-white/62">
                    {t('coordinate-converter.sourceSystem')}
                  </label>
                  <select
                    id="coordinate-source-system"
                    value={sourceSystem}
                    onChange={(e) => {
                      const nextSystem = e.target.value;
                      setSourceSystem(nextSystem);
                      trackCoordinateEvent('source_system_changed', `from:${sourceSystem}|to:${nextSystem}|order:${coordinateOrder}`, inputCoords.length);
                    }}
                    className="mb-4 w-full rounded-[16px] border border-white/[0.08] bg-white/[0.045] px-4 py-3 text-sm text-white outline-none transition-colors duration-200 focus:border-white/[0.18] focus-visible:ring-2 focus-visible:ring-white/20"
                  >
                    {visibleCoordinateSystems.map(system => (
                      <option key={system.id} value={system.id} className="bg-slate-950 text-white">
                        {language === 'zh' ? system.nameZh : system.name}
                      </option>
                    ))}
                  </select>

                  {(sourceSystem === 'wgs84' || sourceSystem === 'wgs84_dms') && (
                    <div className="mb-4">
                      <div className="mb-2 text-sm font-medium text-white/62">
                        {getMessage(language, '坐标顺序', 'Coordinate order')}
                      </div>
                      <div className="grid grid-cols-2 gap-2 rounded-[18px] border border-white/[0.08] bg-white/[0.025] p-1">
                        {coordinateOrderOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              if (coordinateOrder !== option.value) {
                                trackCoordinateEvent('coordinate_order_changed', `system:${sourceSystem}|from:${coordinateOrder}|to:${option.value}`, inputCoords.length);
                              }
                              setCoordinateOrder(option.value);
                              updateUrlOrder(option.value);
                            }}
                            className={`min-h-10 rounded-[14px] px-3 text-sm transition-colors duration-200 ${
                              coordinateOrder === option.value
                                ? 'bg-white text-slate-950'
                                : 'text-white/58 hover:bg-white/[0.06] hover:text-white'
                            }`}
                            aria-pressed={coordinateOrder === option.value}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label htmlFor="coordinate-input" className="mb-2 block text-sm font-medium text-white/62">
                    {sourceSystem === 'wgs84'
                      ? coordinateOrder === 'lat_lng'
                        ? getMessage(language, '坐标值（纬度, 经度）', 'Coordinates (latitude, longitude)')
                        : getMessage(language, '坐标值（经度, 纬度）', 'Coordinates (longitude, latitude)')
                      : t('coordinate-converter.coordinates')}
                  </label>
                  <div className="overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.035] transition-colors duration-200 focus-within:border-white/[0.18] focus-within:ring-2 focus-within:ring-white/20">
                    <textarea
                      id="coordinate-input"
                      aria-describedby="coordinate-input-help"
                      value={inputCoords}
                      onChange={(e) => setInputCoords(e.target.value)}
                      placeholder={sourceSystem === 'wgs84'
                        ? coordinateOrder === 'lat_lng'
                          ? getMessage(
                            language,
                            `纬度, 经度\n例如：39.9042, 116.4074\n\n批量转换：\n39.9042, 116.4074\n31.2304, 121.4737`,
                            `latitude, longitude\nExample: 39.9042, 116.4074\n\nBatch:\n39.9042, 116.4074\n31.2304, 121.4737`
                          )
                          : getMessage(
                            language,
                            `经度, 纬度\n例如：116.4074, 39.9042\n\n批量转换：\n116.4074, 39.9042\n121.4737, 31.2304`,
                            `longitude, latitude\nExample: 116.4074, 39.9042\n\nBatch:\n116.4074, 39.9042\n121.4737, 31.2304`
                          )
                        : `${currentSystem?.example || ''}\n${language === 'zh' ? '多行输入时，每行填写一个坐标。' : 'For batch conversion, enter one coordinate per line.'}`}
                      className="block w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-white outline-none placeholder:text-white/28"
                      rows={5}
                      style={{ height: inputTextareaHeight }}
                    />
                    <div
                      role="separator"
                      aria-orientation="horizontal"
                      title={getMessage(language, '拖拽调整输入框高度', 'Drag to resize input height')}
                      onPointerDown={startInputResize}
                      className="flex h-4 cursor-row-resize items-center justify-center border-t border-white/[0.06] bg-white/[0.035] transition-colors duration-200 hover:bg-white/[0.07]"
                    >
                      <span className="h-0.5 w-10 rounded-full bg-white/22" />
                    </div>
                  </div>
                  <p id="coordinate-input-help" className="mt-2 text-xs leading-5 text-white/42">
                    {t('coordinate-converter.example')}: <span className="break-all font-mono text-white/58">{currentExample}</span>
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/42">
                    {sourceSystem === 'wgs84'
                      ? coordinateOrder === 'lat_lng'
                        ? getMessage(language, '当前使用“纬度在前，经度在后”。如果你从 GeoJSON 复制坐标，通常需要选择“经度, 纬度”。', 'Current order is latitude first, longitude second. If you copied from GeoJSON, choose longitude, latitude.')
                        : getMessage(language, '默认使用“经度在前，纬度在后”，适合 GeoJSON 和很多地图开发场景；如果来自 GPS 或 Google Maps，可切换为“纬度, 经度”。', 'Default order is longitude first, latitude second, which fits GeoJSON and many map development workflows; switch to latitude, longitude for GPS or Google Maps text.')
                      : getMessage(language, '支持单个坐标，也支持批量转换；批量时每行一个坐标。', 'Supports single coordinates and batch conversion; use one coordinate per line for batch input.')}
                  </p>
                  {shouldShowSwapOrder && (
                    <button
                      type="button"
                      onClick={handleSwapOrder}
                      className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-amber-200/[0.16] bg-amber-200/[0.07] px-3 text-xs text-amber-50/82 transition-colors duration-200 hover:border-amber-100/[0.28] hover:bg-amber-200/[0.12] hover:text-white"
                    >
                      {coordinateOrder === 'lat_lng'
                        ? getMessage(language, '检测到可能是“经度, 纬度”，改用这个顺序', 'Looks like longitude, latitude. Use that order')
                        : getMessage(language, '检测到可能是“纬度, 经度”，改用这个顺序', 'Looks like latitude, longitude. Use that order')}
                    </button>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={handleConvert}
                      disabled={isProcessing || isLoadingFromUrl || !inputCoords.trim()}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-slate-950 transition-colors duration-200 hover:bg-white/90 disabled:bg-white/20 disabled:text-white/35"
                    >
                      <CoordinateIcon />
                      {isProcessing || isLoadingFromUrl ? t('coordinate-converter.converting') : t('coordinate-converter.convert')}
                    </button>
                    <button
                      onClick={loadExample}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 text-sm text-white/62 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                    >
                      <ExampleIcon />
                      {t('coordinate-converter.loadExample')}
                    </button>
                    <button
                      onClick={handleClear}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 text-sm text-white/62 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                    >
                      <ClearIcon />
                      {t('coordinate-converter.clear')}
                    </button>
                  </div>
                </GlassPanel>

                <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
                  <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white/84">
                    <LabelIcon>
                      <InfoIcon />
                    </LabelIcon>
                    {t('coordinate-converter.usageTitle')}
                  </h2>
                  <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-white/58 marker:text-white/35">
                    <li>{language === 'zh' ? '选择输入坐标当前所属的坐标系统。' : 'Choose the coordinate system your input currently uses.'}</li>
                    <li>{language === 'zh' ? 'WGS84 使用“纬度, 经度”；如果来自 GeoJSON，通常需要交换顺序。' : 'WGS84 uses latitude, longitude; GeoJSON coordinates usually need the order swapped.'}</li>
                    <li>{language === 'zh' ? '点击转换后，在右侧复制、分享或导出需要的结果。' : 'Convert, then copy, share, or export the result you need on the right.'}</li>
                  </ol>
                  <details className="group mt-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white/74">
                      <span>{language === 'zh' ? '支持的格式说明' : 'Supported formats'}</span>
                      <ChevronIcon />
                    </summary>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-white/58">
                      <li><strong className="text-white/78">WGS84:</strong> {t('coordinate-converter.usage1')}</li>
                      <li><strong className="text-white/78">UTM:</strong> {t('coordinate-converter.usage4')} {language === 'zh' ? '格式：50N 447192.3 4417528.5，也兼容 50T 这类纬度带写法。' : 'Format: 50N 447192.3 4417528.5; latitude-band notation like 50T is also accepted.'}</li>
                      <li><strong className="text-white/78">Web Mercator:</strong> {t('coordinate-converter.usage5')}</li>
                    </ul>
                  </details>
                </GlassPanel>
              </div>

              <div className="space-y-5">
                <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="inline-flex items-center gap-2 text-base font-semibold text-white">
                      <LabelIcon>
                        <ResultIcon />
                      </LabelIcon>
                      {t('coordinate-converter.results')}
                      {batchResults.length > 0 && (
                        <span className="text-sm font-normal text-white/42">
                          ({getMessage(language, `成功 ${batchSuccessCount} 行 / 失败 ${batchErrorCount} 行`, `${batchSuccessCount} ok / ${batchErrorCount} failed`)})
                        </span>
                      )}
                    </h2>

                    {hasOutput && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={shareResults}
                          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 text-sm text-white/62 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                        >
                          <ShareIcon />
                          {t('coordinate-converter.share')}
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setExportMenuOpen(open => !open)}
                            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 text-sm text-white/62 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                            aria-expanded={exportMenuOpen}
                          >
                            <DownloadIcon />
                            {t('coordinate-converter.export')}
                          </button>
                          {exportMenuOpen && (
                            <div className="absolute right-0 top-full z-10 mt-2 w-36 overflow-hidden rounded-[14px] border border-white/[0.08] bg-slate-950/95 p-1 shadow-2xl backdrop-blur">
                              <button
                                type="button"
                                onClick={() => {
                                  exportAsJSON();
                                  setExportMenuOpen(false);
                                }}
                                className="block w-full rounded-[10px] px-3 py-2 text-left text-xs text-white/68 transition-colors hover:bg-white/[0.07] hover:text-white"
                              >
                                {t('coordinate-converter.exportJSON')}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  exportAsCSV();
                                  setExportMenuOpen(false);
                                }}
                                className="block w-full rounded-[10px] px-3 py-2 text-left text-xs text-white/68 transition-colors hover:bg-white/[0.07] hover:text-white"
                              >
                                {t('coordinate-converter.exportCSV')}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {results.length > 0 ? (
                    <div className="space-y-3">
                      {results.map((result) => (
                        <div key={result.system.id} className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <h3 className="min-w-0 text-sm font-medium leading-5 text-white/84">
                              {language === 'zh' ? result.system.nameZh : result.system.name}
                            </h3>
                            {result.valid && (
                              <button
                                type="button"
                                onClick={() => copyResult(result.formatted, result.system.id)}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/42 transition-colors hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                                title={copySuccess === result.system.id ? t('coordinate-converter.copied') : t('coordinate-converter.copy')}
                                aria-label={copySuccess === result.system.id ? t('coordinate-converter.copied') : t('coordinate-converter.copy')}
                              >
                                <CopyIcon />
                              </button>
                            )}
                          </div>
                          <p className="mb-2 text-xs text-white/38">
                            {getOutputOrderLabel(result.system.id, language, coordinateOrder)}
                          </p>
                          {result.valid ? (
                            <button
                              type="button"
                              onClick={() => copyResult(result.formatted, result.system.id)}
                              className="block w-full rounded-[14px] border border-white/[0.06] bg-black/18 p-3 text-left transition-colors hover:border-white/[0.12] hover:bg-white/[0.04]"
                              title={t('coordinate-converter.copy')}
                            >
                              <code className="break-all font-mono text-sm text-[#a1c4fd]">{result.formatted}</code>
                            </button>
                          ) : (
                            <div className="rounded-[14px] border border-rose-300/[0.12] bg-rose-300/[0.06] p-3 text-sm text-rose-100/78">
                              {result.error || 'Conversion failed'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : batchResults.length > 0 ? (
                    <div className="space-y-3">
                      {visibleCoordinateSystems.map(system => {
                        const allCoords = batchResults
                          .filter(batch => !batch.hasError)
                          .map(batch => {
                            const result = batch.results.find(r => r.system.id === system.id);
                            return result?.formatted ? `${batch.line}: ${result.formatted}` : '';
                          })
                          .filter(Boolean)
                          .join('\n');

                        return (
                          <div key={system.id} className="rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-3">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <h3 className="min-w-0 text-sm font-medium leading-5 text-white/84">
                                {language === 'zh' ? system.nameZh : system.name}
                              </h3>
                              <button
                                type="button"
                                onClick={() => copyResult(allCoords, system.id)}
                                disabled={!allCoords}
                                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/42 transition-colors hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                                title={copySuccess === system.id ? t('coordinate-converter.copied') : t('coordinate-converter.copy')}
                                aria-label={copySuccess === system.id ? t('coordinate-converter.copied') : t('coordinate-converter.copy')}
                              >
                                <CopyIcon />
                              </button>
                            </div>
                            <p className="mb-2 text-xs text-white/38">
                              {getOutputOrderLabel(system.id, language, coordinateOrder)}
                            </p>
                            {allCoords ? (
                              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-[14px] border border-white/[0.06] bg-black/18 p-3 font-mono text-sm leading-6 text-[#a1c4fd]">{allCoords}</pre>
                            ) : (
                              <div className="rounded-[14px] border border-white/[0.06] bg-black/18 p-3 text-sm text-white/38">
                                {getMessage(language, '无有效结果', 'No valid results')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {batchErrorCount > 0 && (
                        <div className="rounded-[18px] border border-rose-300/[0.12] bg-rose-300/[0.06] p-3">
                          <h3 className="mb-2 text-sm font-medium text-rose-100/86">
                            {getMessage(language, '需要修正的行', 'Rows that need changes')}
                          </h3>
                          <div className="space-y-2">
                            {batchResults.filter(batch => batch.hasError).map(batch => (
                              <div key={batch.line} className="rounded-[14px] border border-rose-200/[0.08] bg-black/14 p-3 text-sm">
                                <div className="font-mono text-rose-100/78">
                                  {getMessage(language, `第 ${batch.line} 行`, `Line ${batch.line}`)}: {batch.original}
                                </div>
                                <div className="mt-1 text-xs leading-5 text-rose-100/62">
                                  {batch.error || getMessage(language, '无法识别坐标。', 'Could not read the coordinate.')}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-white/[0.1] bg-white/[0.025] px-4 py-12 text-center">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/38">
                        <CoordinateIcon />
                      </div>
                      <h3 className="text-sm font-medium text-white/78">{t('coordinate-converter.results')}</h3>
                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/42">
                        {language === 'zh'
                          ? '输入坐标并点击转换后，这里会显示 WGS84、度分秒、UTM 和 Web Mercator 结果。'
                          : 'Enter coordinates and convert to see WGS84, DMS, UTM, and Web Mercator results here.'}
                      </p>
                    </div>
                  )}
                </GlassPanel>
              </div>
            </div>
          </div>
        </ToolContentSection>

      <footer>
        <Foot />
      </footer>
    </ToolPageShell>
  );
}

export default function CoordinateConverterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" stroke="currentColor" strokeLinecap="round" strokeWidth="4" d="M4 12a8 8 0 018-8"></path>
          </svg>
          <p className="text-white/42">Loading...</p>
        </div>
      </div>
    }>
      <CoordinateConverterPageContent />
    </Suspense>
  );
}
