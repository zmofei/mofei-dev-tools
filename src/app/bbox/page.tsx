"use client"
import { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from "motion/react"
import Link from 'next/link';
import Foot from '@/components/Common/Foot';
import { useLanguage } from '@/contexts/LanguageContext';
import { event } from '@/components/GoogleAnalytics';
import StructuredData from '@/components/StructuredData';
import { useSearchParams } from 'next/navigation';
import ContributeButton from '@/components/Common/ContributeButton';

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



function BBoxDrawingToolContent() {
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapboxMap>(null);
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
  const [isMobile, setIsMobile] = useState(false);
  const [previewInput, setPreviewInput] = useState<string>('');
  const [previewBbox, setPreviewBbox] = useState<BoundingBox | null>(null);
  const [previewError, setPreviewError] = useState<string>('');
  const [previewCenterPoint, setPreviewCenterPoint] = useState<{lat: number, lng: number} | null>(null);
  const [previewDimensions, setPreviewDimensions] = useState<{width: number, height: number} | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const mapboxToken = 'pk.eyJ1IjoibW9mZWkiLCJhIjoiY2w1Z3Z6OWw1MDNlaDNjcXpqMjZsMG5oZCJ9.nqfToaqgxmm3jbJzu6bK6Q';

  const titleText = t('bbox.title') || 'BBox Drawing Tool - Interactive Map Bounding Box Generator';
  const subtitleText = t('bbox.subtitle') || 'Create precise geographic boundaries with our free online bounding box drawing tool. Draw rectangles on interactive maps, get WGS84 coordinates, and export to GeoJSON format.';

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
            projection: 'mercator'
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
                currentBbox = newBbox;
                
                // Drawing mode is desktop only, no need to turn off
                
                // Track drawing event
                event('bbox_drawn', 'Tool Usage', 'BBox Draw on Mapbox', 1);
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
  }, [isMobile]);

  // Drawing mode is disabled on mobile, so no need to manage map interactions

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
        setPreviewError(language === 'zh' ? '无效的边界框：最小值必须小于最大值' : 'Invalid bbox: min values must be less than max values');
        return;
      }
      
      if (Math.abs(bbox.minLng) > 180 || Math.abs(bbox.maxLng) > 180 || Math.abs(bbox.minLat) > 90 || Math.abs(bbox.maxLat) > 90) {
        setPreviewError(language === 'zh' ? '无效的坐标：经度范围 -180~180，纬度范围 -90~90' : 'Invalid coordinates: longitude range -180~180, latitude range -90~90');
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
        ], { padding: 100 });
      }
    } else {
      setPreviewError(language === 'zh' ? '无法解析输入格式。支持：数组 [minLng,minLat,maxLng,maxLat]、GeoJSON、逗号分隔值' : 'Unable to parse input format. Supported: Array [minLng,minLat,maxLng,maxLat], GeoJSON, comma-separated values');
    }
  };

  // Load data from URL parameters
  useEffect(() => {
    if (!isMapLoaded || !mapInstanceRef.current) return;
    
    const bboxParam = searchParams.get('bbox');
    const typeParam = searchParams.get('type');
    const inputParam = searchParams.get('input');
    const centerParam = searchParams.get('center');
    const zoomParam = searchParams.get('zoom');
    
    setIsLoadingFromUrl(true);
    
    try {
      // Handle bbox parameter
      if (bboxParam) {
        const coords = bboxParam.split(',').map(Number);
        if (coords.length === 4) {
          const [minLng, minLat, maxLng, maxLat] = coords;
          const newBbox = { minLng, minLat, maxLng, maxLat };
          
          // Check if it's a preview type or drawn type
          if (typeParam === 'preview' && inputParam) {
            // Restore preview state
            const decodedInput = decodeURIComponent(inputParam);
            setPreviewInput(decodedInput);
            setPreviewBbox(newBbox);
            calculatePreviewMetrics(newBbox);
            setIsPreviewExpanded(true); // Auto-expand when loading from URL
            
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
        }
      }
      
      // Handle map center and zoom parameters
      if (centerParam && zoomParam) {
        const centerCoords = centerParam.split(',').map(Number);
        const zoom = Number(zoomParam);
        if (centerCoords.length === 2 && !isNaN(zoom)) {
          mapInstanceRef.current.setCenter([centerCoords[0], centerCoords[1]]);
          mapInstanceRef.current.setZoom(zoom);
        }
      } else if (bboxParam) {
        // If we have bbox but no center/zoom, fit to bbox
        const coords = bboxParam.split(',').map(Number);
        if (coords.length === 4) {
          const [minLng, minLat, maxLng, maxLat] = coords;
          mapInstanceRef.current.fitBounds([
            [minLng, minLat],
            [maxLng, maxLat]
          ], { padding: 50 });
        }
      }
    } catch (error) {
      console.error('Error loading parameters from URL:', error);
    }
    
    setIsLoadingFromUrl(false);
  }, [searchParams, isMapLoaded]);


  // Clear drawing
  const handleClear = () => {
    if (window.clearMapboxRectangle) {
      window.clearMapboxRectangle();
    }
    setCopySuccess('');
    setShareSuccess(false);
    
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
  };

  // Copy result to clipboard
  const copyResult = (text: string, formatId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(formatId);
      setTimeout(() => setCopySuccess(''), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  // Share current map state (viewport + custom bbox + preview bbox if exists)
  const shareResults = async () => {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams();
    
    // Add custom bbox if exists (drawn bbox has priority)
    if (customBbox) {
      params.set('bbox', `${customBbox.minLng},${customBbox.minLat},${customBbox.maxLng},${customBbox.maxLat}`);
      params.set('type', 'drawn');
    } else if (previewBbox) {
      // Add preview bbox if no custom bbox exists
      params.set('bbox', `${previewBbox.minLng},${previewBbox.minLat},${previewBbox.maxLng},${previewBbox.maxLat}`);
      params.set('type', 'preview');
      // Also save the original input for restoration
      params.set('input', encodeURIComponent(previewInput));
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

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    } catch (error) {
      console.error('Copy link failed:', error);
    }
  };



  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData 
        type="tool" 
        toolName="BBox Drawing Tool"
        toolDescription="Free online tool to draw and generate bounding boxes on interactive maps. Create precise geographic boundaries, get WGS84 coordinates, and export to GeoJSON format. Perfect for GIS applications and mapping projects."
        url="https://tools.mofei.life/bbox"
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
                {t('bbox.backToTools') || 'Back to Tools'}
              </Link>
            </motion.div>

            <motion.h1 
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] leading-tight text-center text-2xl mb-4 md:text-4xl md:mb-6 lg:text-5xl lg:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {titleText}
            </motion.h1>
            
            <motion.p 
              className="text-gray-300/90 text-base md:text-lg lg:text-xl font-medium leading-relaxed tracking-wide text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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
            className="max-w-7xl mx-auto"
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
                  <p className="text-blue-400 text-sm">{t('bbox.loadingFromUrl') || 'Loading from URL...'}</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Section - Takes 2/3 width */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white text-lg font-semibold">
                      {language === 'zh' ? '在地图上绘制边界框' : 'Draw Bounding Box on Map'}
                    </h2>
                    <div className="flex items-center gap-2">
                      {customBbox && (
                        <button
                          onClick={handleClear}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                        >
                          {t('bbox.clear') || 'Clear'}
                        </button>
                      )}
                      <button
                        onClick={shareResults}
                        className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      >
                        {shareSuccess ? (t('bbox.shared') || 'Shared!') : (t('bbox.share') || 'Share')}
                      </button>
                    </div>
                  </div>
                  
                  {/* Map Container */}
                  <div 
                    ref={mapContainerRef}
                    className="w-full h-96 bg-gray-700 rounded-lg border border-gray-600"
                    style={{ minHeight: '400px' }}
                  />
                  
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                      💡 {language === 'zh' 
                        ? (
                          <>
                            <span className="hidden sm:inline">按住 Shift 键并拖拽鼠标来绘制矩形区域。按 ESC 键取消绘制。计算出的边界框是所绘制矩形区域的范围。默认显示当前可视区域的边界框。</span>
                            <span className="sm:hidden">绘制功能需要在PC浏览器中使用。在移动设备上，您可以查看当前地图可视区域的边界框，并通过拖拽地图调整可视区域。</span>
                          </>
                        )
                        : (
                          <>
                            <span className="hidden sm:inline">Hold Shift and drag to draw a rectangular area. Press ESC to cancel drawing. The calculated bounding box shows the extent of the drawn rectangle area. By default, it shows the current viewport bounds.</span>
                            <span className="sm:hidden">Drawing functionality requires a PC browser. On mobile devices, you can view the bounding box of the current map viewport and adjust the visible area by dragging the map.</span>
                          </>
                        )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Panel - Results and Info */}
              <div className="space-y-6">
                {/* BBox Preview Panel - Collapsible */}
                <motion.div
                  className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <button
                    onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                        <path d="M14 2v6h6"/>
                        <path d="M16 13H8"/>
                        <path d="M16 17H8"/>
                        <path d="M10 9H8"/>
                      </svg>
                      <h3 className="text-white font-medium">
                        {language === 'zh' ? '输入BBox预览' : 'Input BBox Preview'}
                      </h3>
                      {previewBbox && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          {language === 'zh' ? '已加载' : 'Loaded'}
                        </span>
                      )}
                    </div>
                    <motion.svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: isPreviewExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isPreviewExpanded ? 'auto' : 0,
                      opacity: isPreviewExpanded ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-gray-700/50">
                      <p className="text-gray-400 text-sm mb-3">
                        {language === 'zh' 
                          ? '粘贴 GeoJSON 或数组格式的边界框数据进行预览' 
                          : 'Paste GeoJSON or array format bbox data for preview'
                        }
                      </p>
                      
                      <div className="space-y-3">
                        <textarea
                          value={previewInput}
                          onChange={(e) => handlePreviewInputChange(e.target.value)}
                          placeholder={language === 'zh' 
                            ? `支持格式：
[116.3, 39.9, 116.4, 40.0]
116.3, 39.9, 116.4, 40.0
{"bbox": [116.3, 39.9, 116.4, 40.0]}
{"type": "Feature", "geometry": {...}}`
                            : `Supported formats:
[116.3, 39.9, 116.4, 40.0]
116.3, 39.9, 116.4, 40.0
{"bbox": [116.3, 39.9, 116.4, 40.0]}
{"type": "Feature", "geometry": {...}}`
                          }
                          className="w-full h-24 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono"
                        />
                        
                        {previewError && (
                          <div className="p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-sm">
                            {previewError}
                          </div>
                        )}
                        
                        {previewInput && !previewError && !previewBbox && (
                          <div className="p-2 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-400 text-sm">
                            {language === 'zh' ? '正在解析...' : 'Parsing...'}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          {language === 'zh' ? '支持：数组、GeoJSON、逗号分隔值' : 'Supports: Array, GeoJSON, comma-separated values'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Preview BBox Info Panel */}
                {previewBbox && previewCenterPoint && previewDimensions && (
                  <motion.div
                    className="bg-gray-800/30 rounded-lg p-4 border border-purple-500/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {language === 'zh' ? '预览区域' : 'Preview Area'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.centerPoint') || 'Center'}:</span>
                        <span className="text-white font-mono">{previewCenterPoint.lat.toFixed(6)}, {previewCenterPoint.lng.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.width') || 'Width'}:</span>
                        <span className="text-white">{previewDimensions.width.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.height') || 'Height'}:</span>
                        <span className="text-white">{previewDimensions.height.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.area') || 'Area'}:</span>
                        <span className="text-white">{(previewDimensions.width * previewDimensions.height).toFixed(2)} km²</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">WGS84 BBox:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyResult(`[${previewBbox.minLng.toFixed(6)}, ${previewBbox.minLat.toFixed(6)}, ${previewBbox.maxLng.toFixed(6)}, ${previewBbox.maxLat.toFixed(6)}]`, 'preview')}
                              className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors duration-200"
                            >
                              {copySuccess === 'preview' ? (t('bbox.copied') || 'Copied!') : (t('bbox.copy') || 'Copy')}
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
                              className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors duration-200"
                            >
                              {copySuccess === 'preview-geojson' ? (t('bbox.copied') || 'Copied!') : (language === 'zh' ? '复制GeoJSON' : 'Copy GeoJSON')}
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-2 font-mono text-purple-400 text-sm">
                          [{previewBbox.minLng.toFixed(6)}, {previewBbox.minLat.toFixed(6)}, {previewBbox.maxLng.toFixed(6)}, {previewBbox.maxLat.toFixed(6)}]
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Viewport Info Panel */}
                {viewportBbox && viewportCenterPoint && viewportDimensions && (
                  <motion.div
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {language === 'zh' ? '当前可视区域' : 'Current Viewport'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.centerPoint') || 'Center'}:</span>
                        <span className="text-white font-mono">{viewportCenterPoint.lat.toFixed(6)}, {viewportCenterPoint.lng.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.width') || 'Width'}:</span>
                        <span className="text-white">{viewportDimensions.width.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.height') || 'Height'}:</span>
                        <span className="text-white">{viewportDimensions.height.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.area') || 'Area'}:</span>
                        <span className="text-white">{(viewportDimensions.width * viewportDimensions.height).toFixed(2)} km²</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{language === 'zh' ? '缩放级别' : 'Zoom Level'}:</span>
                        <span className="text-white">{mapZoom.toFixed(2)}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">WGS84 BBox:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyResult(`[${viewportBbox.minLng.toFixed(6)}, ${viewportBbox.minLat.toFixed(6)}, ${viewportBbox.maxLng.toFixed(6)}, ${viewportBbox.maxLat.toFixed(6)}]`, 'viewport')}
                              className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-200"
                            >
                              {copySuccess === 'viewport' ? (t('bbox.copied') || 'Copied!') : (t('bbox.copy') || 'Copy')}
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
                              className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors duration-200"
                            >
                              {copySuccess === 'viewport-geojson' ? (t('bbox.copied') || 'Copied!') : (language === 'zh' ? '复制GeoJSON' : 'Copy GeoJSON')}
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-2 font-mono text-blue-400 text-sm">
                          [{viewportBbox.minLng.toFixed(6)}, {viewportBbox.minLat.toFixed(6)}, {viewportBbox.maxLng.toFixed(6)}, {viewportBbox.maxLat.toFixed(6)}]
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Custom Bbox Info Panel or Drawing Hint */}
                {customBbox && customCenterPoint && customDimensions ? (
                  <motion.div
                    className="bg-gray-800/30 rounded-lg p-4 border border-green-500/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      {language === 'zh' ? '绘制区域' : 'Drawn Area'}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.centerPoint') || 'Center'}:</span>
                        <span className="text-white font-mono">{customCenterPoint.lat.toFixed(6)}, {customCenterPoint.lng.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.width') || 'Width'}:</span>
                        <span className="text-white">{customDimensions.width.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.height') || 'Height'}:</span>
                        <span className="text-white">{customDimensions.height.toFixed(2)} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('bbox.area') || 'Area'}:</span>
                        <span className="text-white">{(customDimensions.width * customDimensions.height).toFixed(2)} km²</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">WGS84 BBox:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyResult(`[${customBbox.minLng.toFixed(6)}, ${customBbox.minLat.toFixed(6)}, ${customBbox.maxLng.toFixed(6)}, ${customBbox.maxLat.toFixed(6)}]`, 'custom')}
                              className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200"
                            >
                              {copySuccess === 'custom' ? (t('bbox.copied') || 'Copied!') : (t('bbox.copy') || 'Copy')}
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
                              className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors duration-200"
                            >
                              {copySuccess === 'custom-geojson' ? (t('bbox.copied') || 'Copied!') : (language === 'zh' ? '复制GeoJSON' : 'Copy GeoJSON')}
                            </button>
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded p-2 font-mono text-green-400 text-sm">
                          [{customBbox.minLng.toFixed(6)}, {customBbox.minLat.toFixed(6)}, {customBbox.maxLng.toFixed(6)}, {customBbox.maxLat.toFixed(6)}]
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <h3 className="text-white font-medium mb-2">
                        {language === 'zh' ? '绘制区域' : 'Draw Area'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {language === 'zh' 
                          ? (
                            <>
                              <span className="hidden sm:inline">按住 Shift 键并在地图上拖拽绘制矩形区域，查看精确的边界框信息</span>
                              <span className="sm:hidden">绘制功能需要在PC浏览器中使用。请在桌面设备上访问此页面进行精确的矩形区域绘制。</span>
                            </>
                          )
                          : (
                            <>
                              <span className="hidden sm:inline">Hold Shift and drag on the map to draw a rectangle area and see precise bounding box information</span>
                              <span className="sm:hidden">Drawing functionality requires a PC browser. Please access this page on a desktop device for precise rectangle area drawing.</span>
                            </>
                          )
                        }
                      </p>
                    </div>
                  </motion.div>
                )}


                {/* Coordinate Converter Link */}
                {(customBbox || viewportBbox) && (
                  <motion.div
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#a1c4fd]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                      </svg>
                      {language === 'zh' ? '需要其他格式？' : 'Need other formats?'}
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      {language === 'zh' ? '如需其他坐标格式，请使用我们的坐标转换工具' : 'For other coordinate formats, use our coordinate converter tool'}
                    </p>
                    <Link
                      href={`${language === 'en' ? '/en' : '/zh'}/coordinate-converter?coords=${(customBbox || viewportBbox)?.minLng},${(customBbox || viewportBbox)?.minLat},${(customBbox || viewportBbox)?.maxLng},${(customBbox || viewportBbox)?.maxLat}`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-[#a1c4fd] hover:bg-[#8fb3f9] text-gray-900 rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                      </svg>
                      {language === 'zh' ? '转换坐标格式' : 'Convert Coordinates'}
                    </Link>
                  </motion.div>
                )}

              </div>
            </div>
          </motion.div>

          {/* About BBox Drawing Tool Section - Moved below map */}
          <motion.div 
            className="max-w-4xl mx-auto mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8">
              <h2 className="text-xl font-bold text-white mb-6 text-center">
                {language === 'zh' ? '关于BBox绘制工具' : 'About BBox Drawing Tool'}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-[#a1c4fd] mb-3">
                    {language === 'zh' ? '什么是边界框？' : 'What is a Bounding Box?'}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {language === 'zh' 
                      ? '边界框（Bounding Box，简称BBox）是GIS和地图应用中的重要概念，用于定义地理区域的最小矩形范围。它通过四个坐标值（最小经度、最小纬度、最大经度、最大纬度）来精确描述一个地理区域的边界。'
                      : 'A bounding box (BBox) is a fundamental concept in GIS and mapping applications, used to define the minimum rectangular extent of a geographic area. It precisely describes the boundaries of a geographic region using four coordinate values: minimum longitude, minimum latitude, maximum longitude, and maximum latitude.'
                    }
                  </p>
                  
                  <h3 className="text-lg font-semibold text-[#a1c4fd] mb-3">
                    {language === 'zh' ? '工具特性' : 'Tool Features'}
                  </h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• {language === 'zh' ? '交互式地图绘制界面' : 'Interactive map drawing interface'}</li>
                    <li>• {language === 'zh' ? '精确的WGS84坐标生成' : 'Precise WGS84 coordinate generation'}</li>
                    <li>• {language === 'zh' ? '实时面积和中心点计算' : 'Real-time area and center point calculation'}</li>
                    <li>• {language === 'zh' ? 'GeoJSON格式导出' : 'GeoJSON format export'}</li>
                    <li>• {language === 'zh' ? '可视区域边界框查看' : 'Viewport bounding box viewing'}</li>
                    <li>• {language === 'zh' ? 'BBox数据预览和验证' : 'BBox data preview and validation'}</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-[#a1c4fd] mb-3">
                    {language === 'zh' ? '使用场景' : 'Use Cases'}
                  </h3>
                  <ul className="text-gray-300 text-sm space-y-2 mb-4">
                    <li>• {language === 'zh' ? 'GIS数据处理和分析' : 'GIS data processing and analysis'}</li>
                    <li>• {language === 'zh' ? '地图API边界参数设置' : 'Map API boundary parameter setting'}</li>
                    <li>• {language === 'zh' ? '地理数据查询范围定义' : 'Geographic data query range definition'}</li>
                    <li>• {language === 'zh' ? '空间数据库查询优化' : 'Spatial database query optimization'}</li>
                    <li>• {language === 'zh' ? '地图瓦片范围计算' : 'Map tile range calculation'}</li>
                    <li>• {language === 'zh' ? '现有BBox数据的可视化验证' : 'Visual validation of existing BBox data'}</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-[#a1c4fd] mb-3">
                    {language === 'zh' ? '支持格式' : 'Supported Formats'}
                  </h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• {language === 'zh' ? 'WGS84十进制度格式' : 'WGS84 decimal degrees format'}</li>
                    <li>• {language === 'zh' ? 'GeoJSON边界框格式' : 'GeoJSON bounding box format'}</li>
                    <li>• {language === 'zh' ? '标准[minLng, minLat, maxLng, maxLat]格式' : 'Standard [minLng, minLat, maxLng, maxLat] format'}</li>
                    <li>• {language === 'zh' ? '可分享的URL参数格式' : 'Shareable URL parameter format'}</li>
                    <li>• {language === 'zh' ? '逗号/空格分隔的坐标值' : 'Comma/space-separated coordinate values'}</li>
                  </ul>
                </div>
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

// Global type for clearMapboxRectangle function
declare global {
  interface Window {
    clearMapboxRectangle?: () => void;
  }
}

export default function BBoxDrawingToolPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-400">Loading Map...</p>
        </div>
      </div>
    }>
      <BBoxDrawingToolContent />
    </Suspense>
  );
}