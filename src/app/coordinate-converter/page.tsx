"use client"
import { useState, useCallback, useEffect, Suspense } from 'react';
import { motion } from "motion/react"
import Link from 'next/link';
import Foot from '@/components/Common/Foot';
import { useLanguage } from '@/contexts/LanguageContext';
import { event } from '@/components/GoogleAnalytics';
import StructuredData from '@/components/StructuredData';
import { useSearchParams } from 'next/navigation';
import ContributeButton from '@/components/Common/ContributeButton';

/**
 * GIS Coordinate Conversion Tool
 * 
 * Algorithm Declaration:
 * The coordinate conversion algorithms used in this tool are based on publicly available
 * resources from the internet and open source GIS community, including but not limited to:
 * - WGS84 to GCJ-02 conversion: Based on standard algorithms published by China's Bureau of Surveying
 * - GCJ-02 to BD-09 conversion: Based on open source community algorithms
 * - UTM projection conversion: Based on standard map projection mathematical models
 * - Web Mercator conversion: Based on EPSG:3857 standard
 * 
 * These algorithms are industry-standard mathematical models widely used in various GIS applications.
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

// Constants for coordinate conversions
const pi = Math.PI;
const a = 6378245.0; // WGS84 semi-major axis
const ee = 0.00669342162296594323; // WGS84 eccentricity squared

/**
 * GCJ-02 Coordinate Conversion Algorithm
 * 
 * Algorithm Source: Based on publicly available GCJ-02 offset algorithms
 * References:
 * - GCJ-02 coordinate system standards from China's Bureau of Surveying and Mapping
 * - Open source GIS community algorithms
 * - Industry-standard mathematical models widely used in map applications
 * 
 * Description:
 * - GCJ-02 is the coordinate system established by China's National Administration of Surveying
 * - Algorithm implements mutual conversion between WGS84 and GCJ-02
 * - Conversion accuracy meets practical application requirements
 * - Only applies offset processing to coordinates within China's borders
 */

// Helper functions for coordinate transformations
const transformLat = (lng: number, lat: number): number => {
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * pi) + 40.0 * Math.sin(lat / 3.0 * pi)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * pi) + 320 * Math.sin(lat * pi / 30.0)) * 2.0 / 3.0;
  return ret;
};

const transformLng = (lng: number, lat: number): number => {
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * pi) + 40.0 * Math.sin(lng / 3.0 * pi)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * pi) + 300.0 * Math.sin(lng / 30.0 * pi)) * 2.0 / 3.0;
  return ret;
};

const isOutOfChina = (lng: number, lat: number): boolean => {
  return (lng < 72.004 || lng > 137.8347) || (lat < 0.8293 || lat > 55.8271);
};

// Coordinate conversion functions
const wgs84ToGcj02 = (lng: number, lat: number): [number, number] => {
  if (isOutOfChina(lng, lat)) {
    return [lng, lat];
  }
  
  let dlat = transformLat(lng - 105.0, lat - 35.0);
  let dlng = transformLng(lng - 105.0, lat - 35.0);
  
  const radlat = lat / 180.0 * pi;
  let magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  
  dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi);
  dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * pi);
  
  return [lng + dlng, lat + dlat];
};

const gcj02ToWgs84 = (lng: number, lat: number): [number, number] => {
  if (isOutOfChina(lng, lat)) {
    return [lng, lat];
  }
  
  let dlat = transformLat(lng - 105.0, lat - 35.0);
  let dlng = transformLng(lng - 105.0, lat - 35.0);
  
  const radlat = lat / 180.0 * pi;
  let magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  
  dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * pi);
  dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * pi);
  
  return [lng - dlng, lat - dlat];
};

/**
 * BD-09 Coordinate Conversion Algorithm
 * 
 * Algorithm Source: Based on publicly available BD-09 conversion algorithms
 * Description: BD-09 is the coordinate system used by Baidu Maps, with secondary encryption based on GCJ-02
 */
