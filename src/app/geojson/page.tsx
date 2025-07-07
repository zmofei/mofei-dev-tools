"use client"
import { useState, useEffect, Suspense, useCallback } from 'react';
import { motion } from "motion/react"
import Link from 'next/link';
import Image from 'next/image';
import Foot from '@/components/Common/Foot';
import { useLanguage } from '@/contexts/LanguageContext';
import { event } from '@/components/GoogleAnalytics';

function GeoJSONToolPageContent() {
  const { t, language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [storageMethod, setStorageMethod] = useState<'url' | 'gist'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [githubUser, setGithubUser] = useState<{login: string, avatar_url: string} | null>(null);
  const [authMethod, setAuthMethod] = useState<'token' | 'oauth'>('oauth');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Load saved login state and history on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token');
    const savedUser = localStorage.getItem('github_user');
    const savedHistory = localStorage.getItem('geojson_history');
    
    if (savedToken && savedUser) {
      try {
        const userData = JSON.parse(savedUser) as { login: string; avatar_url: string };
        setGithubToken(savedToken);
        setGithubUser(userData);
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_user');
      }
    }
    
    if (savedHistory) {
      try {
        const historyData = JSON.parse(savedHistory) as HistoryItem[];
        setHistory(historyData);
      } catch (error) {
        // Clear invalid history data
        localStorage.removeItem('geojson_history');
      }
    }
  }, []);

  const titleText = t('geojson.title');
  const subtitleText = t('geojson.subtitle');

  // Device flow state
  const [deviceCode, setDeviceCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [verificationUri, setVerificationUri] = useState('');
  const [showDeviceFlow, setShowDeviceFlow] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentInterval, setCurrentInterval] = useState(5); // Start with 5 seconds
  
  // History state
  interface HistoryItem {
    id: string;
    name: string;
    url: string;
    gistId?: string;
    timestamp: number;
    size: number;
  }
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const initiateDeviceFlow = async () => {
    setIsLoggingIn(true);
    setError('');
    
    try {
      const response = await fetch('/api/github-device', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'Ov23lis975wrIv1ap1Wy',
          scope: 'gist'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate device flow');
      }

      const data = await response.json() as {
        device_code: string;
        user_code: string;
        verification_uri: string;
        expires_in: number;
        interval: number;
      };

      setDeviceCode(data.device_code);
      setUserCode(data.user_code);
      setVerificationUri(data.verification_uri);
      setShowDeviceFlow(true);
      setCurrentInterval(data.interval); // Use GitHub's recommended interval

      // Start polling for token with GitHub's recommended interval
      const startPolling = (intervalSeconds: number) => {
        const interval = setInterval(() => {
          pollForToken(data.device_code, intervalSeconds);
        }, intervalSeconds * 1000);
        setPollInterval(interval);
        return interval;
      };

      const interval = startPolling(data.interval);

      // Auto-clear after expiration
      setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          setPollInterval(null);
          setShowDeviceFlow(false);
          setIsLoggingIn(false);
        }
      }, data.expires_in * 1000);

    } catch (error) {
      console.error('Device flow error:', error);
      setError(error instanceof Error ? error.message : t('geojson.oauthError'));
      setIsLoggingIn(false);
    }
  };

  const pollForToken = async (deviceCode: string, currentIntervalSeconds: number) => {
    try {
      const response = await fetch('/api/github-token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'Ov23lis975wrIv1ap1Wy',
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      });

      if (!response.ok) {
        return; // Continue polling
      }

      const data = await response.json() as { 
        access_token?: string; 
        error?: string;
        error_description?: string;
        interval?: number;
      };

      if (data.error) {
        if (data.error === 'authorization_pending') {
          return; // Continue polling
        } else if (data.error === 'slow_down') {
          // GitHub is asking us to slow down - restart polling with longer interval
          console.log('GitHub asked to slow down, increasing interval');
          if (pollInterval) {
            clearInterval(pollInterval);
          }
          
          const newInterval = data.interval || (currentIntervalSeconds + 5); // Use GitHub's interval or add 5 seconds
          setCurrentInterval(newInterval);
          
          const interval = setInterval(() => {
            pollForToken(deviceCode, newInterval);
          }, newInterval * 1000);
          setPollInterval(interval);
          return;
        } else {
          throw new Error(data.error_description || data.error);
        }
      }

      if (data.access_token) {
        // Clear polling
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }
        
        setGithubToken(data.access_token);
        
        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${data.access_token}`,
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json() as { login: string; avatar_url: string };
          const userInfo = {
            login: userData.login,
            avatar_url: userData.avatar_url
          };
          
          setGithubUser(userInfo);
          
          // Save login state to localStorage
          localStorage.setItem('github_token', data.access_token);
          localStorage.setItem('github_user', JSON.stringify(userInfo));
          
          // Show success message
          setShareMessage(t('geojson.loginSaved'));
          setTimeout(() => setShareMessage(''), 3000);
        }

        setShowDeviceFlow(false);
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error('Token polling error:', error);
      setError(error instanceof Error ? error.message : t('geojson.oauthError'));
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
      setShowDeviceFlow(false);
      setIsLoggingIn(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const addToHistory = (url: string, gistPath?: string) => {
    try {
      const geoJSON = validateGeoJSON(inputText);
      const name = geoJSON.name || geoJSON.properties?.name || `GeoJSON-${Date.now()}`;
      const size = new Blob([inputText]).size;
      
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        name: name,
        url: url,
        gistId: gistPath,
        timestamp: Date.now(),
        size: size
      };
      
      const newHistory = [historyItem, ...history].slice(0, 20); // Keep only 20 recent items
      setHistory(newHistory);
      localStorage.setItem('geojson_history', JSON.stringify(newHistory));
    } catch (error) {
      // Ignore errors in adding to history
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('geojson_history');
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return `${days}${language === 'zh' ? '天' : 'd'} ${t('geojson.timeAgo')}`;
    } else if (hours > 0) {
      return `${hours}${language === 'zh' ? '小时' : 'h'} ${t('geojson.timeAgo')}`;
    } else if (minutes > 0) {
      return `${minutes}${language === 'zh' ? '分钟' : 'm'} ${t('geojson.timeAgo')}`;
    } else {
      return language === 'zh' ? '刚刚' : 'Just now';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const validateGeoJSON = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      
      // Basic GeoJSON validation
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('GeoJSON must be an object');
      }
      
      if (!parsed.type) {
        throw new Error('GeoJSON must have a "type" property');
      }
      
      const validTypes = ['Feature', 'FeatureCollection', 'Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'];
      if (!validTypes.includes(parsed.type)) {
        throw new Error('Invalid GeoJSON type');
      }
      
      return parsed;
    } catch {
      throw new Error('Invalid JSON format');
    }
  };

  const copyUserCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      setShareMessage(t('geojson.shareCopied'));
      setTimeout(() => setShareMessage(''), 3000);
    } catch {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = userCode;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        // @ts-expect-error - execCommand is deprecated but still needed as fallback
        document.execCommand('copy');
        setShareMessage(t('geojson.shareCopied'));
        setTimeout(() => setShareMessage(''), 3000);
      } catch {
        // Silent fail
      }
      document.body.removeChild(textArea);
    }
  };


  const logout = () => {
    setGithubUser(null);
    setGithubToken('');
    setShowDeviceFlow(false);
    setCurrentInterval(5); // Reset to default
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
    
    // Clear saved login state
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
  };

  const createGist = async (geoJSON: object) => {
    // Try to get a meaningful filename from the GeoJSON data
    const getFileName = () => {
      if (typeof geoJSON === 'object' && geoJSON !== null) {
        const obj = geoJSON as any;
        const name = obj.name || obj.properties?.name || obj.features?.[0]?.properties?.name;
        if (name && typeof name === 'string') {
          // Clean the name and ensure it's a valid filename
          const cleanName = name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
          return `${cleanName}.geojson`;
        }
      }
      return 'geojson_data.geojson';
    };

    const fileName = getFileName();
    
    const gistData = {
      description: "GeoJSON data for visualization - Created by Mofei Dev Tools",
      public: true,
      files: {
        [fileName]: {
          content: JSON.stringify(geoJSON, null, 2)
        }
      }
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization if token is provided
    if (githubToken.trim()) {
      headers['Authorization'] = `token ${githubToken.trim()}`;
    }

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers,
      body: JSON.stringify(gistData)
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid GitHub token');
      } else if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please login with GitHub or provide a token.');
      }
      throw new Error('Failed to create Gist');
    }

    const result = await response.json() as { id: string; owner: { login: string }; files: Record<string, { raw_url: string }> };
    return `${result.owner.login}/${result.id}`;
  };


  const generatePreviewUrl = async () => {
    if (!inputText.trim()) {
      setPreviewUrl('');
      setError('');
      return;
    }

    try {
      const geoJSON = validateGeoJSON(inputText);
      const dataSize = new Blob([inputText]).size;
      
      // Check if file is large (> 8KB, URL limit is ~2000 chars) or user chose gist
      if (dataSize > 8000 || storageMethod === 'gist') {
        setIsUploading(true);
        
        try {
          const gistPath = await createGist(geoJSON);
          const url = `https://geojson.io/#id=gist:${gistPath}`;
          
          setPreviewUrl(url);
          setError('');
          
          // Add to history
          addToHistory(url, gistPath);
          
          // Track generation event
          event('geojson_generate_gist', 'Tool Usage', 'GeoJSON Gist Generate', inputText.length);
        } catch (gistError: unknown) {
          setError(gistError instanceof Error ? gistError.message : t('geojson.gistError'));
          setPreviewUrl('');
        } finally {
          setIsUploading(false);
        }
      } else {
        // Use URL method for smaller files
        const encodedGeoJSON = encodeURIComponent(JSON.stringify(geoJSON));
        const url = `https://geojson.io/#data=data:application/json,${encodedGeoJSON}`;
        
        setPreviewUrl(url);
        setError('');
        
        // Add to history
        addToHistory(url);
        
        // Track generation event
        event('geojson_generate_url', 'Tool Usage', 'GeoJSON URL Generate', inputText.length);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('geojson.validationError'));
      setPreviewUrl('');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Track copy event
      event('copy_result', 'Tool Usage', 'Copy GeoJSON URL', text.length);
    } catch {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        // @ts-expect-error - execCommand is deprecated but still needed as fallback
        document.execCommand('copy');
      } catch {
        // Silent fail if execCommand is not supported
      }
      document.body.removeChild(textArea);
      // Track copy event (fallback)
      event('copy_result_fallback', 'Tool Usage', 'Copy GeoJSON URL Fallback', text.length);
    }
  };

  const handleClear = () => {
    setInputText('');
    setPreviewUrl('');
    setError('');
  };

  const handleExampleLoad = () => {
    const exampleGeoJSON = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "name": "Example Point"
          },
          "geometry": {
            "type": "Point",
            "coordinates": [116.3974, 39.9093]
          }
        }
      ]
    };
    
    setInputText(JSON.stringify(exampleGeoJSON, null, 2));
  };

  return (
    <div className="min-h-screen flex flex-col">
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
              {t('geojson.backToTools')}
            </Link>
          </motion.div>

          <motion.h1 
            className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] leading-tight text-center
              text-2xl mb-4
              md:text-4xl md:mb-6
              lg:text-5xl lg:mb-8
              `}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {titleText}
          </motion.h1>
          
          <motion.p 
            className="text-gray-300/90 text-base md:text-lg lg:text-xl font-medium leading-relaxed tracking-wide text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            {subtitleText}
          </motion.p>
        </div>
      </div>

      <div className='max-w-[2000px] mx-auto px-5 md:px-10 lg:px-16 py-6 md:py-8 lg:py-12'>
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Input area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">
                {t('geojson.inputLabel')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleExampleLoad}
                  className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200"
                >
                  {t('geojson.loadExample')}
                </button>
                <button
                  onClick={handleClear}
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {t('geojson.clear')}
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => {
                const newValue = e.target.value;
                setInputText(newValue);
                
                // Check file size and suggest storage method
                const dataSize = new Blob([newValue]).size;
                const isLarge = dataSize > 8000;
                setIsLargeFile(isLarge);
                
                // Auto-suggest gist for large files
                if (isLarge && storageMethod === 'url') {
                  setStorageMethod('gist');
                }
              }}
              placeholder={t('geojson.placeholder')}
              className="w-full h-64 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#a1c4fd] resize-none font-mono text-sm"
            />
          </div>

          {/* Share success message */}
          {shareMessage && (
            <motion.div 
              className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {shareMessage}
            </motion.div>
          )}

          {/* Storage method selection and file size info */}
          {inputText && (
            <motion.div 
              className="mb-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{t('geojson.storageMethod')}:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isLargeFile ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {isLargeFile ? t('geojson.largeFile') : t('geojson.smallFile')} 
                    ({Math.round(new Blob([inputText]).size / 1024 * 10) / 10}KB)
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="storageMethod"
                      value="url"
                      checked={storageMethod === 'url'}
                      onChange={(e) => setStorageMethod(e.target.value as 'url' | 'gist')}
                      className="text-[#a1c4fd] focus:ring-[#a1c4fd]"
                    />
                    <span className="text-gray-300">{t('geojson.urlMethod')}</span>
                    <span className="text-xs text-gray-400">({t('geojson.urlMethodDesc')})</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="storageMethod"
                      value="gist"
                      checked={storageMethod === 'gist'}
                      onChange={(e) => setStorageMethod(e.target.value as 'url' | 'gist')}
                      className="text-[#a1c4fd] focus:ring-[#a1c4fd]"
                    />
                    <span className="text-gray-300">{t('geojson.gistMethod')}</span>
                    <span className="text-xs text-gray-400">({t('geojson.gistMethodDesc')})</span>
                  </label>
                </div>
                
                {storageMethod === 'gist' && (
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                    {githubUser ? (
                      // User is logged in
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Image 
                            src={githubUser.avatar_url} 
                            alt={githubUser.login}
                            className="w-8 h-8 rounded-full"
                            width={32}
                            height={32}
                          />
                          <div>
                            <p className="text-sm text-blue-300">
                              {t('geojson.loggedInAs')} <strong>{githubUser.login}</strong>
                            </p>
                            <p className="text-xs text-gray-400">
                              {t('geojson.gistWillBeCreated')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={logout}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          {t('geojson.logout')}
                        </button>
                      </div>
                    ) : (
                      // User is not logged in
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="authMethod"
                              value="oauth"
                              checked={authMethod === 'oauth'}
                              onChange={(e) => setAuthMethod(e.target.value as 'token' | 'oauth')}
                              className="text-[#a1c4fd] focus:ring-[#a1c4fd]"
                            />
                            <span className="text-blue-300 text-sm">{t('geojson.loginWithGitHub')}</span>
                          </label>
                          
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="authMethod"
                              value="token"
                              checked={authMethod === 'token'}
                              onChange={(e) => setAuthMethod(e.target.value as 'token' | 'oauth')}
                              className="text-[#a1c4fd] focus:ring-[#a1c4fd]"
                            />
                            <span className="text-blue-300 text-sm">{t('geojson.useToken')}</span>
                          </label>
                        </div>

                        {authMethod === 'oauth' ? (
                          <div>
                            {!showDeviceFlow ? (
                              <button
                                onClick={initiateDeviceFlow}
                                disabled={isLoggingIn}
                                className="w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-600"
                              >
                                {isLoggingIn ? (
                                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                )}
                                {isLoggingIn ? t('geojson.signingIn') : t('geojson.signInWithGitHub')}
                              </button>
                            ) : (
                              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                                <div className="text-center">
                                  <div className="flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                  </div>
                                  <p className="text-white text-sm mb-2">
                                    {t('geojson.deviceFlow.instruction')}
                                  </p>
                                  <div className="bg-gray-900 border border-gray-600 rounded p-3 mb-3">
                                    <div className="flex items-center justify-between">
                                      <code className="text-blue-300 font-mono text-lg font-bold">{userCode}</code>
                                      <button
                                        onClick={copyUserCode}
                                        className="text-blue-400 hover:text-blue-300 ml-2"
                                        title={t('geojson.deviceFlow.copyCode')}
                                      >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                  <a
                                    href={verificationUri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                                    </svg>
                                    {t('geojson.deviceFlow.openGitHub')}
                                  </a>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {t('geojson.deviceFlow.waiting')}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    轮询间隔: {currentInterval}秒
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm text-blue-300">
                                {t('geojson.githubToken')}
                              </label>
                              <button
                                onClick={() => setShowTokenHelp(!showTokenHelp)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                                </svg>
                                {t('geojson.howToGet')}
                              </button>
                            </div>
                    
                            {showTokenHelp && (
                              <motion.div 
                                className="mb-3 p-3 bg-gray-800/50 rounded border border-gray-600"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <h4 className="text-sm font-medium text-white mb-2">
                                  {t('geojson.tokenStepsTitle')}
                                </h4>
                                <ol className="text-xs text-gray-300 space-y-1 list-decimal list-inside">
                                  <li>{t('geojson.tokenStep1')}</li>
                                  <li>{t('geojson.tokenStep2')}</li>
                                  <li>{t('geojson.tokenStep3')}</li>
                                  <li>{t('geojson.tokenStep4')}</li>
                                  <li>{t('geojson.tokenStep5')}</li>
                                </ol>
                                <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                                  <p className="text-xs text-yellow-300">
                                    <strong>{t('geojson.tokenNote')}:</strong> {t('geojson.tokenNoteDesc')}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                            
                            <input
                              type="password"
                              value={githubToken}
                              onChange={(e) => {
                                const token = e.target.value;
                                setGithubToken(token);
                                
                                // Save token to localStorage when manually entered
                                if (token.trim()) {
                                  localStorage.setItem('github_token', token.trim());
                                } else {
                                  localStorage.removeItem('github_token');
                                  localStorage.removeItem('github_user');
                                }
                              }}
                              placeholder={t('geojson.tokenPlaceholder')}
                              className="w-full bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-[#a1c4fd]"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                              {t('geojson.tokenHelp')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {isLargeFile && storageMethod === 'url' && (
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-300 text-sm">
                  {t('geojson.largeSizeWarning')}
                </div>
              )}
            </motion.div>
          )}

          {/* Generate button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={generatePreviewUrl}
              disabled={isUploading}
              className="px-6 py-3 bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] text-gray-900 font-medium rounded-lg hover:from-[#8fb3fc] hover:to-[#b1e1fa] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isUploading ? t('geojson.uploading') : t('geojson.generate')}
            </button>
          </div>

          {/* Output area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">
                {t('geojson.outputLabel')}
              </label>
              <div className="flex gap-2">
                {previewUrl && !error && (
                  <>
                    <button
                      onClick={() => handleCopy(previewUrl)}
                      className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      {t('geojson.copy')}
                    </button>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] hover:from-[#8fb3fc] hover:to-[#b1e1fa] text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                      </svg>
                      {t('geojson.openPreview')}
                    </a>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <textarea
                value={error || previewUrl}
                readOnly
                placeholder={t('geojson.resultPlaceholder')}
                className={`w-full h-32 bg-gray-800/50 border rounded-lg px-4 py-3 placeholder-gray-400 resize-none text-sm ${
                  error 
                    ? 'border-red-500 text-red-400' 
                    : 'border-gray-700 text-white'
                }`}
              />
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <motion.div 
              className="bg-gray-800/30 rounded-lg p-4 border border-gray-700 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#a1c4fd]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,3A9,9 0 0,0 4,12H1L4.8919,16.1406L5,16L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.3,19 9.8,18.4 8.7,17.4L7.3,18.8C8.8,20.1 10.8,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3M15,8V12L18,14L17,15.5L13.5,13V8H15Z"/>
                  </svg>
                  {t('geojson.history')}
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {t('geojson.clearHistory')}
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-900/30 rounded border border-gray-600 hover:border-gray-500 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium truncate">{item.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">{formatFileSize(item.size)}</span>
                      </div>
                      <div className="text-xs text-gray-400">{formatTimeAgo(item.timestamp)}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {item.gistId && (
                        <a
                          href={`https://gist.github.com/${item.gistId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition-colors"
                          title={t('geojson.viewGist')}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          Gist
                        </a>
                      )}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#a1c4fd] hover:text-[#c2e9fb] text-xs flex items-center gap-1 transition-colors"
                        title={t('geojson.openPreviewNew')}
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                        </svg>
                        {t('geojson.openPreviewNew')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Usage instructions */}
          <motion.div 
            className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="text-white font-medium mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#a1c4fd]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {t('geojson.usageTitle')}
            </h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• {t('geojson.usage1')}</li>
              <li>• {t('geojson.usage2')}</li>
              <li>• {t('geojson.usage3')}</li>
              <li>• {t('geojson.usage4')}</li>
              <li>• {t('geojson.usage5')}</li>
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

function GeoJSONToolPageFallback() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <main className="flex-1 pt-20 2xl:pt-22">
        <div className="max-w-[2000px] mx-auto px-5 md:px-10 lg:px-16 py-6 md:py-8 lg:py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-white">Loading...</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GeoJSONToolPage() {
  return (
    <Suspense fallback={<GeoJSONToolPageFallback />}>
      <GeoJSONToolPageContent />
    </Suspense>
  );
}