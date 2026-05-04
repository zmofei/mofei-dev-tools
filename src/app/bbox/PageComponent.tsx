"use client"
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import {
  GlassPanel,
  StatusToast,
} from '@mofei-dev/ui';
import ResizableTextarea from '@/components/Common/ResizableTextarea';
import { event } from '@/components/GoogleAnalytics';
import { useSearchParams } from 'next/navigation';
import { toolPath } from '@/lib/site';
import { bboxPath, bboxText, type BBoxLanguage } from '@/lib/bbox-i18n';

interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

interface MapboxEvent {
  lngLat: {
    lng: number;
    lat: number;
  };
  originalEvent: MouseEvent;
  preventDefault: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MapboxMap = any;

type MapboxPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

const PANEL_WIDTH = 420;
const PANEL_GAP = 12;
const MINI_NAV_HEIGHT = 44;
const TOOL_USAGE_CATEGORY = 'Tool Usage';

const trackBBoxEvent = (action: string, label: string, value?: number) => {
  event(`bbox_${action}`, TOOL_USAGE_CATEGORY, label, value);
};

function bboxAreaKm2(bbox: BoundingBox) {
  const centerLat = (bbox.minLat + bbox.maxLat) / 2;
  const earthRadiusKm = 6371;
  const toRad = (deg: number) => deg * Math.PI / 180;
  const width = earthRadiusKm * toRad(bbox.maxLng - bbox.minLng) * Math.cos(toRad(centerLat));
  const height = earthRadiusKm * toRad(bbox.maxLat - bbox.minLat);

  return Math.round(Math.abs(width * height));
}

function getMapPadding(extra = 0, isPanelCollapsed = false): MapboxPadding {
  if (typeof window === 'undefined' || window.innerWidth < 1024) {
    return { top: MINI_NAV_HEIGHT + extra, right: extra, bottom: extra, left: extra };
  }

  return {
    top: MINI_NAV_HEIGHT + extra,
    right: isPanelCollapsed ? extra : PANEL_WIDTH + PANEL_GAP + extra,
    bottom: extra,
    left: extra,
  };
}

function formatBboxParam(bbox: BoundingBox) {
  return `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`;
}

function syncDrawnBboxToUrl(bbox: BoundingBox) {
  const url = new URL(window.location.href);
  url.searchParams.set('bbox', formatBboxParam(bbox));
  url.searchParams.set('type', 'drawn');
  url.searchParams.delete('input');
  window.history.replaceState({}, '', url.toString());
  window.dispatchEvent(new Event('bbox-url-change'));
}

interface GeoJSONData {
  type: string;
  features: Array<{
    type: string;
    properties: Record<string, unknown>;
    geometry: {
      type: string;
      coordinates: number[][][];
    };
  }>;
}

interface GeoJSONSource {
  type: string;
  setData: (data: GeoJSONData) => void;
}



function BBoxDrawingToolContent({ language }: { language: BBoxLanguage }) {
  const searchParams = useSearchParams();
  const text = (key: Parameters<typeof bboxText>[1]) => bboxText(language, key);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapboxMap>(null);
  const lastPreviewTrackKeyRef = useRef<string>('');
  const skipNextUrlFitRef = useRef(false);
  const hasLoadedUrlParamsRef = useRef(false);
  const locallySyncedBboxParamRef = useRef<string | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [viewportBbox, setViewportBbox] = useState<BoundingBox | null>(null);
  const [customBbox, setCustomBbox] = useState<BoundingBox | null>(null);
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
  const [viewportCenterPoint, setViewportCenterPoint] = useState<{lat: number, lng: number} | null>(null);
  const [viewportDimensions, setViewportDimensions] = useState<{width: number, height: number} | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(1);
  const [customCenterPoint, setCustomCenterPoint] = useState<{lat: number, lng: number} | null>(null);
  const [customDimensions, setCustomDimensions] = useState<{width: number, height: number} | null>(null);
  const [customBboxSource, setCustomBboxSource] = useState<'drawn' | 'url' | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [previewInput, setPreviewInput] = useState<string>('');
  const [previewBbox, setPreviewBbox] = useState<BoundingBox | null>(null);
  const [previewError, setPreviewError] = useState<string>('');
  const [previewCenterPoint, setPreviewCenterPoint] = useState<{lat: number, lng: number} | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState<{width: number, height: number} | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isDrawHintVisible, setIsDrawHintVisible] = useState(true);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load Mapbox and initialize map
  useEffect(() => {
    if (!mapboxToken) {
      console.warn('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not configured.');
      return;
    }

    const loadMapbox = async () => {
      try {
        // Dynamically import Mapbox GL JS
        const mapboxgl = (await import('mapbox-gl')).default;
        
        // Load Mapbox CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
        document.head.appendChild(link);

        // Set access token
        mapboxgl.accessToken = mapboxToken;

        // Initialize map
        if (mapContainerRef.current && !mapInstanceRef.current) {
          const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            zoom: 1,
            projection: 'mercator',
            hash: true,
            boxZoom: false
          });

          // Function to update viewport bbox
          const updateViewportBbox = () => {
            const bounds = map.getBounds();
            if (!bounds) return;
            
            const newViewportBbox = {
              minLng: bounds.getWest(),
              minLat: bounds.getSouth(),
              maxLng: bounds.getEast(),
              maxLat: bounds.getNorth()
            };
            
            setViewportBbox(newViewportBbox);
            calculateViewportMetrics(newViewportBbox);
            setMapZoom(map.getZoom());
          };

          // Wait for map to load
          map.on('load', () => {
            setIsMapLoaded(true);
            
            // Update bbox info when map view changes
            updateViewportBbox();

            // Listen for map move events to update viewport bbox
            map.on('moveend', updateViewportBbox);
            map.on('zoomend', updateViewportBbox);


            // Store map instance for later use
            mapInstanceRef.current = map;

            // Add rectangle drawing functionality
            let isDrawing = false;
            let startPoint: [number, number] | null = null;
            let currentBbox: BoundingBox | null = null;

            // Add rectangle source and layer
            map.addSource('rectangle', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: []
              }
            });

            map.addLayer({
              id: 'rectangle-fill',
              type: 'fill',
              source: 'rectangle',
              paint: {
                'fill-color': '#3388ff',
                'fill-opacity': 0.2
              }
            });

            map.addLayer({
              id: 'rectangle-stroke',
              type: 'line',
              source: 'rectangle',
              paint: {
                'line-color': '#e74c3c',
                'line-width': 3
              }
            });

            // Mouse event handlers - only for desktop
            map.on('mousedown', (e: MapboxEvent) => {
              // Only allow drawing on desktop (non-mobile) with Shift key
              if (!isDrawing && e.originalEvent.shiftKey && !isMobile) {
                isDrawing = true;
                startPoint = [e.lngLat.lng, e.lngLat.lat];
                map.getCanvas().style.cursor = 'crosshair';
                e.preventDefault();
              }
            });

            map.on('mousemove', (e: MapboxEvent) => {
              if (isDrawing && startPoint) {
                const currentPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
                updateRectangle(startPoint, currentPoint);
              }
            });

            map.on('mouseup', (e: MapboxEvent) => {
              if (isDrawing && startPoint) {
                isDrawing = false;
                const endPoint: [number, number] = [e.lngLat.lng, e.lngLat.lat];
                updateRectangle(startPoint, endPoint);
                map.getCanvas().style.cursor = '';
                
                // Calculate and set bbox
                const newBbox = {
                  minLng: Math.min(startPoint[0], endPoint[0]),
                  maxLng: Math.max(startPoint[0], endPoint[0]),
                  minLat: Math.min(startPoint[1], endPoint[1]),
                  maxLat: Math.max(startPoint[1], endPoint[1])
                };
                
                setCustomBbox(newBbox);
                calculateCustomMetrics(newBbox);
                setCustomBboxSource('drawn');
                currentBbox = newBbox;
                setIsDrawHintVisible(false);
                skipNextUrlFitRef.current = true;
                locallySyncedBboxParamRef.current = formatBboxParam(newBbox);
                syncDrawnBboxToUrl(newBbox);
                
                // Drawing mode is desktop only, no need to turn off
                
                trackBBoxEvent('drawn', `source:mapbox|area_km2:${bboxAreaKm2(newBbox)}`, bboxAreaKm2(newBbox));
              }
            });

            // Touch event handlers for mobile - disabled for drawing
            // Drawing functionality is only available on desktop

            // Handle escape key
            document.addEventListener('keydown', (e: KeyboardEvent) => {
              if (e.key === 'Escape' && isDrawing) {
                isDrawing = false;
                startPoint = null;
                map.getCanvas().style.cursor = '';
                // Clear temporary rectangle
                const source = map.getSource('rectangle');
                if (source && source.type === 'geojson') {
                  (source as GeoJSONSource).setData({
                    type: 'FeatureCollection',
                    features: currentBbox ? [createRectangleFeature(currentBbox)] : []
                  });
                }
              }
            });

            function updateRectangle(start: [number, number], end: [number, number]) {
              const bbox = {
                minLng: Math.min(start[0], end[0]),
                maxLng: Math.max(start[0], end[0]),
                minLat: Math.min(start[1], end[1]),
                maxLat: Math.max(start[1], end[1])
              };

              const feature = createRectangleFeature(bbox);
              const source = map.getSource('rectangle');
              if (source && source.type === 'geojson') {
                (source as GeoJSONSource).setData({
                  type: 'FeatureCollection',
                  features: [feature]
                });
              }
            }

            function createRectangleFeature(bbox: BoundingBox) {
              return {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [bbox.minLng, bbox.minLat],
                    [bbox.maxLng, bbox.minLat],
                    [bbox.maxLng, bbox.maxLat],
                    [bbox.minLng, bbox.maxLat],
                    [bbox.minLng, bbox.minLat]
                  ]]
                }
              };
            }