const gcj02ToBd09 = (lng: number, lat: number): [number, number] => {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * pi * 3000.0 / 180.0);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * pi * 3000.0 / 180.0);
  const bd_lng = z * Math.cos(theta) + 0.0065;
  const bd_lat = z * Math.sin(theta) + 0.006;
  return [bd_lng, bd_lat];
};

const bd09ToGcj02 = (lng: number, lat: number): [number, number] => {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * pi * 3000.0 / 180.0);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * pi * 3000.0 / 180.0);
  const gcj_lng = z * Math.cos(theta);
  const gcj_lat = z * Math.sin(theta);
  return [gcj_lng, gcj_lat];
};

const wgs84ToBd09 = (lng: number, lat: number): [number, number] => {
  const [gcj_lng, gcj_lat] = wgs84ToGcj02(lng, lat);
  return gcj02ToBd09(gcj_lng, gcj_lat);
};

const bd09ToWgs84 = (lng: number, lat: number): [number, number] => {
  const [gcj_lng, gcj_lat] = bd09ToGcj02(lng, lat);
  return gcj02ToWgs84(gcj_lng, gcj_lat);
};

// Web Mercator conversions
const wgs84ToWebMercator = (lng: number, lat: number): [number, number] => {
  const x = lng * 20037508.34 / 180;
  let y = Math.log(Math.tan((90 + lat) * pi / 360)) / (pi / 180);
  y = y * 20037508.34 / 180;
  return [x, y];
};

