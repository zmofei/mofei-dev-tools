"use client"
import { useState, useEffect, useCallback } from 'react';
import { motion } from "motion/react"
import Link from 'next/link';
import Foot from '@/components/Common/Foot';
import { useLanguage } from '@/contexts/LanguageContext';
import { event } from '@/components/GoogleAnalytics';
import StructuredData from '@/components/StructuredData';
import ContributeButton from '@/components/Common/ContributeButton';

interface Column {
  id: string;
  name: string;
  path: string;
}

interface ExtractedRow {
  [key: string]: unknown;
}

function JSONExtractToolPageContent() {
  const { language, t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [columns, setColumns] = useState<Column[]>([
    { id: '1', name: 'Column 1', path: '$.properties.title' }
  ]);
  const [columns2, setColumns2] = useState<Column[]>([
    { id: '1', name: 'Column 1', path: '$.properties.title' }
  ]);
  const [results, setResults] = useState<ExtractedRow[]>([]);
  const [sortedResults, setSortedResults] = useState<ExtractedRow[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [jsonError2, setJsonError2] = useState('');
  const [isValidJson, setIsValidJson] = useState(true);
  const [isValidJson2, setIsValidJson2] = useState(true);
  const [pathPreviews, setPathPreviews] = useState<{[key: string]: string}>({});
  const [pathErrors, setPathErrors] = useState<{[key: string]: string}>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [suggestedPaths, setSuggestedPaths] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [inputText2, setInputText2] = useState('');
  const [results2, setResults2] = useState<ExtractedRow[]>([]);
  const [suggestedPaths2, setSuggestedPaths2] = useState<string[]>([]);
  const [sortedResults2, setSortedResults2] = useState<ExtractedRow[]>([]);
  const [sortConfig2, setSortConfig2] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  // Cache keys for localStorage
  const CACHE_KEYS = {
    SINGLE_MODE: 'json-extract-single-mode-cache',
    COMPARE_MODE: 'json-extract-compare-mode-cache'
  };

  // Default cache values
  const defaultSingleCache = {
    inputText: '',
    columns: [{ id: '1', name: 'Column 1', path: '$.properties.title' }] as Column[]
  };
  
  const defaultCompareCache = {
    inputText1: '',
    inputText2: '',
    columns1: [{ id: '1', name: 'Column 1', path: '$.properties.title' }] as Column[],
    columns2: [{ id: '1', name: 'Column 1', path: '$.properties.title' }] as Column[]
  };

  // Load cache from localStorage
  const loadFromLocalStorage = () => {
    if (typeof window === 'undefined') return { defaultSingleCache, defaultCompareCache };
    
    try {
      const singleCache = localStorage.getItem(CACHE_KEYS.SINGLE_MODE);
      const compareCache = localStorage.getItem(CACHE_KEYS.COMPARE_MODE);
      
      return {
        singleCache: singleCache ? JSON.parse(singleCache) : defaultSingleCache,
        compareCache: compareCache ? JSON.parse(compareCache) : defaultCompareCache
      };
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
      return { 
        singleCache: defaultSingleCache, 
        compareCache: defaultCompareCache 
      };
    }
  };

  // Initialize cache from localStorage
  const { singleCache: initialSingleCache, compareCache: initialCompareCache } = loadFromLocalStorage();
  
  // Cache for single mode
  const [singleModeCache, setSingleModeCache] = useState(initialSingleCache);
  
  // Cache for compare mode
  const [compareModeCache, setCompareModeCache] = useState(initialCompareCache);

  const titleText = t('json-extract.title');
  const subtitleText = t('json-extract.subtitle');

  // Save cache to localStorage
  const saveToLocalStorage = (key: string, data: unknown) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Load initial cache data on mount
  useEffect(() => {
    const { singleCache, compareCache } = loadFromLocalStorage();
    
    // Always restore the cache data to state first
    setSingleModeCache(singleCache);
    setCompareModeCache(compareCache);
    
    // Then set the current UI based on the current mode
    if (!compareMode) {
      // In single mode, load single mode cache
      if (singleCache.inputText) {
        setInputText(singleCache.inputText);
        setColumns(singleCache.columns);
        if (singleCache.inputText.trim()) {
          setTimeout(() => analyzeJSON(singleCache.inputText), 100);
        }
      }
    } else {
      // In compare mode, load compare mode cache
      if (compareCache.inputText1) {
        setInputText(compareCache.inputText1);
        setInputText2(compareCache.inputText2);
        setColumns(compareCache.columns1);
        setColumns2(compareCache.columns2);
        if (compareCache.inputText1.trim()) {
          setTimeout(() => analyzeJSON(compareCache.inputText1), 100);
        }
        if (compareCache.inputText2.trim()) {
          setTimeout(() => analyzeJSON2(compareCache.inputText2), 100);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save single mode cache to localStorage whenever it changes
  useEffect(() => {
    if (singleModeCache !== initialSingleCache) {
      saveToLocalStorage(CACHE_KEYS.SINGLE_MODE, singleModeCache);
    }
  }, [singleModeCache, initialSingleCache, CACHE_KEYS.SINGLE_MODE]);

  // Save compare mode cache to localStorage whenever it changes
  useEffect(() => {
    if (compareModeCache !== initialCompareCache) {
      saveToLocalStorage(CACHE_KEYS.COMPARE_MODE, compareModeCache);
    }
  }, [compareModeCache, initialCompareCache, CACHE_KEYS.COMPARE_MODE]);


  // Generate suggested column paths from arrays
  const generateSuggestedPaths = (obj: unknown): string[] => {
    const suggestions: string[] = [];
    
    // Helper function to recursively explore object and generate path suggestions
    const exploreObject = (item: unknown, basePath: string, maxDepth: number = 4) => {
      if (maxDepth <= 0 || !item || typeof item !== 'object') {
        return;
      }
      
      if (Array.isArray(item)) {
        // For arrays, suggest the array itself and explore the first item
        suggestions.push(`${basePath}[*]`);
        if (item.length > 0) {
          exploreObject(item[0], `${basePath}[*]`, maxDepth - 1);
        }
      } else {
        // For objects, explore each property
        const itemObj = item as Record<string, unknown>;
        Object.keys(itemObj).forEach(key => {
          const value = itemObj[key];
          const newPath = `${basePath}.${key}`;
          
          if (Array.isArray(value)) {
            // If it's an array, suggest the array path and explore first item
            suggestions.push(`${newPath}[*]`);
            if (value.length > 0) {
              exploreObject(value[0], `${newPath}[*]`, maxDepth - 1);
            }
          } else if (value && typeof value === 'object') {
            // If it's an object, recurse into it
            exploreObject(value, newPath, maxDepth - 1);
          } else {
            // If it's a primitive value, suggest this path
            suggestions.push(newPath);
          }
        });
      }
    };
    
    // Start exploration from the root
    exploreObject(obj, '$', 4);
    
    // Remove duplicates and sort by usefulness
    const uniqueSuggestions = [...new Set(suggestions)];
    
    // Sort suggestions to prioritize useful paths
    return uniqueSuggestions.sort((a, b) => {
      // Prioritize paths that don't end with array indices
      const aEndsWithIndex = /\.\d+$/.test(a);
      const bEndsWithIndex = /\.\d+$/.test(b);
      
      if (aEndsWithIndex && !bEndsWithIndex) return 1;
      if (!aEndsWithIndex && bEndsWithIndex) return -1;
      
      // Prioritize shorter paths
      const aDepth = a.split('.').length;
      const bDepth = b.split('.').length;
      
      if (aDepth !== bDepth) return aDepth - bDepth;
      
      // Alphabetical order for same depth
      return a.localeCompare(b);
    });
  };

  // JSONPath implementation
  const extractPath = (obj: unknown, path: string): unknown[] => {
    try {
      console.log('Extracting path:', path, 'from object:', obj);
      
      // Remove leading $ if present
      let cleanPath = path.startsWith('$') ? path.slice(1) : path;
      
      if (cleanPath === '' || cleanPath === '.') {
        return [obj];
      }
      
      // Remove leading dot if present
      if (cleanPath.startsWith('.')) {
        cleanPath = cleanPath.slice(1);
      }
      
      const results: unknown[] = [];
      
      const traverse = (current: unknown, pathRemaining: string) => {
        console.log('Traversing:', pathRemaining, 'on:', current);
        
        if (!pathRemaining) {
          results.push(current);
          return;
        }
        
        // Handle array wildcard like features[*]
        if (pathRemaining.includes('[*]')) {
          const beforeBracket = pathRemaining.split('[*]')[0];
          const afterBracket = pathRemaining.split('[*]')[1];
          
          if (beforeBracket) {
            // Get the array first
            const arrayPath = beforeBracket.split('.');
            let target = current;
            
            for (const prop of arrayPath) {
              if (prop && target && typeof target === 'object') {
                target = (target as Record<string, unknown>)[prop];
              }
            }
            
            if (Array.isArray(target)) {
              target.forEach(item => {
                if (afterBracket) {
                  traverse(item, afterBracket.startsWith('.') ? afterBracket.slice(1) : afterBracket);
                } else {
                  results.push(item);
                }
              });
            }
          }
          return;
        }
        
        // Handle specific array index like [0]
        if (pathRemaining.includes('[') && pathRemaining.includes(']')) {
          const beforeBracket = pathRemaining.split('[')[0];
          const indexMatch = pathRemaining.match(/\[(\d+)\]/);
          if (indexMatch) {
            const index = parseInt(indexMatch[1]);
            const afterBracket = pathRemaining.split(']')[1];
            
            let target = current;
            if (beforeBracket) {
              const arrayPath = beforeBracket.split('.');
              for (const prop of arrayPath) {
                if (prop && target && typeof target === 'object') {
                  target = (target as Record<string, unknown>)[prop];
                }
              }
            }
            
            if (Array.isArray(target) && target[index] !== undefined) {
              if (afterBracket) {
                traverse(target[index], afterBracket.startsWith('.') ? afterBracket.slice(1) : afterBracket);
              } else {
                results.push(target[index]);
              }
            }
          }
          return;
        }
        
        // Handle regular property access
        const parts = pathRemaining.split('.');
        const firstPart = parts[0];
        const remainingPath = parts.slice(1).join('.');
        
        if (current && typeof current === 'object' && current !== null) {
          const currentObj = current as Record<string, unknown>;
          if (currentObj[firstPart] !== undefined) {
            if (remainingPath) {
              traverse(currentObj[firstPart], remainingPath);
            } else {
              results.push(currentObj[firstPart]);
            }
          }
        }
      };
      
      traverse(obj, cleanPath);
      console.log('Extraction results:', results);
      return results;
    } catch (error) {
      console.error('Path extraction error:', error);
      return [];
    }
  };

  const addColumn = () => {
    const newId = (columns.length + 1).toString();
    const newColumns = [...columns, { id: newId, name: `Column ${newId}`, path: '$.' }];
    setColumns(newColumns);
    // Update cache
    if (compareMode) {
      setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, columns1: newColumns }));
    } else {
      setSingleModeCache((prev: typeof defaultSingleCache) => ({ ...prev, columns: newColumns }));
    }
  };

  const removeColumn = (id: string) => {
    if (columns.length > 1) {
      const newColumns = columns.filter(col => col.id !== id);
      setColumns(newColumns);
      // Update cache
      if (compareMode) {
        setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, columns1: newColumns }));
      } else {
        setSingleModeCache((prev: typeof defaultSingleCache) => ({ ...prev, columns: newColumns }));
      }
    }
  };

  const updateColumn = (id: string, field: 'name' | 'path', value: string) => {
    const newColumns = columns.map(col => 
      col.id === id ? { ...col, [field]: value } : col
    );
    setColumns(newColumns);
    
    // Update path preview if path changed
    if (field === 'path' && inputText && isValidJson) {
      try {
        const jsonData = JSON.parse(inputText);
        updatePathPreview(id, value, jsonData);
      } catch {
        // JSON is invalid, clear preview
        setPathPreviews(prev => ({ ...prev, [id]: '' }));
        setPathErrors(prev => ({ ...prev, [id]: '' }));
      }
    }
    
    // Update cache
    if (compareMode) {
      setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, columns1: newColumns }));
    } else {
      setSingleModeCache((prev: typeof defaultSingleCache) => ({ ...prev, columns: newColumns }));
    }
  };

  const addColumn2 = () => {
    const newId = (columns2.length + 1).toString();
    const newColumns2 = [...columns2, { id: newId, name: `Column ${newId}`, path: '$.' }];
    setColumns2(newColumns2);
    // Update cache
    if (compareMode) {
      setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, columns2: newColumns2 }));
    }
  };

  // Clear all columns for JSON1
  const clearAllColumns = () => {
    const defaultColumns = [{ id: '1', name: 'Column 1', path: '$.properties.title' }];
    setColumns(defaultColumns);
    setSuggestedPaths([]); // Clear suggested paths
    setResults([]); // Clear results
    setSortedResults([]);
    setError('');
    setSortConfig(null);
    // Update cache
    if (compareMode) {
      setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, columns1: defaultColumns }));
    } else {
      setSingleModeCache((prev: typeof defaultSingleCache) => ({ ...prev, columns: defaultColumns }));
    }
  };

  // Clear all columns for JSON2
  // const clearAllColumns2 = () => {
  //   const defaultColumns = [{ id: '1', name: 'Column 1', path: '$.properties.title' }];
  //   setColumns2(defaultColumns);
  //   setSuggestedPaths2([]); // Clear suggested paths
  //   setResults2([]); // Clear results
  //   setSortedResults2([]);
  //   setSortConfig2(null);
  //   // Update cache
  //   if (compareMode) {
  //     setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, columns2: defaultColumns }));
  //   }
  // };

  // Clear all columns for both JSONs (compare mode)
  const clearAllColumnsCompare = () => {
    const defaultColumns = [{ id: '1', name: 'Column 1', path: '$.properties.title' }];
    setColumns(defaultColumns);
    setColumns2(defaultColumns);
    setSuggestedPaths([]);
    setSuggestedPaths2([]);
    setResults([]);
    setResults2([]);
    setSortedResults([]);
    setSortedResults2([]);
    setError('');
    setSortConfig(null);
    setSortConfig2(null);
    // Update cache
    setCompareModeCache((prev: typeof defaultCompareCache) => ({ 
      ...prev, 
      columns1: defaultColumns,
      columns2: defaultColumns 
    }));
  };

  const removeColumn2 = (id: string) => {
    if (columns2.length > 1) {
      const newColumns2 = columns2.filter(col => col.id !== id);
      setColumns2(newColumns2);
      // Update cache
      if (compareMode) {
        setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, columns2: newColumns2 }));
      }
    }
  };

  const updateColumn2 = (id: string, field: 'name' | 'path', value: string) => {
    const newColumns2 = columns2.map(col => 
      col.id === id ? { ...col, [field]: value } : col
    );
    setColumns2(newColumns2);
    
    // Update path preview if path changed
    if (field === 'path' && inputText2 && isValidJson2) {
      try {
        const jsonData = JSON.parse(inputText2);
        updatePathPreview(id + '_json2', value, jsonData);
      } catch {
        // JSON is invalid, clear preview
        setPathPreviews(prev => ({ ...prev, [id + '_json2']: '' }));
        setPathErrors(prev => ({ ...prev, [id + '_json2']: '' }));
      }
    }
    
    // Update cache
    if (compareMode) {
      setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, columns2: newColumns2 }));
    }
  };

  const extractData = () => {
    if (!inputText.trim()) {
      setError(t('json-extract.enterJsonData'));
      return;
    }

    if (compareMode && !inputText2.trim()) {
      setError(t('json-extract.enterJsonData'));
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const jsonData1 = JSON.parse(inputText);
      const jsonData2 = compareMode ? JSON.parse(inputText2) : null;
      
      const extractedResults1: ExtractedRow[] = [];
      const extractedResults2: ExtractedRow[] = [];

      // Extract values from each column for first JSON
      const columnResults1: { [key: string]: unknown[] } = {};
      
      columns.forEach(column => {
        const values = extractPath(jsonData1, column.path);
        columnResults1[column.name] = values;
      });

      // Find the maximum number of results across all columns for first JSON
      const maxResults1 = Math.max(...Object.values(columnResults1).map(arr => arr.length));
      
      // Create rows - one for each result for first JSON
      for (let i = 0; i < maxResults1; i++) {
        const row: ExtractedRow = { _index: i };
        
        columns.forEach(column => {
          const values = columnResults1[column.name];
          row[column.name] = values[i] || null;
        });
        
        extractedResults1.push(row);
      }

      // If in compare mode, extract from second JSON using columns2
      if (compareMode && jsonData2) {
        const columnResults2: { [key: string]: unknown[] } = {};
        
        columns2.forEach(column => {
          const values = extractPath(jsonData2, column.path);
          columnResults2[column.name] = values;
        });

        const maxResults2 = Math.max(...Object.values(columnResults2).map(arr => arr.length));
        
        for (let i = 0; i < maxResults2; i++) {
          const row: ExtractedRow = { _index: i };
          
          columns2.forEach(column => {
            const values = columnResults2[column.name];
            row[column.name] = values[i] || null;
          });
          
          extractedResults2.push(row);
        }
      }

      setResults(extractedResults1);
      setResults2(extractedResults2);
      setSortedResults(extractedResults1);
      setSortedResults2(extractedResults2);
      setSortConfig(null);
      setSortConfig2(null);
      
      // Track extraction event
      event('json_extract', 'Tool Usage', 'JSON Path Extract', inputText.length);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
      setResults([]);
      setResults2([]);
      setSortedResults([]);
      setSortedResults2([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear single mode data and cache
  const handleClearSingle = () => {
    setInputText('');
    setResults([]);
    setSortedResults([]);
    setError('');
    setJsonError('');
    setIsValidJson(true);
    setSortConfig(null);
    setSuggestedPaths([]);
    
    const clearedCache = {
      inputText: '',
      columns: [{ id: '1', name: 'Column 1', path: '$.properties.title' }]
    };
    setSingleModeCache(clearedCache);
    setColumns(clearedCache.columns);
  };

  // Clear compare mode data and cache
  const handleClearCompare = () => {
    setInputText('');
    setInputText2('');
    setResults([]);
    setResults2([]);
    setSortedResults([]);
    setSortedResults2([]);
    setError('');
    setJsonError('');
    setJsonError2('');
    setIsValidJson(true);
    setIsValidJson2(true);
    setSortConfig(null);
    setSortConfig2(null);
    setSuggestedPaths([]);
    setSuggestedPaths2([]);
    
    const clearedCache = {
      inputText1: '',
      inputText2: '',
      columns1: [{ id: '1', name: 'Column 1', path: '$.properties.title' }],
      columns2: [{ id: '1', name: 'Column 1', path: '$.properties.title' }]
    };
    setCompareModeCache(clearedCache);
    setColumns(clearedCache.columns1);
    setColumns2(clearedCache.columns2);
  };

  // Legacy clear function for compatibility
  const handleClear = () => {
    if (compareMode) {
      handleClearCompare();
    } else {
      handleClearSingle();
    }
  };

  // Analyze JSON and generate suggestions
  const analyzeJSON = useCallback((jsonText: string) => {
    try {
      if (!jsonText.trim()) {
        setSuggestedPaths([]);
        return;
      }
      
      const jsonData = JSON.parse(jsonText);
      const suggestions = generateSuggestedPaths(jsonData);
      setSuggestedPaths(suggestions);
      setError('');
    } catch {
      setSuggestedPaths([]);
      // Don't set error here, let the user continue typing
    }
  }, []);

  // Analyze second JSON and generate suggestions
  const analyzeJSON2 = useCallback((jsonText: string) => {
    try {
      if (!jsonText.trim()) {
        setSuggestedPaths2([]);
        return;
      }
      
      const jsonData = JSON.parse(jsonText);
      const suggestions = generateSuggestedPaths(jsonData);
      setSuggestedPaths2(suggestions);
    } catch {
      setSuggestedPaths2([]);
    }
  }, []);

  // Handle mode switch with caching
  const handleModeSwitch = (isCompareMode: boolean) => {
    if (isCompareMode === compareMode) return;
    
    if (compareMode) {
      // Switching from compare to single mode
      const newCompareCache = {
        inputText1: inputText,
        inputText2: inputText2,
        columns1: [...columns],
        columns2: [...columns2]
      };
      setCompareModeCache(newCompareCache);
      
      // Restore single mode cache
      setInputText(singleModeCache.inputText);
      setColumns(singleModeCache.columns);
      setInputText2('');
      setColumns2([{ id: '1', name: 'Column 1', path: '$.properties.title' }]);
      
      // Analyze JSON if there's cached data
      if (singleModeCache.inputText.trim()) {
        analyzeJSON(singleModeCache.inputText);
      }
    } else {
      // Switching from single to compare mode
      const newSingleCache = {
        inputText: inputText,
        columns: [...columns]
      };
      setSingleModeCache(newSingleCache);
      
      // Restore compare mode cache
      setInputText(compareModeCache.inputText1);
      setInputText2(compareModeCache.inputText2);
      setColumns(compareModeCache.columns1);
      setColumns2(compareModeCache.columns2);
      
      // Analyze JSON if there's cached data
      if (compareModeCache.inputText1.trim()) {
        analyzeJSON(compareModeCache.inputText1);
      }
      if (compareModeCache.inputText2.trim()) {
        analyzeJSON2(compareModeCache.inputText2);
      }
    }
    
    setCompareMode(isCompareMode);
    setResults([]);
    setResults2([]);
    setSortedResults([]);
    setSortedResults2([]);
    setError('');
    setSortConfig(null);
    setSortConfig2(null);
    setSuggestedPaths([]);
    setSuggestedPaths2([]);
  };


  // Validate JSON syntax
  const validateJson = (jsonText: string): { isValid: boolean; error: string } => {
    if (!jsonText.trim()) {
      return { isValid: true, error: '' };
    }
    
    try {
      JSON.parse(jsonText);
      return { isValid: true, error: '' };
    } catch (error) {
      const err = error as Error;
      // Extract line number from error message if available
      const lineMatch = err.message.match(/at position (\d+)/);
      if (lineMatch) {
        const position = parseInt(lineMatch[1]);
        const lines = jsonText.substring(0, position).split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;
        return { 
          isValid: false, 
          error: `Line ${lineNumber}, Column ${columnNumber}: ${err.message}` 
        };
      }
      return { isValid: false, error: err.message };
    }
  };

  // Validate JSONPath and show preview
  const validateJsonPath = (path: string, jsonData: unknown): { isValid: boolean; preview: string; error: string } => {
    if (!path.trim()) {
      return { isValid: true, preview: '', error: '' };
    }
    
    try {
      const results = extractPath(jsonData, path);
      if (results.length === 0) {
        return { isValid: true, preview: 'No results', error: '' };
      }
      
      const preview = results.slice(0, 3).map(result => {
        if (typeof result === 'string') return `"${result}"`;
        if (result === null) return 'null';
        if (typeof result === 'object') return JSON.stringify(result);
        return String(result);
      }).join(', ');
      
      const suffix = results.length > 3 ? ` ... (+${results.length - 3} more)` : '';
      return { isValid: true, preview: preview + suffix, error: '' };
    } catch (error) {
      const err = error as Error;
      return { isValid: false, preview: '', error: err.message };
    }
  };

  // Update path preview when path or JSON changes
  const updatePathPreview = (columnId: string, path: string, jsonData: unknown) => {
    if (!jsonData || !path.trim()) {
      setPathPreviews(prev => ({ ...prev, [columnId]: '' }));
      setPathErrors(prev => ({ ...prev, [columnId]: '' }));
      return;
    }
    
    const validation = validateJsonPath(path, jsonData);
    setPathPreviews(prev => ({ ...prev, [columnId]: validation.preview }));
    setPathErrors(prev => ({ ...prev, [columnId]: validation.error }));
  };

  // Handle input change with debounced analysis
  const handleInputChange = (value: string) => {
    setInputText(value);
    
    // Validate JSON
    const validation = validateJson(value);
    setIsValidJson(validation.isValid);
    setJsonError(validation.error);
    
    // Update path previews if JSON is valid
    if (validation.isValid && value.trim()) {
      try {
        const jsonData = JSON.parse(value);
        columns.forEach(col => {
          updatePathPreview(col.id, col.path, jsonData);
        });
      } catch {
        // Clear previews if JSON is invalid
        setPathPreviews(prev => {
          const newPreviews = { ...prev };
          columns.forEach(col => {
            delete newPreviews[col.id];
          });
          return newPreviews;
        });
      }
    } else {
      // Clear previews if JSON is empty or invalid
      setPathPreviews(prev => {
        const newPreviews = { ...prev };
        columns.forEach(col => {
          delete newPreviews[col.id];
        });
        return newPreviews;
      });
    }
    
    // Update cache
    if (compareMode) {
      setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, inputText1: value }));
    } else {
      setSingleModeCache((prev: typeof defaultSingleCache) => ({ ...prev, inputText: value }));
    }
  };

  // Handle second input change with debounced analysis
  const handleInputChange2 = (value: string) => {
    setInputText2(value);
    
    // Validate JSON
    const validation = validateJson(value);
    setIsValidJson2(validation.isValid);
    setJsonError2(validation.error);
    
    // Update path previews if JSON is valid
    if (validation.isValid && value.trim()) {
      try {
        const jsonData = JSON.parse(value);
        columns2.forEach(col => {
          updatePathPreview(col.id + '_json2', col.path, jsonData);
        });
      } catch {
        // Clear previews if JSON is invalid
        setPathPreviews(prev => {
          const newPreviews = { ...prev };
          columns2.forEach(col => {
            delete newPreviews[col.id + '_json2'];
          });
          return newPreviews;
        });
      }
    } else {
      // Clear previews if JSON is empty or invalid
      setPathPreviews(prev => {
        const newPreviews = { ...prev };
        columns2.forEach(col => {
          delete newPreviews[col.id + '_json2'];
        });
        return newPreviews;
      });
    }
    
    // Update cache
    if (compareMode) {
      setCompareModeCache((prev: typeof defaultCompareCache) => ({ ...prev, inputText2: value }));
    }
  };

  // Debounced analysis effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeJSON(inputText);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [inputText, analyzeJSON]);

  // Debounced analysis effect for second JSON
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeJSON2(inputText2);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [inputText2, analyzeJSON2]);

  // Add suggested path to columns
  const addSuggestedPath = (path: string) => {
    const newId = (columns.length + 1).toString();
    const columnName = path.split('.').pop() || `Column ${newId}`;
    setColumns([...columns, { id: newId, name: columnName, path }]);
  };

  const addSuggestedPath2 = (path: string) => {
    const newId = (columns2.length + 1).toString();
    const columnName = path.split('.').pop() || `Column ${newId}`;
    setColumns2([...columns2, { id: newId, name: columnName, path }]);
  };

  // Copy paths from JSON1 to JSON2
  const copyPathsFromJson1 = () => {
    const copiedColumns = columns.map(col => ({
      ...col,
      id: col.id + '_copy'
    }));
    setColumns2(copiedColumns);
  };


  const handleSort = (columnName: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const sortedData = [...(sortedResults.length > 0 ? sortedResults : results)].sort((a, b) => {
      const aValue = a[columnName];
      const bValue = b[columnName];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return direction === 'asc' ? -1 : 1;
      
      // Convert to string for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setSortedResults(sortedData);
    setSortConfig({ key: columnName, direction });
  };

  // Handle sort for second JSON results
  const handleSort2 = (columnName: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig2 && sortConfig2.key === columnName && sortConfig2.direction === 'asc') {
      direction = 'desc';
    }
    
    const sortedData = [...results2].sort((a, b) => {
      const aValue = a[columnName];
      const bValue = b[columnName];
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return direction === 'asc' ? -1 : 1;
      
      // Convert to string for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setSortedResults2(sortedData);
    setSortConfig2({ key: columnName, direction });
  };

  // Function to compare two values and determine if they are different
  const compareValues = (val1: unknown, val2: unknown): boolean => {
    if (val1 === null || val1 === undefined) val1 = '';
    if (val2 === null || val2 === undefined) val2 = '';
    
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return val1.join(', ') !== val2.join(', ');
    }
    
    if (Array.isArray(val1)) val1 = val1.join(', ');
    if (Array.isArray(val2)) val2 = val2.join(', ');
    
    return String(val1) !== String(val2);
  };

  // Get comparison highlighting class
  const getComparisonClass = (val1: unknown, val2: unknown, isPresent1: boolean, isPresent2: boolean): string => {
    if (!isPresent1 && !isPresent2) return 'text-gray-500';
    if (!isPresent1) return 'bg-red-500/20 text-red-300 border border-red-500/30';
    if (!isPresent2) return 'bg-green-500/20 text-green-300 border border-green-500/30';
    if (compareValues(val1, val2)) return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
    return 'text-gray-300';
  };

  // Get the formatted value for display
  const formatValue = (value: unknown): string => {
    if (Array.isArray(value)) return value.join(', ');
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  const handleLoadExample = () => {
    const exampleData = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "title": "Location A",
            "description": "First location",
            "category": "restaurant"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.3974, 39.9093]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "title": "Location B",
            "description": "Second location",
            "category": "hotel"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.4074, 39.9193]
          }
        }
      ]
    };
    
    const jsonString = JSON.stringify(exampleData, null, 2);
    const newColumns = [
      { id: '1', name: 'Title', path: '$.features[*].properties.title' },
      { id: '2', name: 'Description', path: '$.features[*].properties.description' },
      { id: '3', name: 'Category', path: '$.features[*].properties.category' }
    ];
    
    setInputText(jsonString);
    analyzeJSON(jsonString);
    setColumns(newColumns);
    
    // Update cache
    const newSingleCache = {
      inputText: jsonString,
      columns: newColumns
    };
    setSingleModeCache(newSingleCache);
  };

  const handleLoadCompareExample = () => {
    // Example 1: E-commerce API - Product data
    const exampleData1 = {
      "products": [
        {
          "id": "p001",
          "title": "Wireless Headphones",
          "price": 89.99,
          "category": "Electronics",
          "rating": 4.5,
          "availability": "In Stock",
          "vendor": "TechCorp"
        },
        {
          "id": "p002", 
          "title": "Coffee Maker",
          "price": 129.99,
          "category": "Home & Kitchen",
          "rating": 4.2,
          "availability": "Out of Stock",
          "vendor": "KitchenPro"
        },
        {
          "id": "p003",
          "title": "Running Shoes",
          "price": 79.99,
          "category": "Sports",
          "rating": 4.8,
          "availability": "In Stock",
          "vendor": "SportsBrand"
        }
      ]
    };

    // Example 2: Different system - Inventory database format
    const exampleData2 = {
      "inventory": {
        "items": [
          {
            "sku": "WH-001",
            "product_name": "Bluetooth Headphones",
            "unit_price": 95.00,
            "dept": "Electronics",
            "customer_rating": 4.3,
            "stock_status": "available",
            "supplier": "AudioTech"
          },
          {
            "sku": "CM-002",
            "product_name": "Espresso Machine", 
            "unit_price": 149.99,
            "dept": "Appliances",
            "customer_rating": 4.6,
            "stock_status": "backorder",
            "supplier": "CoffeeMaster"
          },
          {
            "sku": "RS-003",
            "product_name": "Athletic Sneakers",
            "unit_price": 89.99,
            "dept": "Footwear",
            "customer_rating": 4.4,
            "stock_status": "available",
            "supplier": "RunFast"
          },
          {
            "sku": "TB-004",
            "product_name": "Yoga Mat",
            "unit_price": 29.99,
            "dept": "Fitness",
            "customer_rating": 4.7,
            "stock_status": "available",
            "supplier": "YogaLife"
          }
        ]
      }
    };
    
    const jsonString1 = JSON.stringify(exampleData1, null, 2);
    const jsonString2 = JSON.stringify(exampleData2, null, 2);
    
    const newColumns1 = [
      { id: '1', name: 'Product', path: '$.products[*].title' },
      { id: '2', name: 'Price', path: '$.products[*].price' },
      { id: '3', name: 'Category', path: '$.products[*].category' },
      { id: '4', name: 'Rating', path: '$.products[*].rating' },
      { id: '5', name: 'Status', path: '$.products[*].availability' }
    ];
    
    const newColumns2 = [
      { id: '1', name: 'Product', path: '$.inventory.items[*].product_name' },
      { id: '2', name: 'Price', path: '$.inventory.items[*].unit_price' },
      { id: '3', name: 'Category', path: '$.inventory.items[*].dept' },
      { id: '4', name: 'Rating', path: '$.inventory.items[*].customer_rating' },
      { id: '5', name: 'Status', path: '$.inventory.items[*].stock_status' }
    ];
    
    setInputText(jsonString1);
    setInputText2(jsonString2);
    analyzeJSON(jsonString1);
    analyzeJSON2(jsonString2);
    setColumns(newColumns1);
    setColumns2(newColumns2);
    
    // Update cache
    const newCompareCache = {
      inputText1: jsonString1,
      inputText2: jsonString2,
      columns1: newColumns1,
      columns2: newColumns2
    };
    setCompareModeCache(newCompareCache);
  };

  const exportToCSV = () => {
    const dataToExport = sortedResults.length > 0 ? sortedResults : results;
    if (dataToExport.length === 0) return;
    
    const headers = columns.map(col => col.name);
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          if (Array.isArray(value)) return `"${value.join(', ')}"`;
          return `"${String(value)}"`;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyMarkdown = () => {
    const dataToExport = sortedResults.length > 0 ? sortedResults : results;
    if (dataToExport.length === 0) return;
    
    const headers = columns.map(col => col.name);
    
    // Create markdown table
    const markdownContent = [
      // Header row
      `| ${headers.join(' | ')} |`,
      // Separator row
      `| ${headers.map(() => '---').join(' | ')} |`,
      // Data rows
      ...dataToExport.map(row => 
        `| ${headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '-';
          if (Array.isArray(value)) return value.join(', ');
          return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
        }).join(' | ')} |`
      )
    ].join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(markdownContent).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy markdown:', err);
    });
  };

  // Export to JSON
  const exportToJSON = () => {
    const dataToExport = sortedResults.length > 0 ? sortedResults : results;
    if (dataToExport.length === 0) return;
    
    const jsonContent = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy as JSON
  const copyAsJSON = () => {
    const dataToExport = sortedResults.length > 0 ? sortedResults : results;
    if (dataToExport.length === 0) return;
    
    const jsonContent = JSON.stringify(dataToExport, null, 2);
    navigator.clipboard.writeText(jsonContent).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }).catch(err => {
      console.error('Failed to copy JSON:', err);
    });
  };

  // Export comparison results
  const exportComparisonResults = () => {
    if (!compareMode || results.length === 0) return;
    
    const data1 = sortedResults.length > 0 ? sortedResults : results;
    const data2 = sortedResults2.length > 0 ? sortedResults2 : results2;
    
    const comparisonData = {
      json1: {
        columns: columns.map(col => ({ name: col.name, path: col.path })),
        data: data1
      },
      json2: {
        columns: columns2.map(col => ({ name: col.name, path: col.path })),
        data: data2
      },
      exportedAt: new Date().toISOString()
    };
    
    const jsonContent = JSON.stringify(comparisonData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'comparison_results.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col" itemScope itemType="https://schema.org/WebApplication">
      <StructuredData 
        type="tool" 
        toolName="JSON Path Extractor" 
        toolDescription="Extract values from JSON using JSONPath expressions"
        url="https://tools.mofei.life/json-extract"
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
                {t('json-extract.backToTools')}
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
              className="text-gray-300/90 text-base md:text-lg lg:text-xl font-medium leading-relaxed tracking-wide text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              itemProp="description"
            >
              {subtitleText}
            </motion.p>
          </div>
          
          <motion.div 
            className="flex justify-center px-5 md:px-10 lg:px-16 py-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <ContributeButton variant="ghost" size="sm" />
          </motion.div>
        </div>

        <div className='max-w-[2000px] mx-auto px-5 md:px-10 lg:px-16 py-6 md:py-8 lg:py-12'>
          <motion.div 
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Mode Toggle */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="text-white font-medium">Mode:</label>
                <div className="flex bg-gray-800/50 border border-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => handleModeSwitch(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !compareMode
                        ? 'bg-[#a1c4fd] text-gray-900'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {t('json-extract.singleMode')}
                  </button>
                  <button
                    onClick={() => handleModeSwitch(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      compareMode
                        ? 'bg-[#a1c4fd] text-gray-900'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {t('json-extract.compareMode')}
                  </button>
                </div>
              </div>
            </div>

            {/* Input area */}
            <div className="mb-6">
              {compareMode ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-medium">{t('json-extract.compareMode')}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLoadCompareExample}
                        className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200"
                      >
                        {t('json-extract.loadCompareExample')}
                      </button>
                      <button
                        onClick={handleClearCompare}
                        className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        {t('json-extract.clear')}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* First JSON input */}
                    <div>
                      <div className="mb-3">
                        <label className="text-white font-medium">
                          {t('json-extract.jsonData1')}
                        </label>
                      </div>
                      <div className="relative">
                        <textarea
                          value={inputText}
                          onChange={(e) => handleInputChange(e.target.value)}
                          placeholder={t('json-extract.placeholder')}
                          className={`w-full h-48 bg-gray-800/50 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none resize-none font-mono text-sm ${
                            !isValidJson 
                              ? 'border-red-500 focus:border-red-400' 
                              : 'border-gray-700 focus:border-[#a1c4fd]'
                          }`}
                        />
                        {!isValidJson && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      {jsonError && (
                        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                          <span className="font-medium">JSON Syntax Error:</span> {jsonError}
                        </div>
                      )}
                    </div>

                    {/* Second JSON input */}
                    <div>
                      <div className="mb-3">
                        <label className="text-white font-medium">{t('json-extract.jsonData2')}</label>
                      </div>
                      <div className="relative">
                        <textarea
                          value={inputText2}
                          onChange={(e) => handleInputChange2(e.target.value)}
                          placeholder={t('json-extract.placeholder')}
                          className={`w-full h-48 bg-gray-800/50 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none resize-none font-mono text-sm ${
                            !isValidJson2 
                              ? 'border-red-500 focus:border-red-400' 
                              : 'border-gray-700 focus:border-[#c2e9fb]'
                          }`}
                        />
                        {!isValidJson2 && (
                          <div className="absolute top-2 right-2">
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      {jsonError2 && (
                        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                          <span className="font-medium">JSON Syntax Error:</span> {jsonError2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-white font-medium">
                      {t('json-extract.jsonData')}
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleLoadExample}
                        className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200"
                      >
                        {t('json-extract.loadExample')}
                      </button>
                      <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                      >
                        {t('json-extract.clear')}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={t('json-extract.placeholder')}
                      className={`w-full h-48 bg-gray-800/50 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none resize-none font-mono text-sm ${
                        !isValidJson 
                          ? 'border-red-500 focus:border-red-400' 
                          : 'border-gray-700 focus:border-[#a1c4fd]'
                      }`}
                    />
                    {!isValidJson && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  {jsonError && (
                    <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">
                      <span className="font-medium">JSON Syntax Error:</span> {jsonError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Suggested paths */}
            {(suggestedPaths.length > 0 || suggestedPaths2.length > 0) && (
              <div className="mb-6">
                <label className="text-white font-medium mb-3 block">{t('json-extract.suggestedPaths')}</label>
                <div className={`grid gap-4 ${compareMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* First JSON suggestions */}
                  {suggestedPaths.length > 0 && (
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-300 text-sm mb-3">
                        {compareMode ? `${t('json-extract.jsonData1')} - ${t('json-extract.suggestedPathsDesc')}` : t('json-extract.suggestedPathsDesc')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedPaths.map((path, index) => (
                          <button
                            key={index}
                            onClick={() => addSuggestedPath(path)}
                            className="px-3 py-1 bg-[#a1c4fd]/10 hover:bg-[#a1c4fd]/20 border border-[#a1c4fd]/30 hover:border-[#a1c4fd]/50 rounded-md text-[#a1c4fd] hover:text-[#c2e9fb] transition-all duration-200 text-sm font-mono"
                          >
                            {path}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Second JSON suggestions */}
                  {compareMode && suggestedPaths2.length > 0 && (
                    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-300 text-sm mb-3">
                        {t('json-extract.jsonData2')} - {t('json-extract.suggestedPathsDesc')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedPaths2.map((path, index) => (
                          <button
                            key={index}
                            onClick={() => addSuggestedPath2(path)}
                            className="px-3 py-1 bg-[#c2e9fb]/10 hover:bg-[#c2e9fb]/20 border border-[#c2e9fb]/30 hover:border-[#c2e9fb]/50 rounded-md text-[#c2e9fb] hover:text-[#a1c4fd] transition-all duration-200 text-sm font-mono"
                          >
                            {path}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Column configuration */}
            <div className="mb-6">
              {compareMode && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">{t('json-extract.extractionColumns')}</h3>
                  <button
                    onClick={clearAllColumnsCompare}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                    </svg>
                    {t('json-extract.clearAllColumns')}
                  </button>
                </div>
              )}
              <div className={`grid gap-4 ${compareMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {/* First JSON columns */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-white font-medium">
                      {compareMode ? `${t('json-extract.jsonData1')} - ${t('json-extract.extractionColumns')}` : t('json-extract.extractionColumns')}
                    </label>
                    <div className="flex gap-2">
                      {!compareMode && (
                        <button
                          onClick={clearAllColumns}
                          className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                          </svg>
                          {t('json-extract.clearAllColumns')}
                        </button>
                      )}
                      <button
                        onClick={addColumn}
                        className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                        </svg>
                        {t('json-extract.addColumn')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {columns.map((column) => (
                      <div key={column.id} className="flex gap-3 items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={column.name}
                            onChange={(e) => updateColumn(column.id, 'name', e.target.value)}
                            placeholder={t('json-extract.columnName')}
                            className="w-full bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#a1c4fd]"
                          />
                        </div>
                        <div className="flex-2">
                          <input
                            type="text"
                            value={column.path}
                            onChange={(e) => updateColumn(column.id, 'path', e.target.value)}
                            placeholder={t('json-extract.columnPath')}
                            className={`w-full bg-gray-800/50 border rounded px-3 py-2 text-white text-sm focus:outline-none font-mono ${
                              pathErrors[column.id] 
                                ? 'border-red-500 focus:border-red-400' 
                                : 'border-gray-600 focus:border-[#a1c4fd]'
                            }`}
                          />
                          {pathPreviews[column.id] && (
                            <div className="mt-1 text-xs text-gray-400 bg-gray-800/30 rounded px-2 py-1">
                              <span className="text-green-400">Preview:</span> {pathPreviews[column.id]}
                            </div>
                          )}
                          {pathErrors[column.id] && (
                            <div className="mt-1 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                              <span className="font-medium">Error:</span> {pathErrors[column.id]}
                            </div>
                          )}
                        </div>
                        {columns.length > 1 && (
                          <button
                            onClick={() => removeColumn(column.id)}
                            className="text-red-400 hover:text-red-300 p-1 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Second JSON columns (only in compare mode) */}
                {compareMode && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-white font-medium">
                        {t('json-extract.jsonData2')} - {t('json-extract.extractionColumns')}
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={copyPathsFromJson1}
                          className="text-[#c2e9fb] hover:text-[#a1c4fd] text-xs transition-colors duration-200 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                          </svg>
                          {t('json-extract.copyPathsFromJson1')}
                        </button>
                        <button
                          onClick={addColumn2}
                          className="text-[#c2e9fb] hover:text-[#a1c4fd] text-sm transition-colors duration-200 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                          </svg>
                          {t('json-extract.addColumn')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {columns2.map((column) => (
                        <div key={column.id} className="flex gap-3 items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={column.name}
                              onChange={(e) => updateColumn2(column.id, 'name', e.target.value)}
                              placeholder={t('json-extract.columnName')}
                              className="w-full bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#c2e9fb]"
                            />
                          </div>
                          <div className="flex-2">
                            <input
                              type="text"
                              value={column.path}
                              onChange={(e) => updateColumn2(column.id, 'path', e.target.value)}
                              placeholder={t('json-extract.columnPath')}
                              className={`w-full bg-gray-800/50 border rounded px-3 py-2 text-white text-sm focus:outline-none font-mono ${
                                pathErrors[column.id + '_json2'] 
                                  ? 'border-red-500 focus:border-red-400' 
                                  : 'border-gray-600 focus:border-[#c2e9fb]'
                              }`}
                            />
                            {pathPreviews[column.id + '_json2'] && (
                              <div className="mt-1 text-xs text-gray-400 bg-gray-800/30 rounded px-2 py-1">
                                <span className="text-green-400">Preview:</span> {pathPreviews[column.id + '_json2']}
                              </div>
                            )}
                            {pathErrors[column.id + '_json2'] && (
                              <div className="mt-1 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                                <span className="font-medium">Error:</span> {pathErrors[column.id + '_json2']}
                              </div>
                            )}
                          </div>
                          {columns2.length > 1 && (
                            <button
                              onClick={() => removeColumn2(column.id)}
                              className="text-red-400 hover:text-red-300 p-1 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Extract button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={extractData}
                disabled={isProcessing || !inputText.trim() || !isValidJson || (compareMode && (!inputText2.trim() || !isValidJson2))}
                className="px-6 py-3 bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] text-gray-900 font-medium rounded-lg hover:from-[#8fb3fc] hover:to-[#b1e1fa] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? t('json-extract.processing') : t('json-extract.extractData')}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {/* Results */}
            {(sortedResults.length > 0 || results.length > 0) && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-white font-medium">
                    {compareMode ? t('json-extract.compareResults') : t('json-extract.extractedData')} ({(sortedResults.length > 0 ? sortedResults : results).length} {t('json-extract.rows')})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {/* Copy options */}
                    <div className="flex gap-1">
                      <button
                        onClick={copyMarkdown}
                        className={`text-sm transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded ${
                          copySuccess 
                            ? 'text-green-400 hover:text-green-300 bg-green-500/10' 
                            : 'text-[#a1c4fd] hover:text-[#c2e9fb] hover:bg-[#a1c4fd]/10'
                        }`}
                      >
                        {copySuccess ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                          </svg>
                        )}
                        {copySuccess ? t('json-extract.markdownCopied') : `${language === 'zh' ? '复制' : 'Copy'} Markdown`}
                      </button>
                      <button
                        onClick={copyAsJSON}
                        className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-[#a1c4fd]/10"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                        </svg>
                        {language === 'zh' ? '复制' : 'Copy'} JSON
                      </button>
                    </div>
                    
                    {/* Export options */}
                    <div className="flex gap-1">
                      <button
                        onClick={exportToCSV}
                        className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-[#a1c4fd]/10"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        {language === 'zh' ? '下载' : 'Download'} CSV
                      </button>
                      <button
                        onClick={exportToJSON}
                        className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-[#a1c4fd]/10"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                        </svg>
                        {language === 'zh' ? '下载' : 'Download'} JSON
                      </button>
                      {compareMode && (
                        <button
                          onClick={exportComparisonResults}
                          className="text-[#c2e9fb] hover:text-[#a1c4fd] text-sm transition-colors duration-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-[#c2e9fb]/10"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                          {language === 'zh' ? '下载对比结果' : 'Download Comparison'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        {!compareMode && (
                          <tr className="bg-gray-700/50">
                            {columns.map((column) => (
                              <th key={column.id} className="px-4 py-3 text-left text-white font-medium border-b border-gray-600">
                                <button
                                  onClick={() => handleSort(column.name)}
                                  className="flex items-center gap-2 hover:text-[#a1c4fd] transition-colors duration-200"
                                >
                                  {column.name}
                                  <div className="flex flex-col">
                                    <svg 
                                      className={`w-3 h-3 ${
                                        sortConfig?.key === column.name && sortConfig.direction === 'asc' 
                                          ? 'text-[#a1c4fd]' 
                                          : 'text-gray-500'
                                      }`} 
                                      fill="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M7 14l5-5 5 5z"/>
                                    </svg>
                                    <svg 
                                      className={`w-3 h-3 -mt-1 ${
                                        sortConfig?.key === column.name && sortConfig.direction === 'desc' 
                                          ? 'text-[#a1c4fd]' 
                                          : 'text-gray-500'
                                      }`} 
                                      fill="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M7 10l5 5 5-5z"/>
                                    </svg>
                                  </div>
                                </button>
                              </th>
                            ))}
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {compareMode ? (
                          // Compare mode: show side-by-side comparison
                          <tr>
                            <td className="px-4 py-3 border-b border-gray-700/50">
                              {/* Comparison legend */}
                              <div className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                <h4 className="text-white font-medium mb-2 text-sm flex items-center gap-2">
                                  <svg className="w-4 h-4 text-[#a1c4fd]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                                  </svg>
                                  {t('json-extract.comparisonLegend')}
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                    <span className="text-gray-300">{t('json-extract.legendSame')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-500/20 border border-yellow-500/30 rounded"></div>
                                    <span className="text-gray-300">{t('json-extract.legendDifferent')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded"></div>
                                    <span className="text-gray-300">{t('json-extract.legendOnlyJson1')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500/20 border border-red-500/30 rounded"></div>
                                    <span className="text-gray-300">{t('json-extract.legendOnlyJson2')}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* First JSON Results */}
                                <div>
                                  <h4 className="text-[#a1c4fd] font-medium mb-2 text-sm">
                                    {t('json-extract.jsonData1')} ({results.length} {t('json-extract.rows')})
                                  </h4>
                                  <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-gray-800/50">
                                          {columns.map((column) => (
                                            <th key={column.id} className="px-3 py-2 text-left text-white font-medium text-sm">
                                              <button
                                                onClick={() => handleSort(column.name)}
                                                className="flex items-center gap-1 hover:text-[#a1c4fd] transition-colors duration-200"
                                              >
                                                {column.name}
                                                <div className="flex flex-col">
                                                  <svg 
                                                    className={`w-3 h-3 ${
                                                      sortConfig?.key === column.name && sortConfig.direction === 'asc' 
                                                        ? 'text-[#a1c4fd]' 
                                                        : 'text-gray-500'
                                                    }`} 
                                                    fill="currentColor" 
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path d="M7 14l5-5 5 5z"/>
                                                  </svg>
                                                  <svg 
                                                    className={`w-3 h-3 -mt-1 ${
                                                      sortConfig?.key === column.name && sortConfig.direction === 'desc' 
                                                        ? 'text-[#a1c4fd]' 
                                                        : 'text-gray-500'
                                                    }`} 
                                                    fill="currentColor" 
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path d="M7 10l5 5 5-5z"/>
                                                  </svg>
                                                </div>
                                              </button>
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(sortedResults.length > 0 ? sortedResults : results).map((row, index) => {
                                          const row2 = (sortedResults2.length > 0 ? sortedResults2 : results2)[index];
                                          return (
                                            <tr key={index} className="hover:bg-gray-800/20">
                                              {columns.map((column) => {
                                                const value1 = row[column.name];
                                                const correspondingCol2 = columns2.find(col => col.name === column.name);
                                                const val2 = correspondingCol2 && row2 ? row2[correspondingCol2.name] : undefined;
                                                
                                                return (
                                                  <td key={column.id} className={`px-3 py-2 border-b border-gray-700/30 text-sm rounded-sm ${getComparisonClass(value1, val2, true, !!row2)}`}>
                                                    {formatValue(value1)}
                                                  </td>
                                                );
                                              })}
                                            </tr>
                                          );
                                        })}
                                        {results.length === 0 && (
                                          <tr>
                                            <td colSpan={columns.length} className="px-3 py-4 text-gray-500 text-center text-sm">
                                              No data
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* Second JSON Results */}
                                <div>
                                  <h4 className="text-[#c2e9fb] font-medium mb-2 text-sm">
                                    {t('json-extract.jsonData2')} ({results2.length} {t('json-extract.rows')})
                                  </h4>
                                  <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 overflow-hidden">
                                    <table className="w-full">
                                      <thead>
                                        <tr className="bg-gray-800/50">
                                          {columns2.map((column) => (
                                            <th key={column.id} className="px-3 py-2 text-left text-white font-medium text-sm">
                                              <button
                                                onClick={() => handleSort2(column.name)}
                                                className="flex items-center gap-1 hover:text-[#a1c4fd] transition-colors duration-200"
                                              >
                                                {column.name}
                                                <div className="flex flex-col">
                                                  <svg 
                                                    className={`w-3 h-3 ${
                                                      sortConfig2?.key === column.name && sortConfig2.direction === 'asc' 
                                                        ? 'text-[#a1c4fd]' 
                                                        : 'text-gray-500'
                                                    }`} 
                                                    fill="currentColor" 
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path d="M7 14l5-5 5 5z"/>
                                                  </svg>
                                                  <svg 
                                                    className={`w-3 h-3 -mt-1 ${
                                                      sortConfig2?.key === column.name && sortConfig2.direction === 'desc' 
                                                        ? 'text-[#a1c4fd]' 
                                                        : 'text-gray-500'
                                                    }`} 
                                                    fill="currentColor" 
                                                    viewBox="0 0 24 24"
                                                  >
                                                    <path d="M7 10l5 5 5-5z"/>
                                                  </svg>
                                                </div>
                                              </button>
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(sortedResults2.length > 0 ? sortedResults2 : results2).map((row, index) => {
                                          const row1 = (sortedResults.length > 0 ? sortedResults : results)[index];
                                          return (
                                            <tr key={index} className="hover:bg-gray-800/20">
                                              {columns2.map((column) => {
                                                const value2 = row[column.name];
                                                const correspondingCol1 = columns.find(col => col.name === column.name);
                                                const val1 = correspondingCol1 && row1 ? row1[correspondingCol1.name] : undefined;
                                                
                                                return (
                                                  <td key={column.id} className={`px-3 py-2 border-b border-gray-700/30 text-sm rounded-sm ${getComparisonClass(val1, value2, !!row1, true)}`}>
                                                    {formatValue(value2)}
                                                  </td>
                                                );
                                              })}
                                            </tr>
                                          );
                                        })}
                                        {results2.length === 0 && (
                                          <tr>
                                            <td colSpan={columns2.length} className="px-3 py-4 text-gray-500 text-center text-sm">
                                              No data
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          // Single mode: show normal results
                          (sortedResults.length > 0 ? sortedResults : results).map((row, index) => (
                            <tr key={index} className="hover:bg-gray-700/20">
                              {columns.map((column) => (
                                <td key={column.id} className="px-4 py-3 text-gray-300 border-b border-gray-700/50">
                                  {(() => {
                                    const value = row[column.name];
                                    if (Array.isArray(value)) {
                                      return value.join(', ');
                                    }
                                    if (value === null || value === undefined) {
                                      return '-';
                                    }
                                    return String(value);
                                  })()}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Usage instructions */}
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
                {t('json-extract.usageTitle')}
              </h2>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <code className="bg-gray-700/50 px-2 py-1 rounded">$.properties.title</code> - {t('json-extract.usage1')}</li>
                <li>• <code className="bg-gray-700/50 px-2 py-1 rounded">$.features[*].properties.name</code> - {t('json-extract.usage2')}</li>
                <li>• <code className="bg-gray-700/50 px-2 py-1 rounded">$.data[0].value</code> - {t('json-extract.usage3')}</li>
                <li>• <code className="bg-gray-700/50 px-2 py-1 rounded">$.users[*].profile.email</code> - {t('json-extract.usage4')}</li>
                <li>• <code className="bg-gray-700/50 px-2 py-1 rounded">$.items[*].tags[*]</code> - {t('json-extract.usage5')}</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <footer>
        <Foot />
      </footer>
    </div>
  );
}

export default function JSONExtractToolPage() {
  return (
    <>
      <JSONExtractToolPageContent />
      <StructuredData 
        type="tool" 
        toolName="JSON Path Extractor"
        toolDescription="Extract specific values from JSON data using JSONPath syntax. Supports multi-column extraction, array traversal, CSV export, and comparison mode."
        url="https://tools.mofei.life/json-extract"
      />
    </>
  );
}