            // Clear rectangle function
            window.clearMapboxRectangle = () => {
              const source = map.getSource('rectangle');
              if (source && source.type === 'geojson') {
                (source as GeoJSONSource).setData({
                  type: 'FeatureCollection',
                  features: []
                });
              }
              currentBbox = null;
              setCustomBbox(null);
              setCustomCenterPoint(null);
              setCustomDimensions(null);
            };
          });

          mapInstanceRef.current = map;
        }
      } catch (error) {
        console.error('Error loading Mapbox:', error);
      }
    };

    loadMapbox();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMobile, mapboxToken]);

  // Drawing mode is disabled on mobile, so no need to manage map interactions

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const applyMapPadding = () => {
      mapInstanceRef.current?.setPadding(getMapPadding(0, isPanelCollapsed));
    };

    applyMapPadding();
    window.addEventListener('resize', applyMapPadding);

    return () => window.removeEventListener('resize', applyMapPadding);
  }, [isMapLoaded, isPanelCollapsed]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const resizeTimer = window.setTimeout(() => {
      mapInstanceRef.current?.resize();
    }, 0);

    return () => window.clearTimeout(resizeTimer);
  }, [isMapLoaded, isPreviewExpanded, customBbox, previewBbox]);

  // Calculate center point and dimensions for viewport
  const calculateViewportMetrics = (bbox: BoundingBox) => {
    const centerLat = (bbox.minLat + bbox.maxLat) / 2;
    const centerLng = (bbox.minLng + bbox.maxLng) / 2;
    
    // Calculate approximate dimensions in kilometers
    const R = 6371; // Earth's radius in km
    const toRad = (deg: number) => deg * Math.PI / 180;
    
    // Width (longitude difference)
    const dLng = toRad(bbox.maxLng - bbox.minLng);
    const avgLat = toRad(centerLat);
    const width = R * dLng * Math.cos(avgLat);
    
    // Height (latitude difference)
    const dLat = toRad(bbox.maxLat - bbox.minLat);
    const height = R * dLat;
    
    setViewportCenterPoint({ lat: centerLat, lng: centerLng });
    setViewportDimensions({ width: Math.abs(width), height: Math.abs(height) });
  };

  // Calculate center point and dimensions for custom bbox
  const calculateCustomMetrics = (bbox: BoundingBox) => {
    const centerLat = (bbox.minLat + bbox.maxLat) / 2;
    const centerLng = (bbox.minLng + bbox.maxLng) / 2;
    
    // Calculate approximate dimensions in kilometers
    const R = 6371; // Earth's radius in km
    const toRad = (deg: number) => deg * Math.PI / 180;
    
    // Width (longitude difference)
    const dLng = toRad(bbox.maxLng - bbox.minLng);
    const avgLat = toRad(centerLat);
    const width = R * dLng * Math.cos(avgLat);
    
    // Height (latitude difference)
    const dLat = toRad(bbox.maxLat - bbox.minLat);
    const height = R * dLat;
    
    setCustomCenterPoint({ lat: centerLat, lng: centerLng });
    setCustomDimensions({ width: Math.abs(width), height: Math.abs(height) });
  };

  // Calculate center point and dimensions for preview bbox
  const calculatePreviewMetrics = (bbox: BoundingBox) => {
    const centerLat = (bbox.minLat + bbox.maxLat) / 2;
    const centerLng = (bbox.minLng + bbox.maxLng) / 2;
    
    // Calculate approximate dimensions in kilometers
    const R = 6371; // Earth's radius in km
    const toRad = (deg: number) => deg * Math.PI / 180;
    
    // Width (longitude difference)
    const dLng = toRad(bbox.maxLng - bbox.minLng);
    const avgLat = toRad(centerLat);
    const width = R * dLng * Math.cos(avgLat);
    
    // Height (latitude difference)
    const dLat = toRad(bbox.maxLat - bbox.minLat);
    const height = R * dLat;
    
    setPreviewCenterPoint({ lat: centerLat, lng: centerLng });
    setPreviewDimensions({ width: Math.abs(width), height: Math.abs(height) });
  };

  // Parse input and extract bbox
  const parsePreviewInput = (input: string): BoundingBox | null => {
    try {
      // Remove extra whitespace
      const cleanInput = input.trim();
      
      // Try to parse as JSON first (could be GeoJSON or array)
      try {
        const parsed = JSON.parse(cleanInput);
        
        // Check if it's a GeoJSON with bbox property
        if (parsed && typeof parsed === 'object' && parsed.bbox && Array.isArray(parsed.bbox)) {
          const bbox = parsed.bbox;
          if (bbox.length >= 4) {
            return {
              minLng: Number(bbox[0]),
              minLat: Number(bbox[1]),
              maxLng: Number(bbox[2]),
              maxLat: Number(bbox[3])
            };
          }
        }
        
        // Check if it's a GeoJSON Feature with Polygon geometry
        if (parsed && parsed.type === 'Feature' && parsed.geometry && parsed.geometry.type === 'Polygon') {
          const coords = parsed.geometry.coordinates[0];
          if (coords && coords.length >= 4) {
            const lngs = coords.map((coord: number[]) => coord[0]);
            const lats = coords.map((coord: number[]) => coord[1]);
            return {
              minLng: Math.min(...lngs),
              minLat: Math.min(...lats),
              maxLng: Math.max(...lngs),
              maxLat: Math.max(...lats)
            };
          }
        }
        
        // Check if it's a direct array [minLng, minLat, maxLng, maxLat]
        if (Array.isArray(parsed) && parsed.length >= 4) {
          return {
            minLng: Number(parsed[0]),
            minLat: Number(parsed[1]),
            maxLng: Number(parsed[2]),
            maxLat: Number(parsed[3])
          };
        }
      } catch {
        // Not valid JSON, try other formats
      }
      
      // Try to parse as comma-separated values
      const values = cleanInput.split(',').map(v => v.trim()).filter(v => v !== '');
      if (values.length >= 4) {
        const numbers = values.slice(0, 4).map(Number);
        if (numbers.every(n => !isNaN(n))) {
          return {
            minLng: numbers[0],
            minLat: numbers[1],
            maxLng: numbers[2],
            maxLat: numbers[3]
          };
        }
      }
      
      // Try to parse as space-separated values
      const spaceValues = cleanInput.split(/\s+/).filter(v => v !== '');
      if (spaceValues.length >= 4) {
        const numbers = spaceValues.slice(0, 4).map(Number);
        if (numbers.every(n => !isNaN(n))) {
          return {
            minLng: numbers[0],
            minLat: numbers[1],
            maxLng: numbers[2],
            maxLat: numbers[3]
          };
        }
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Handle preview input change
  const handlePreviewInputChange = (value: string) => {
    setPreviewInput(value);
    setPreviewError('');
    
    if (!value.trim()) {
      setPreviewBbox(null);
      setPreviewCenterPoint(null);
      setPreviewDimensions(null);
      if (lastPreviewTrackKeyRef.current) {
        trackBBoxEvent('preview_input_cleared', 'source:preview_input', previewInput.length);
      }
      lastPreviewTrackKeyRef.current = '';
      // Clear preview layer on map
      if (mapInstanceRef.current && mapInstanceRef.current.getSource('preview')) {
        const source = mapInstanceRef.current.getSource('preview');
        if (source && source.type === 'geojson') {
          (source as GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: []
          });
        }
      }
      return;
    }
    
    const bbox = parsePreviewInput(value);
    if (bbox) {
      // Validate bbox values
      if (bbox.minLng >= bbox.maxLng || bbox.minLat >= bbox.maxLat) {
        setPreviewError(text('invalidBbox'));
        const trackKey = `invalid-shape:${value}`;
        if (lastPreviewTrackKeyRef.current !== trackKey) {
          trackBBoxEvent('preview_error', 'reason:invalid_bbox|source:preview_input', value.length);
          lastPreviewTrackKeyRef.current = trackKey;
        }
        return;
      }
      
      if (Math.abs(bbox.minLng) > 180 || Math.abs(bbox.maxLng) > 180 || Math.abs(bbox.minLat) > 90 || Math.abs(bbox.maxLat) > 90) {
        setPreviewError(text('invalidCoordinates'));
        const trackKey = `invalid-range:${value}`;
        if (lastPreviewTrackKeyRef.current !== trackKey) {
          trackBBoxEvent('preview_error', 'reason:invalid_coordinates|source:preview_input', value.length);
          lastPreviewTrackKeyRef.current = trackKey;
        }
        return;
      }
      
      setPreviewBbox(bbox);
      calculatePreviewMetrics(bbox);
      setIsPreviewExpanded(true); // Auto-expand when preview is successful
      
      // Add preview to map
      if (mapInstanceRef.current) {
        // Add preview source if not exists
        if (!mapInstanceRef.current.getSource('preview')) {
          mapInstanceRef.current.addSource('preview', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            }
          });
          
          mapInstanceRef.current.addLayer({
            id: 'preview-fill',
            type: 'fill',
            source: 'preview',
            paint: {
              'fill-color': '#9333ea',
              'fill-opacity': 0.2
            }
          });
          
          mapInstanceRef.current.addLayer({
            id: 'preview-stroke',
            type: 'line',
            source: 'preview',
            paint: {
              'line-color': '#9333ea',
              'line-width': 3,
              'line-dasharray': [2, 2]
            }
          });
        }
        
        // Update preview layer
        const feature = {
          type: 'Feature',
          properties: { type: 'preview' },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [bbox.minLng, bbox.minLat],
              [bbox.maxLng, bbox.minLat],
              [bbox.maxLng, bbox.maxLat],
              [bbox.minLng, bbox.maxLat],
              [bbox.minLng, bbox.minLat]
            ]]
          }
        };
        
        const source = mapInstanceRef.current.getSource('preview');
        if (source && source.type === 'geojson') {
          (source as GeoJSONSource).setData({
            type: 'FeatureCollection',
            features: [feature]
          });
        }
        
        // Fit map to preview bbox
        mapInstanceRef.current.fitBounds([
          [bbox.minLng, bbox.minLat],
          [bbox.maxLng, bbox.maxLat]
        ], { padding: getMapPadding(100, isPanelCollapsed) });
      }

      const trackKey = `valid:${formatBboxParam(bbox)}:${value.length}`;
      if (lastPreviewTrackKeyRef.current !== trackKey) {
        trackBBoxEvent('preview_input_loaded', `source:preview_input|area_km2:${bboxAreaKm2(bbox)}`, bboxAreaKm2(bbox));
        lastPreviewTrackKeyRef.current = trackKey;
      }
    } else {
      setPreviewError(text('parseError'));
      const trackKey = `parse-error:${value}`;
      if (lastPreviewTrackKeyRef.current !== trackKey) {
        trackBBoxEvent('preview_error', 'reason:parse_error|source:preview_input', value.length);
        lastPreviewTrackKeyRef.current = trackKey;
      }
    }
  };

  // Load data from URL parameters
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;
    if (hasLoadedUrlParamsRef.current) return;
    
    const bboxParam = searchParams.get('bbox');
    const typeParam = searchParams.get('type');
    const inputParam = searchParams.get('input');
    const centerParam = searchParams.get('center');
    const zoomParam = searchParams.get('zoom');
    
    setIsLoadingFromUrl(true);
    
    try {
      // Handle bbox parameter
      const shouldSkipLocalFit =
        skipNextUrlFitRef.current ||
        (typeParam === 'drawn' && bboxParam === locallySyncedBboxParamRef.current);

      if (bboxParam && !shouldSkipLocalFit) {
        const coords = bboxParam.split(',').map(Number);
        if (coords.length === 4) {
          const [minLng, minLat, maxLng, maxLat] = coords;
          if (
            coords.some(coord => !Number.isFinite(coord)) ||
            minLng >= maxLng ||
            minLat >= maxLat ||
            Math.abs(minLng) > 180 ||
            Math.abs(maxLng) > 180 ||
            Math.abs(minLat) > 90 ||
            Math.abs(maxLat) > 90
          ) {
            throw new Error('Invalid bbox URL parameter');
          }
          const newBbox = { minLng, minLat, maxLng, maxLat };
          
          // Check if it's a preview type or drawn type
          if (typeParam === 'preview' && inputParam) {
            // Restore preview state
            setPreviewInput(inputParam);
            setPreviewBbox(newBbox);
            calculatePreviewMetrics(newBbox);
            setIsPreviewExpanded(true); // Auto-expand when loading from URL
            trackBBoxEvent('url_preview_loaded', `type:preview|area_km2:${bboxAreaKm2(newBbox)}`, bboxAreaKm2(newBbox));
            
            // Add preview to map
            if (!mapInstanceRef.current.getSource('preview')) {
              mapInstanceRef.current.addSource('preview', {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: []
                }
              });
              
              mapInstanceRef.current.addLayer({
                id: 'preview-fill',
                type: 'fill',
                source: 'preview',
                paint: {
                  'fill-color': '#9333ea',
                  'fill-opacity': 0.2
                }
              });
              
              mapInstanceRef.current.addLayer({
                id: 'preview-stroke',
                type: 'line',
                source: 'preview',
                paint: {
                  'line-color': '#9333ea',
                  'line-width': 3,
                  'line-dasharray': [2, 2]
                }
              });
            }
            
            const previewFeature = {
              type: 'Feature',
              properties: { type: 'preview' },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [minLng, minLat],
                  [maxLng, minLat],
                  [maxLng, maxLat],
                  [minLng, maxLat],
                  [minLng, minLat]
                ]]
              }
            };
            
            const previewSource = mapInstanceRef.current.getSource('preview');
            if (previewSource && previewSource.type === 'geojson') {
              (previewSource as GeoJSONSource).setData({
                type: 'FeatureCollection',
                features: [previewFeature]
              });
            }
          } else {
            // Default to drawn bbox
            setCustomBbox(newBbox);
            calculateCustomMetrics(newBbox);
            setCustomBboxSource('url');
            trackBBoxEvent('url_drawn_loaded', `type:${typeParam || 'drawn'}|area_km2:${bboxAreaKm2(newBbox)}`, bboxAreaKm2(newBbox));
            
            // Add rectangle to map
            const source = mapInstanceRef.current.getSource('rectangle');
            if (source && source.type === 'geojson') {
              const feature = {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [[
                    [minLng, minLat],
                    [maxLng, minLat],
                    [maxLng, maxLat],
                    [minLng, maxLat],
                    [minLng, minLat]
                  ]]
                }
              };
              
              source.setData({
                type: 'FeatureCollection',
                features: [feature]
              });
            }
          }
        } else {
          throw new Error('Invalid bbox URL parameter');
        }
      }
      
      // Handle map center and zoom parameters
      if (centerParam && zoomParam) {
        const centerCoords = centerParam.split(',').map(Number);
        const zoom = Number(zoomParam);
        if (centerCoords.length === 2 && !isNaN(zoom)) {
          mapInstanceRef.current.setCenter([centerCoords[0], centerCoords[1]]);
          mapInstanceRef.current.setZoom(zoom);
          trackBBoxEvent('url_viewport_loaded', `has_bbox:${Boolean(bboxParam)}|zoom:${zoom.toFixed(2)}`, Math.round(zoom));
        }
      }
      
      // Auto-center and zoom to bbox if bbox parameter exists
      if (bboxParam && !shouldSkipLocalFit) {
        const coords = bboxParam.split(',').map(Number);
        if (coords.length === 4) {
          const [minLng, minLat, maxLng, maxLat] = coords;
          
          // Use setTimeout to ensure map is fully loaded before fitting bounds
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.fitBounds([
                [minLng, minLat],
                [maxLng, maxLat]
              ], { 
                padding: getMapPadding(50, isPanelCollapsed),
                duration: 1000 // Smooth animation
              });
            }
          }, 100);
        }
      }

      hasLoadedUrlParamsRef.current = true;
      skipNextUrlFitRef.current = false;
    } catch (error) {
      console.error('Error loading parameters from URL:', error);
      trackBBoxEvent('url_load_error', `type:${typeParam || 'none'}|has_bbox:${Boolean(bboxParam)}`, bboxParam?.length || 0);
      hasLoadedUrlParamsRef.current = true;
      skipNextUrlFitRef.current = false;
    }
    
    setIsLoadingFromUrl(false);
  }, [searchParams, isMapLoaded, isPanelCollapsed]);


  // Clear drawing
  const handleClear = () => {
    const hadDrawnBbox = Boolean(customBbox);
    const hadPreviewBbox = Boolean(previewBbox);
    const previousPreviewInputLength = previewInput.length;

    if (window.clearMapboxRectangle) {
      window.clearMapboxRectangle();
    }
    setCopySuccess('');
    setShareSuccess(false);
    setCustomBboxSource(null);
    
    // Clear preview data
    setPreviewInput('');
    setPreviewBbox(null);
    setPreviewError('');
    setPreviewCenterPoint(null);
    setPreviewDimensions(null);
    
    // Clear preview layer on map
    if (mapInstanceRef.current && mapInstanceRef.current.getSource('preview')) {
      const source = mapInstanceRef.current.getSource('preview');
      if (source && source.type === 'geojson') {
        (source as GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    }
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete('bbox');
    url.searchParams.delete('type');
    url.searchParams.delete('input');
    url.searchParams.delete('center');
    url.searchParams.delete('zoom');
    window.history.replaceState({}, '', url.toString());
    window.dispatchEvent(new Event('bbox-url-change'));
    locallySyncedBboxParamRef.current = null;
    lastPreviewTrackKeyRef.current = '';
    trackBBoxEvent('clear', `had_drawn:${hadDrawnBbox}|had_preview:${hadPreviewBbox}`, previousPreviewInputLength);
  };

  // Copy result to clipboard
  const copyResult = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(formatId);
      setTimeout(() => setCopySuccess(''), 2000);
      trackBBoxEvent('copy', `format:${formatId}`, text.length);
    }).catch(err => {
      console.error('Failed to copy:', err);
      trackBBoxEvent('copy_error', `format:${formatId}`, text.length);
    });
  };

  // Share current map state (viewport + custom bbox + preview bbox if exists)
  const shareResults = async () => {
    const baseUrl = `${window.location.origin}${bboxPath(language)}`;
    const params = new URLSearchParams();
    
    // Add custom bbox if exists (drawn bbox has priority)
    if (customBbox) {
      const bboxParam = formatBboxParam(customBbox);
      params.set('bbox', bboxParam);
      params.set('type', 'drawn');
      locallySyncedBboxParamRef.current = bboxParam;
    } else if (previewBbox) {
      // Add preview bbox if no custom bbox exists
      params.set('bbox', formatBboxParam(previewBbox));
      params.set('type', 'preview');
      // Also save the original input for restoration
      params.set('input', previewInput);
    }
    
    // Add current map viewport info
    if (mapInstanceRef.current) {
      const center = mapInstanceRef.current.getCenter();
      const zoom = mapInstanceRef.current.getZoom();
      params.set('center', `${center.lng.toFixed(6)},${center.lat.toFixed(6)}`);
      params.set('zoom', zoom.toFixed(2));
    }
    
    const shareUrl = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    window.history.replaceState({}, '', shareUrl);
    window.dispatchEvent(new Event('bbox-url-change'));

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
      trackBBoxEvent(
        'share',
        `type:${customBbox ? 'drawn' : previewBbox ? 'preview' : 'viewport'}|has_viewport:${Boolean(mapInstanceRef.current)}`,
        shareUrl.length
      );
    } catch (error) {
      console.error('Copy link failed:', error);
      trackBBoxEvent(
        'share_error',
        `type:${customBbox ? 'drawn' : previewBbox ? 'preview' : 'viewport'}|reason:clipboard`,
        shareUrl.length
      );
    }
  };



  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <main className="min-h-0 flex-1">
        <section className="relative h-full min-h-0 overflow-hidden">
          <div className="h-full">
            {/* URL Loading Indicator */}
            {isLoadingFromUrl && (
              <StatusToast
                variant="success"
                title={text('loadingFromUrl')}
                className="mb-6"
              />
            )}

            <div className="relative h-full">
              {/* Map Section - Takes 2/3 width */}
              <div className="absolute inset-0">
                <GlassPanel className="h-full transform-none rounded-none border-0 bg-transparent p-0 shadow-none hover:translate-y-0">
                  {/* Map Container */}
                  <div 
                    ref={mapContainerRef}
                    className="h-full w-full bg-white/[0.035]"
                  />
                  {!mapboxToken && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/88 px-6 text-center">
                      <div className="max-w-md rounded-[18px] border border-amber-300/20 bg-amber-300/[0.08] px-5 py-4 shadow-2xl backdrop-blur-xl">
                        <p className="text-sm font-semibold text-amber-100">
                          {text('mapUnavailable')}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-amber-50/72">
                          {text('mapUnavailableDesc')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Tool Instructions - Inside map container */}
                  <div className={`pointer-events-none absolute bottom-4 left-4 z-20 hidden max-w-2xl rounded-[18px] border border-white/[0.1] bg-slate-950/72 px-4 py-3 shadow-2xl backdrop-blur-xl transition-opacity duration-700 md:block lg:left-5 ${isDrawHintVisible && mapboxToken ? 'opacity-100' : 'opacity-0'}`}>
                    <p className="text-sm leading-6 text-white/58">
                      <span className="hidden sm:inline">{text('mapHintDesktop')}</span>
                      <span className="sm:hidden">{text('mapHintMobile')}</span>
                    </p>
                  </div>

                </GlassPanel>
              </div>

              {isPanelCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsPanelCollapsed(false)}
                  className="absolute right-3 top-14 z-30 inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-slate-950/78 px-3 text-sm font-medium text-white/72 shadow-2xl backdrop-blur-xl transition-colors duration-200 hover:bg-slate-950/88 hover:text-white"
                  aria-expanded={false}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 5l-8 7 8 7" />
                  </svg>
                  {text('openPanel')}
                </button>
              )}

              {/* Right Panel - Results and Info */}
              <div className={`${isPanelCollapsed ? 'hidden' : 'flex'} absolute inset-x-3 bottom-3 z-30 max-h-[48vh] flex-col gap-3 overflow-y-auto rounded-[26px] border border-white/[0.1] bg-slate-950/78 p-3 shadow-2xl backdrop-blur-xl lg:bottom-3 lg:left-auto lg:right-3 lg:top-14 lg:w-[420px] lg:max-h-none lg:rounded-[26px] lg:p-3`}>
                <div className="sticky top-0 z-10 order-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="relative flex items-center gap-2">
                      <h1 className="text-sm font-semibold text-white/84">
                        {text('toolTitle')}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setIsHelpOpen((open) => !open)}
                        className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.045] px-2.5 text-xs font-medium text-white/58 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                        aria-expanded={isHelpOpen}
                        aria-label={text('howToUse')}
                      >
                        <span className="font-semibold" aria-hidden="true">i</span>
                        {text('howToUse')}
                      </button>
                      {isHelpOpen && (
                        <div className="absolute left-0 top-8 z-20 w-[min(22rem,calc(100vw-2rem))] rounded-[18px] border border-white/[0.1] bg-slate-950/94 p-4 text-sm leading-6 text-white/58 shadow-2xl backdrop-blur-xl">
                          <p>
                            {text('helpIntro')}
                          </p>
                          <ol className="mt-3 space-y-2 pl-5 text-white/62">
                            {[
                              text('helpStep1'),
                              text('helpStep2'),
                              text('helpStep3'),
                              text('helpStep4'),
                            ].map((item) => (
                              <li key={item} className="list-decimal">
                                {item}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPanelCollapsed(true);
                        setIsHelpOpen(false);
                      }}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.045] text-white/58 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                      aria-label={text('collapsePanel')}
                      aria-expanded
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 5l8 7-8 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* BBox Preview Panel - Collapsible */}
                <div className="order-10 overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.035]">
                  <button
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="group flex w-full items-center justify-between p-4 transition-colors duration-200 hover:bg-white/[0.045]"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-white/58 transition-colors group-hover:text-white/78" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <div className="flex flex-col items-start">
                        <h3 className="text-white font-medium transition-colors group-hover:text-white">
                          {text('previewBbox')}
                        </h3>
                        <p className="mt-0.5 text-xs text-white/42">
                          {previewBbox ? text('loaded') : text('previewBboxDesc')}
                        </p>
                      </div>
                      {previewBbox && (
                        <span className="ml-auto inline-flex items-center rounded-full border border-emerald-200/15 bg-emerald-300/[0.08] px-2 py-1 text-xs text-emerald-50/78">
                          <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12.5l4 4L19 7" />
                          </svg>
                          {text('loaded')}
                        </span>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-white/42 transition-transform duration-200 group-hover:text-white/68 ${isPreviewExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={isPreviewExpanded ? 'overflow-hidden' : 'hidden'}>
                    <div className="border-t border-white/[0.08] p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-white/58" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h4 className="text-white font-medium text-sm">
                          {text('inputBboxData')}
                        </h4>
                      </div>
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <p className="text-xs leading-5 text-white/42">
                          {text('inputBboxDesc')}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const example = '[24.782000, 60.120000, 25.254000, 60.297000]';
                            handlePreviewInputChange(example);
                            trackBBoxEvent('example_loaded', 'source:preview_input|example:helsinki', example.length);
                          }}
                          className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.045] px-2.5 py-1 text-xs font-medium text-white/62 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                        >
                          {text('loadExample')}
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="relative">
                          <ResizableTextarea
                            value={previewInput}
                            onChange={(e) => handlePreviewInputChange(e.target.value)}
                            placeholder={text('inputPlaceholder')}
                            initialHeight={128}
                            minHeight={112}
                            maxHeight={420}
                            containerClassName="rounded-[18px] border-white/[0.08] bg-white/[0.035] focus-within:border-white/[0.18] focus-within:ring-white/20"
                            textareaClassName="px-3 py-3 text-sm placeholder:text-white/28"
                            resizeTitle={text('resizeTitle')}
                          />
                          {!previewInput && (
                            <div className="absolute top-3 right-3 text-xs text-white/28">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {previewError && (
                          <div className="rounded-[14px] border border-rose-300/[0.16] bg-rose-300/[0.08] p-2 text-sm text-rose-100/82">
                            {previewError}
                          </div>
                        )}
                        
                        {previewInput && !previewError && !previewBbox && (
                          <div className="flex items-center gap-2 rounded-[14px] border border-amber-200/[0.16] bg-amber-200/[0.08] p-2 text-sm text-amber-50/82">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" stroke="currentColor" strokeLinecap="round" strokeWidth="4" d="M4 12a8 8 0 018-8"></path>
                            </svg>
                            {text('parsing')}
                          </div>
                        )}
                        
                        {previewBbox && (
                          <div className="flex items-center gap-2 rounded-[14px] border border-emerald-200/[0.16] bg-emerald-300/[0.08] p-2 text-sm text-emerald-50/82">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12.5l4 4L19 7" />
                            </svg>
                            {text('parseSuccess')}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between border-t border-white/[0.08] pt-2">
                          <div className="flex items-center gap-2 text-xs text-white/42">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {text('autoDetect')}
                          </div>
                          {previewInput && (
                            <button
                              onClick={() => {
                                trackBBoxEvent('preview_input_cleared', `source:preview_clear_button|had_preview:${Boolean(previewBbox)}`, previewInput.length);
                                setPreviewInput('');
                                setPreviewBbox(null);
                                setPreviewError('');
                                setPreviewCenterPoint(null);
                                setPreviewDimensions(null);
                                lastPreviewTrackKeyRef.current = '';
                              }}
                              className="text-xs text-white/42 transition-colors hover:text-rose-100"
                            >
                              {text('clear')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview BBox Info Panel */}
                {previewBbox && previewCenterPoint && previewDimensions && (
                  <div className="order-20 rounded-[18px] border border-violet-200/[0.14] bg-violet-300/[0.045] p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-violet-100/82" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12 18 18.75 12 18.75 2.25 12 2.25 12z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15.25a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z" />
                      </svg>
                      {text('bboxInfo')}
                      <span className="rounded-full border border-violet-200/[0.18] bg-violet-300/[0.1] px-2 py-0.5 text-xs font-normal text-violet-50/72">
                        {text('preview')}
                      </span>
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('centerPoint')}:</span>
                        <span className="text-white font-mono">{previewCenterPoint.lat.toFixed(6)}, {previewCenterPoint.lng.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('width')}:</span>
                        <span className="text-white">{previewDimensions.width.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('height')}:</span>
                        <span className="text-white">{previewDimensions.height.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('area')}:</span>
                        <span className="text-white">{(previewDimensions.width * previewDimensions.height).toFixed(2)} km²</span>
                      </div>
                      <div className="mt-3 border-t border-white/[0.08] pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/42">WGS84 BBox:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyResult(`[${previewBbox.minLng.toFixed(6)}, ${previewBbox.minLat.toFixed(6)}, ${previewBbox.maxLng.toFixed(6)}, ${previewBbox.maxLat.toFixed(6)}]`, 'preview')}
                              className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs text-white/68 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                            >
                              {copySuccess === 'preview' ? text('copied') : text('copy')}
                            </button>
                            <button
                              onClick={() => {
                                const bbox = previewBbox;
                                if (!bbox) return;
                                const geoJSONString = JSON.stringify({
                                  type: "FeatureCollection",
                                  bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
                                  features: [{
                                    type: "Feature",
                                    properties: { name: "Preview BBox" },
                                    geometry: {
                                      type: "Polygon",
                                      coordinates: [[[bbox.minLng, bbox.minLat], [bbox.maxLng, bbox.minLat], [bbox.maxLng, bbox.maxLat], [bbox.minLng, bbox.maxLat], [bbox.minLng, bbox.minLat]]]
                                    }
                                  }]
                                }, null, 2);
                                copyResult(geoJSONString, 'preview-geojson');
                              }}
                              className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs text-white/68 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                            >
                              {copySuccess === 'preview-geojson' ? text('copied') : text('copyGeoJSON')}
                            </button>
                          </div>
                        </div>
                        <div className="rounded-[14px] border border-white/[0.06] bg-black/18 p-2 font-mono text-sm text-[#a1c4fd]">
                          [{previewBbox.minLng.toFixed(6)}, {previewBbox.minLat.toFixed(6)}, {previewBbox.maxLng.toFixed(6)}, {previewBbox.maxLat.toFixed(6)}]
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Viewport Info Panel */}
                {viewportBbox && viewportCenterPoint && viewportDimensions && (
                  <div className="order-40 rounded-[18px] border border-sky-200/[0.14] bg-sky-300/[0.04] p-4">
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-sky-100/78" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5.75A1.75 1.75 0 015.75 4h12.5A1.75 1.75 0 0120 5.75v8.5A1.75 1.75 0 0118.25 16H5.75A1.75 1.75 0 014 14.25v-8.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20h6m-4-4v4m2-4v4" />
                      </svg>
                      {text('currentScreenMapInfo')}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('centerPoint')}:</span>
                        <span className="text-white font-mono">{viewportCenterPoint.lat.toFixed(6)}, {viewportCenterPoint.lng.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('width')}:</span>
                        <span className="text-white">{viewportDimensions.width.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('height')}:</span>
                        <span className="text-white">{viewportDimensions.height.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('area')}:</span>
                        <span className="text-white">{(viewportDimensions.width * viewportDimensions.height).toFixed(2)} km²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('zoomLevel')}:</span>
                        <span className="text-white">{mapZoom.toFixed(2)}</span>
                      </div>
                      <div className="mt-3 border-t border-white/[0.08] pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/42">WGS84 BBox:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyResult(`[${viewportBbox.minLng.toFixed(6)}, ${viewportBbox.minLat.toFixed(6)}, ${viewportBbox.maxLng.toFixed(6)}, ${viewportBbox.maxLat.toFixed(6)}]`, 'viewport')}
                              className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs text-white/68 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                            >
                              {copySuccess === 'viewport' ? text('copied') : text('copy')}
                            </button>
                            <button
                              onClick={() => {
                                const bbox = viewportBbox;
                                if (!bbox) return;
                                const geoJSONString = JSON.stringify({
                                  type: "FeatureCollection",
                                  bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
                                  features: [{
                                    type: "Feature",
                                    properties: { name: "Viewport BBox" },
                                    geometry: {
                                      type: "Polygon",
                                      coordinates: [[[bbox.minLng, bbox.minLat], [bbox.maxLng, bbox.minLat], [bbox.maxLng, bbox.maxLat], [bbox.minLng, bbox.maxLat], [bbox.minLng, bbox.minLat]]]
                                    }
                                  }]
                                }, null, 2);
                                copyResult(geoJSONString, 'viewport-geojson');
                              }}
                              className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs text-white/68 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                            >
                              {copySuccess === 'viewport-geojson' ? text('copied') : text('copyGeoJSON')}
                            </button>
                          </div>
                        </div>
                        <div className="rounded-[14px] border border-white/[0.06] bg-black/18 p-2 font-mono text-sm text-[#a1c4fd]">
                          [{viewportBbox.minLng.toFixed(6)}, {viewportBbox.minLat.toFixed(6)}, {viewportBbox.maxLng.toFixed(6)}, {viewportBbox.maxLat.toFixed(6)}]
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Bbox Info Panel or Drawing Hint */}
                {customBbox && customCenterPoint && customDimensions ? (
                  <div className="order-30 rounded-[18px] border border-emerald-200/[0.14] bg-emerald-300/[0.045] p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 font-medium text-white">
                        <svg className="w-5 h-5 text-emerald-100/78" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 6.5A1.5 1.5 0 016.5 5h11A1.5 1.5 0 0119 6.5v11a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 17.5v-11z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 8h3m-3 8h3m5-8v3m0 2v3" />
                        </svg>
                        {text('bboxInfo')}
                        <span className="rounded-full border border-emerald-200/[0.18] bg-emerald-300/[0.1] px-2 py-0.5 text-xs font-normal text-emerald-50/72">
                          {text('drawn')}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleClear}
                          className="rounded-full border border-rose-200/[0.16] bg-rose-300/[0.08] px-3 py-1.5 text-xs text-rose-100/82 transition-colors duration-200 hover:bg-rose-300/[0.12] hover:text-white"
                        >
                          {text('clear')}
                        </button>
                        <button
                          onClick={shareResults}
                          className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs text-white/68 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                        >
                          {shareSuccess ? text('shared') : text('share')}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {customBboxSource === 'url' && (
                        <div className="url-source-hint mb-3 rounded-[14px] border border-white/[0.07] border-l-2 border-l-amber-200/30 bg-white/[0.025] px-3 py-2.5 text-xs leading-5 text-white/50">
                          <div className="flex items-start gap-2">
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-100/45" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.5 6.75h1.75A3.75 3.75 0 0119 10.5v0a3.75 3.75 0 01-3.75 3.75H13.5m-3 0H8.75A3.75 3.75 0 015 10.5v0a3.75 3.75 0 013.75-3.75h1.75M9 10.5h6" />
                            </svg>
                            <p className="flex-1">
                              {text('urlSourceHint')}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('centerPoint')}:</span>
                        <span className="text-white font-mono">{customCenterPoint.lat.toFixed(6)}, {customCenterPoint.lng.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('width')}:</span>
                        <span className="text-white">{customDimensions.width.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('height')}:</span>
                        <span className="text-white">{customDimensions.height.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/42">{text('area')}:</span>
                        <span className="text-white">{(customDimensions.width * customDimensions.height).toFixed(2)} km²</span>
                      </div>
                      <div className="mt-3 border-t border-white/[0.08] pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white/42">WGS84 BBox:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyResult(`[${customBbox.minLng.toFixed(6)}, ${customBbox.minLat.toFixed(6)}, ${customBbox.maxLng.toFixed(6)}, ${customBbox.maxLat.toFixed(6)}]`, 'custom')}
                              className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs text-white/68 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                            >
                              {copySuccess === 'custom' ? text('copied') : text('copy')}
                            </button>
                            <button
                              onClick={() => {
                                const bbox = customBbox;
                                if (!bbox) return;
                                const geoJSONString = JSON.stringify({
                                  type: "FeatureCollection",
                                  bbox: [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
                                  features: [{
                                    type: "Feature",
                                    properties: { name: "Drawn BBox" },
                                    geometry: {
                                      type: "Polygon",
                                      coordinates: [[[bbox.minLng, bbox.minLat], [bbox.maxLng, bbox.minLat], [bbox.maxLng, bbox.maxLat], [bbox.minLng, bbox.maxLat], [bbox.minLng, bbox.minLat]]]
                                    }
                                  }]
                                }, null, 2);
                                copyResult(geoJSONString, 'custom-geojson');
                              }}
                              className="rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 text-xs text-white/68 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                            >
                              {copySuccess === 'custom-geojson' ? text('copied') : text('copyGeoJSON')}
                            </button>
                          </div>
                        </div>
                        <div className="rounded-[14px] border border-white/[0.06] bg-black/18 p-2 font-mono text-sm text-[#a1c4fd]">
                          [{customBbox.minLng.toFixed(6)}, {customBbox.minLat.toFixed(6)}, {customBbox.maxLng.toFixed(6)}, {customBbox.maxLat.toFixed(6)}]
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="order-30 rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-4">
                    <div className="text-center">
                      <div className="mb-4 text-white/38">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <h3 className="text-white font-medium mb-2">
                        {text('drawArea')}
                      </h3>
                      <p className="text-sm leading-6 text-white/42">
                        <span className="hidden sm:inline">{text('drawHintDesktop')}</span>
                        <span className="sm:hidden">{text('drawHintMobile')}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Coordinate Converter Link */}
                {(customBbox || viewportBbox) && (
                  <div className="order-60 rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-4">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-white/58" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                      </svg>
                      {text('needOtherFormats')}
                    </h3>
                    <p className="mb-3 text-sm leading-6 text-white/58">
                      {text('needOtherFormatsDesc')}
                    </p>
                    <Link
                      href={`${toolPath('coordinate-converter', language === 'zh' ? 'zh' : 'en')}?${new URLSearchParams({
                        coords: `${(customBbox || viewportBbox)?.minLat}, ${(customBbox || viewportBbox)?.minLng}\n${(customBbox || viewportBbox)?.maxLat}, ${(customBbox || viewportBbox)?.maxLng}`,
                        system: 'wgs84',
                        order: 'lat_lng',
                      }).toString()}`}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-medium text-slate-950 transition-colors duration-200 hover:bg-white/90"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                      </svg>
                      {text('convertCoordinates')}
                    </Link>
                  </div>
                )}

                <footer className="order-70 border-t border-white/[0.08] pt-3 text-xs text-white/38">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <a
                      href="https://www.mofei.life/"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white/70"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.75 6.75A2 2 0 016.75 4.75h10.5a2 2 0 012 2v10.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2V6.75z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 9h8M8 12h8M8 15h5" />
                      </svg>
                      {text('craftedBy')}
                    </a>
                    <span aria-hidden="true">·</span>
                    <a
                      href="https://github.com/zmofei/mofei-dev-tools"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white/70"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3.75l2.47 5.01 5.53.8-4 3.9.94 5.5L12 16.36l-4.94 2.6.94-5.5-4-3.9 5.53-.8L12 3.75z" />
                      </svg>
                      {text('starProject')}
                    </a>
                  </div>
                </footer>

              </div>
            </div>
          </div>


        </section>
      </main>
    </div>
  );
}

// Global type for clearMapboxRectangle function
declare global {
  interface Window {
    clearMapboxRectangle?: () => void;
  }
}

export default function BBoxDrawingToolPage({
  language = 'en',
}: {
  language?: BBoxLanguage;
}) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" stroke="currentColor" strokeLinecap="round" strokeWidth="4" d="M4 12a8 8 0 018-8"></path>
          </svg>
          <p className="text-white/42">{bboxText(language, 'loadingFromUrl')}</p>
        </div>
      </div>
    }>
      <BBoxDrawingToolContent language={language} />
    </Suspense>
  );
}