const webMercatorToWgs84 = (x: number, y: number): [number, number] => {
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

  const titleText = t('coordinate-converter.title');
  const subtitleText = t('coordinate-converter.subtitle');

  // Parse single coordinate line based on format
  const parseCoordinates = useCallback((input: string, systemId: string): [number, number] => {
    const trimmed = input.trim();
    
    if (systemId === 'wgs84_dms') {
      // Parse DMS format: 39°54'15.12"N, 116°24'26.64"E
      const parts = trimmed.split(',').map(p => p.trim());
      if (parts.length !== 2) throw new Error('Invalid DMS format');
      
      const lat = dmsToDd(parts[0]);
      const lng = dmsToDd(parts[1]);
      return [lng, lat];
    } else if (systemId === 'utm') {
      // Parse UTM format: 50T 447192.3 4417528.5
      const match = trimmed.match(/(\d+)([A-Z])\s+([\d.]+)\s+([\d.]+)/);
      if (!match) throw new Error('Invalid UTM format');
      
      // For simplicity, convert to approximate WGS84 (this would need proper UTM conversion library)
      const easting = parseFloat(match[3]);
      const northing = parseFloat(match[4]);
      // This is a very rough approximation - real UTM conversion is more complex
      const lng = (easting - 500000) / 111320 + parseInt(match[1]) * 6 - 183;
      const lat = northing / 111320;
      return [lng, lat];
    } else if (systemId === 'web_mercator') {
      // Parse Web Mercator format: 12958528.0, 4849865.0
      const parts = trimmed.split(',').map(p => parseFloat(p.trim()));
      if (parts.length !== 2) throw new Error('Invalid Web Mercator format');
      
      return webMercatorToWgs84(parts[0], parts[1]);
    } else {
      // Parse decimal degrees: 39.9042, 116.4074
      const parts = trimmed.split(',').map(p => parseFloat(p.trim()));
      if (parts.length !== 2) throw new Error('Invalid coordinate format');
      if (isNaN(parts[0]) || isNaN(parts[1])) throw new Error('Invalid numbers');
      
      return [parts[1], parts[0]]; // [lng, lat]
    }
  }, []);

  // Parse multiple coordinates (one per line)
  const parseMultipleCoordinates = useCallback((input: string, systemId: string): Array<{line: number, coords: [number, number], original: string}> => {
    const lines = input.split('\n').filter(line => line.trim() !== '');
    const results = [];
    
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
          // Skip invalid lines but continue processing others
          console.warn(`Line ${i + 1} skipped: ${error}`);
        }
      }
    }
    
    return results;
  }, [parseCoordinates]);

  // Convert coordinates to all supported systems
  const convertCoordinates = useCallback((lng: number, lat: number, fromSystem: string): ConversionResult[] => {
    const results: ConversionResult[] = [];
    
    // First convert to WGS84 if needed
    let wgs84Lng = lng;
    let wgs84Lat = lat;
    
    if (fromSystem === 'gcj02') {
      [wgs84Lng, wgs84Lat] = gcj02ToWgs84(lng, lat);
    } else if (fromSystem === 'bd09') {
      [wgs84Lng, wgs84Lat] = bd09ToWgs84(lng, lat);
    } else if (fromSystem === 'web_mercator') {
      [wgs84Lng, wgs84Lat] = webMercatorToWgs84(lng, lat);
    }
    
    // Generate results for all coordinate systems
    coordinateSystems.forEach(system => {
      try {
        let convertedLng = wgs84Lng;
        let convertedLat = wgs84Lat;
        let formatted = '';
        
        if (system.id === 'wgs84') {
          formatted = `${convertedLat.toFixed(6)}, ${convertedLng.toFixed(6)}`;
        } else if (system.id === 'wgs84_dms') {
          const latDms = ddToDms(convertedLat, true);
          const lngDms = ddToDms(convertedLng, false);
          formatted = `${latDms}, ${lngDms}`;
        } else if (system.id === 'gcj02') {
          [convertedLng, convertedLat] = wgs84ToGcj02(wgs84Lng, wgs84Lat);
          formatted = `${convertedLat.toFixed(6)}, ${convertedLng.toFixed(6)}`;
        } else if (system.id === 'bd09') {
          [convertedLng, convertedLat] = wgs84ToBd09(wgs84Lng, wgs84Lat);
          formatted = `${convertedLat.toFixed(6)}, ${convertedLng.toFixed(6)}`;
        } else if (system.id === 'utm') {
          // Simplified UTM representation
          const zone = Math.floor((wgs84Lng + 180) / 6) + 1;
          const letter = wgs84Lat >= 0 ? 'N' : 'S';
          formatted = `${zone}${letter} ${(wgs84Lng * 111320).toFixed(1)} ${(wgs84Lat * 111320).toFixed(1)}`;
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
          error: error instanceof Error ? error.message : 'Conversion error'
        });
      }
    });
    
    return results;
  }, []);

  // Load data from URL parameters on mount
  useEffect(() => {
    const coords = searchParams.get('coords');
    const system = searchParams.get('system');
    
    if (coords && system) {
      setIsLoadingFromUrl(true);
      setInputCoords(decodeURIComponent(coords));
      setSourceSystem(system);
      
      // Auto-convert after setting values
      setTimeout(() => {
        try {
          const [lng, lat] = parseCoordinates(decodeURIComponent(coords), system);
          if (lng !== undefined && lat !== undefined) {
            const conversionResults = convertCoordinates(lng, lat, system);
            setResults(conversionResults);
          }
        } catch (error) {
          console.error('Error parsing URL parameters:', error);
          setError('Invalid URL parameters');
        }
        setIsLoadingFromUrl(false);
      }, 100);
    }
  }, [searchParams, parseCoordinates, convertCoordinates]);

  // Handle coordinate conversion
  const handleConvert = useCallback(() => {
    if (!inputCoords.trim()) {
      setError(t('coordinate-converter.enterCoordinates'));
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
          const [lng, lat] = parsedCoord.coords;
          
          // Validate coordinate ranges
          if (sourceSystem !== 'utm' && sourceSystem !== 'web_mercator') {
            if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
              batchResults.push({
                line: parsedCoord.line,
                original: parsedCoord.original,
                results: [],
                hasError: true
              });
              continue;
            }
          }
          
          const conversionResults = convertCoordinates(lng, lat, sourceSystem);
          batchResults.push({
            line: parsedCoord.line,
            original: parsedCoord.original,
            results: conversionResults,
            hasError: false
          });
        }
        
        setBatchResults(batchResults);
        
        // Track batch conversion event
        event('coordinate_batch_convert', 'Tool Usage', 'Coordinate Batch Convert', parsedCoords.length);
      } else {
        // Single coordinate processing
        const [lng, lat] = parseCoordinates(inputCoords, sourceSystem);
        
        // Validate coordinate ranges
        if (sourceSystem !== 'utm' && sourceSystem !== 'web_mercator') {
          if (Math.abs(lat) > 90) throw new Error('Latitude must be between -90 and 90');
          if (Math.abs(lng) > 180) throw new Error('Longitude must be between -180 and 180');
        }
        
        const conversionResults = convertCoordinates(lng, lat, sourceSystem);
        setResults(conversionResults);
        
        // Track conversion event
        event('coordinate_convert', 'Tool Usage', 'Coordinate Convert', inputCoords.length);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid coordinate format');
      setResults([]);
      setBatchResults([]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputCoords, sourceSystem, parseCoordinates, parseMultipleCoordinates, convertCoordinates, t]);

  // Load example coordinates
  const loadExample = () => {
    const system = coordinateSystems.find(s => s.id === sourceSystem);
    if (system) {
      setInputCoords(system.example);
      setError('');
    }
  };

  // Copy result to clipboard
  const copyResult = (text: string, systemId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(systemId);
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
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
  };

  // Copy result link to clipboard
  const shareResults = async () => {
    if (results.length === 0 && batchResults.length === 0) return;

    // Update URL with current parameters first
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams({
      coords: encodeURIComponent(inputCoords),
      system: sourceSystem
    });
    const shareUrl = `${baseUrl}?${params.toString()}`;

    // Update browser URL without reload
    window.history.replaceState({}, '', shareUrl);

    try {
      // Copy URL to clipboard
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error('Copy link failed:', error);
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
        results: batchResults.map(batch => ({
          line: batch.line,
          original: batch.original,
          hasError: batch.hasError,
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
  };

  // Export results as CSV
  const exportAsCSV = () => {
    if (results.length === 0 && batchResults.length === 0) return;

    let headers: string[];
    let rows: string[][];
    
    if (batchResults.length > 0) {
      // Batch CSV export
      headers = ['Line', 'Original', 'System', 'System Name', 'Coordinates'];
      rows = [];
      
      batchResults.forEach(batch => {
        if (!batch.hasError) {
          batch.results.filter(r => r.valid).forEach(result => {
            rows.push([
              batch.line.toString(),
              batch.original,
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
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coordinate-conversion-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col" itemScope itemType="https://schema.org/WebApplication">
      <StructuredData 
        type="tool" 
        toolName="GIS Coordinate Converter"
        toolDescription="Convert coordinates between different geographic coordinate systems including WGS84, GCJ-02, BD-09, UTM, and Web Mercator"
        url="https://tools.mofei.life/coordinate-converter"
      />
      <main className="flex-1 pt-20 2xl:pt-22">
        <div className='max-w-[2000px] mx-auto'>
          <div className='overflow-hidden font-extrabold px-5 md:px-10 lg:px-16'>
            {/* Breadcrumb */}
            <motion.div 
              className="mt-8 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link 
                href={language === 'en' ? '/' : '/zh'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-[#a1c4fd]/50 rounded-lg text-gray-300 hover:text-[#a1c4fd] transition-all duration-200 backdrop-blur-sm text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                {t('coordinate-converter.backToTools')}
              </Link>
            </motion.div>

            <motion.h1 
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] leading-tight text-center text-2xl mb-4 md:text-4xl md:mb-6 lg:text-5xl lg:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              itemProp="name"
            >
              {titleText}
            </motion.h1>
            
            <motion.p 
              className="text-gray-300/90 text-base md:text-lg lg:text-xl font-medium leading-relaxed tracking-wide text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              itemProp="description"
            >
              {subtitleText}
            </motion.p>
            
            <motion.div
              className="flex justify-center pb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <ContributeButton variant="ghost" size="sm" />
            </motion.div>
          </div>
        </div>

        <div className='max-w-[2000px] mx-auto px-5 md:px-10 lg:px-16 py-6 md:py-8 lg:py-12'>
          <motion.div 
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* URL Loading Indicator */}
            {isLoadingFromUrl && (
              <motion.div
                className="mb-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-blue-400 text-sm">{t('coordinate-converter.loadingFromUrl')}</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Input Section */}
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h2 className="text-white text-lg font-semibold mb-4">{t('coordinate-converter.inputCoordinates')}</h2>
                  
                  {/* Source System Selection */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('coordinate-converter.sourceSystem')}
                    </label>
                    <select
                      value={sourceSystem}
                      onChange={(e) => setSourceSystem(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#a1c4fd] focus:border-transparent"
                    >
                      {coordinateSystems.map(system => (
                        <option key={system.id} value={system.id}>
                          {language === 'zh' ? system.nameZh : system.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Coordinate Input */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      {t('coordinate-converter.coordinates')}
                    </label>
                    <div className="relative">
                      <textarea
                        value={inputCoords}
                        onChange={(e) => setInputCoords(e.target.value)}
                        placeholder={`${coordinateSystems.find(s => s.id === sourceSystem)?.example}\n${language === 'zh' ? '支持多行批量转换，每行一个坐标' : 'Supports multi-line batch conversion, one coordinate per line'}`}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#a1c4fd] focus:border-transparent resize-none"
                        rows={4}
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      {t('coordinate-converter.example')}: {coordinateSystems.find(s => s.id === sourceSystem)?.example}
                      <br />
                      {language === 'zh' ? '💡 支持批量转换：每行输入一个坐标' : '💡 Supports batch conversion: one coordinate per line'}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleConvert}
                      disabled={isProcessing || isLoadingFromUrl || !inputCoords.trim()}
                      className="px-4 py-2 bg-[#a1c4fd] hover:bg-[#8fb3f9] disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg transition-colors duration-200"
                    >
                      {isProcessing || isLoadingFromUrl ? t('coordinate-converter.converting') : t('coordinate-converter.convert')}
                    </button>
                    <button
                      onClick={loadExample}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      {t('coordinate-converter.loadExample')}
                    </button>
                    <button
                      onClick={handleClear}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                      {t('coordinate-converter.clear')}
                    </button>
                  </div>
                </div>

                {/* Usage Instructions */}
                <motion.div 
                  className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <h2 className="text-white font-medium mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#a1c4fd]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {t('coordinate-converter.usageTitle')}
                  </h2>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• <strong>WGS84:</strong> {t('coordinate-converter.usage1')}</li>
                    <li>• <strong>GCJ-02:</strong> {t('coordinate-converter.usage2')}</li>
                    <li>• <strong>BD-09:</strong> {t('coordinate-converter.usage3')}</li>
                    <li>• <strong>UTM:</strong> {t('coordinate-converter.usage4')}</li>
                    <li>• <strong>Web Mercator:</strong> {t('coordinate-converter.usage5')}</li>
                    <li>• <strong>{language === 'zh' ? '批量转换' : 'Batch Conversion'}:</strong> {language === 'zh' ? '支持多行输入，每行一个坐标进行批量转换' : 'Supports multi-line input, one coordinate per line for batch conversion'}</li>
                  </ul>
                </motion.div>
              </div>

              {/* Right Column - Results Section */}
              <div className="space-y-6">
                {/* Error Message */}
                {error && (
                  <motion.div
                    className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Single Results */}
                {results.length > 0 ? (
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-white text-lg font-semibold">{t('coordinate-converter.results')}</h2>
                      
                      {/* Share and Export Options */}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            onClick={shareResults}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                            </svg>
                            {shareSuccess ? t('coordinate-converter.shared') : t('coordinate-converter.share')}
                          </button>
                        </div>
                        
                        <div className="relative group">
                          <button
                            className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            {t('coordinate-converter.export')}
                          </button>
                          
                          {/* Export Dropdown */}
                          <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={exportAsJSON}
                              className="w-full px-3 py-2 text-xs text-white hover:bg-gray-700 rounded-t-lg transition-colors duration-200 text-left"
                            >
                              {t('coordinate-converter.exportJSON')}
                            </button>
                            <button
                              onClick={exportAsCSV}
                              className="w-full px-3 py-2 text-xs text-white hover:bg-gray-700 rounded-b-lg transition-colors duration-200 text-left"
                            >
                              {t('coordinate-converter.exportCSV')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {results.map((result, index) => (
                        <div key={index} className="border border-gray-600 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white font-medium text-sm">
                              {language === 'zh' ? result.system.nameZh : result.system.name}
                            </h3>
                            {result.valid && (
                              <button
                                onClick={() => copyResult(result.formatted, result.system.id)}
                                className="px-2 py-1 text-xs bg-[#a1c4fd] hover:bg-[#8fb3f9] text-gray-900 rounded transition-colors duration-200"
                              >
                                {copySuccess === result.system.id ? t('coordinate-converter.copied') : t('coordinate-converter.copy')}
                              </button>
                            )}
                          </div>
                          
                          {result.valid ? (
                            <div className="bg-gray-900/50 rounded p-2 font-mono text-green-400 text-sm">
                              {result.formatted}
                            </div>
                          ) : (
                            <div className="bg-red-900/20 rounded p-2 text-red-400 text-sm">
                              {result.error || 'Conversion failed'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : batchResults.length > 0 ? (
                  <motion.div
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-white text-lg font-semibold">
                        {t('coordinate-converter.results')} ({batchResults.length} {language === 'zh' ? '行' : 'lines'})
                      </h2>
                      
                      {/* Share and Export Options */}
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <button
                            onClick={shareResults}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                            </svg>
                            {shareSuccess ? t('coordinate-converter.shared') : t('coordinate-converter.share')}
                          </button>
                        </div>
                        
                        <div className="relative group">
                          <button
                            className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                              <polyline points="14,2 14,8 20,8"/>
                              <line x1="16" y1="13" x2="8" y2="13"/>
                              <line x1="16" y1="17" x2="8" y2="17"/>
                              <polyline points="10,9 9,9 8,9"/>
                            </svg>
                            {t('coordinate-converter.export')}
                          </button>
                          
                          {/* Export Dropdown */}
                          <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <button
                              onClick={exportAsJSON}
                              className="w-full px-3 py-2 text-xs text-white hover:bg-gray-700 rounded-t-lg transition-colors duration-200 text-left"
                            >
                              {t('coordinate-converter.exportJSON')}
                            </button>
                            <button
                              onClick={exportAsCSV}
                              className="w-full px-3 py-2 text-xs text-white hover:bg-gray-700 rounded-b-lg transition-colors duration-200 text-left"
                            >
                              {t('coordinate-converter.exportCSV')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {coordinateSystems.map(system => (
                        <div key={system.id} className="border border-gray-600 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-medium text-sm">
                              {language === 'zh' ? system.nameZh : system.name}
                            </h3>
                            <button
                              onClick={() => {
                                const allCoords = batchResults
                                  .filter(batch => !batch.hasError)
                                  .map(batch => {
                                    const result = batch.results.find(r => r.system.id === system.id);
                                    return result?.formatted || '';
                                  })
                                  .filter(coord => coord !== '')
                                  .join('\n');
                                copyResult(allCoords, system.id);
                              }}
                              className="px-2 py-1 text-xs bg-[#a1c4fd] hover:bg-[#8fb3f9] text-gray-900 rounded transition-colors duration-200"
                            >
                              {copySuccess === system.id ? t('coordinate-converter.copied') : t('coordinate-converter.copy')}
                            </button>
                          </div>
                          
                          <div className="bg-gray-900/50 rounded p-3">
                            <pre className="font-mono text-green-400 text-sm whitespace-pre-wrap">
                              {batchResults
                                .filter(batch => !batch.hasError)
                                .map(batch => {
                                  const result = batch.results.find(r => r.system.id === system.id);
                                  return result?.formatted || '';
                                })
                                .filter(coord => coord !== '')
                                .join('\n')}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-6 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                    <h3 className="text-white font-medium mb-2">{t('coordinate-converter.results')}</h3>
                    <p className="text-gray-400 text-sm">
                      {t('coordinate-converter.enterCoordinates')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer>
        <Foot />
      </footer>
    </div>
  );
}

export default function CoordinateConverterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CoordinateConverterPageContent />
    </Suspense>
  );
}