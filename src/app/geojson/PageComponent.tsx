"use client"
import { useState, useEffect, Suspense } from 'react';
import { motion } from "motion/react"
import Image from 'next/image';
import { GlassPanel, TextButton } from '@mofei-dev/ui';
import Foot from '@/components/Common/Foot';
import { ToolContentSection, ToolHero, ToolLoadingFallback } from '@/components/Common/ToolLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { event } from '@/components/GoogleAnalytics';
import { useGeoJSONRedirect } from '@/hooks/useGeoJSONRedirect';

function GeoJSONToolPageContent() {
  const { t, language } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [storageMethod, setStorageMethod] = useState<'url' | 'gist'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const [githubUser, setGithubUser] = useState<{login: string, avatar_url: string} | null>(null);
  const [authMethod, setAuthMethod] = useState<'token' | 'oauth'>('oauth');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Use the redirect hook
  useGeoJSONRedirect();

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
      } catch {
        // Clear invalid data
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_user');
      }
    }
    
    if (savedHistory) {
      try {
        const historyData = JSON.parse(savedHistory) as HistoryItem[];
        setHistory(historyData);
      } catch  {
        // Clear invalid history data
        localStorage.removeItem('geojson_history');
      }
    }
  }, []);

  const titleText = t('geojson.title');
  const subtitleText = t('geojson.subtitle');

  // Device flow state
  // const [deviceCode, setDeviceCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [verificationUri, setVerificationUri] = useState('');
  const [showDeviceFlow, setShowDeviceFlow] = useState(false);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentInterval, setCurrentInterval] = useState(2); // Start with 5 seconds
  
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
    event('geojson_github_login_start', 'Tool Usage', `method:oauth|scope:gist`, inputText.length);
    
    try {
      const response = await fetch('/api/github-device', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23lis975wrIv1ap1Wy',
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

      // setDeviceCode(data.device_code);
      setUserCode(data.user_code);
      setVerificationUri(data.verification_uri);
      setShowDeviceFlow(true);
      setCurrentInterval(data.interval); // Use GitHub's recommended interval
      event('geojson_github_device_flow_start', 'Tool Usage', `interval:${data.interval}|expires:${data.expires_in}`, data.expires_in);

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
          event('geojson_github_login_expired', 'Tool Usage', `method:oauth|expires:${data.expires_in}`, data.expires_in);
        }
      }, data.expires_in * 1000);

    } catch (error) {
      console.error('Device flow error:', error);
      setError(error instanceof Error ? error.message : t('geojson.oauthError'));
      setIsLoggingIn(false);
      event('geojson_github_login_failure', 'Tool Usage', `method:oauth|stage:init|error:${error instanceof Error ? error.message : 'unknown'}`, inputText.length);
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
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Ov23lis975wrIv1ap1Wy',
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
          
          const newInterval = data.interval || (currentIntervalSeconds + 2); // Use GitHub's interval or add 5 seconds
          setCurrentInterval(newInterval);
          event('geojson_github_poll_slow_down', 'Tool Usage', `interval:${newInterval}`, newInterval);
          
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
          event('geojson_github_login_success', 'Tool Usage', `method:oauth|user:${userInfo.login}`, data.access_token.length);
          
          // Show success message only for new login (when user wasn't previously logged in)
          const wasLoggedIn = !!githubUser;
          if (!wasLoggedIn) {
            setShareMessage(t('geojson.loginSaved'));
            setTimeout(() => setShareMessage(''), 3000);
          }
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
      event('geojson_github_login_failure', 'Tool Usage', `method:oauth|stage:poll|error:${error instanceof Error ? error.message : 'unknown'}`, inputText.length);
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
      event('geojson_history_add', 'Tool Usage', `method:${gistPath ? 'gist' : 'url'}|history_count:${newHistory.length}`, size);
    } catch {
      // Ignore errors in adding to history
    }
  };

  const clearHistory = () => {
    event('geojson_history_clear', 'Tool Usage', `history_count:${history.length}`, history.length);
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
      event('geojson_copy_device_code_success', 'Tool Usage', `code_length:${userCode.length}`, userCode.length);
    } catch {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = userCode;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShareMessage(t('geojson.shareCopied'));
        setTimeout(() => setShareMessage(''), 3000);
        event('geojson_copy_device_code_fallback', 'Tool Usage', `code_length:${userCode.length}`, userCode.length);
      } catch {
        event('geojson_copy_device_code_failure', 'Tool Usage', `code_length:${userCode.length}`, userCode.length);
      }
      document.body.removeChild(textArea);
    }
  };


  const logout = () => {
    event('geojson_github_logout', 'Tool Usage', githubUser ? `user:${githubUser.login}` : 'user:unknown', githubToken.length);
    setGithubUser(null);
    setGithubToken('');
    setShowDeviceFlow(false);
    setCurrentInterval(2); // Reset to default
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
        const obj = geoJSON as Record<string, unknown>;
        const name = (obj as { name?: string })?.name 
          || (obj as { properties?: { name?: string } })?.properties?.name 
          || ((obj as { features?: Record<string, unknown>[] })?.features?.[0]?.properties as { name?: string } | undefined)?.name;
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
      event('geojson_generate_gist_failure', 'Tool Usage', `status:${response.status}|auth:${githubToken.trim() ? 'token' : 'anonymous'}`, inputText.length);
      if (response.status === 401) {
        throw new Error('Invalid GitHub token');
      } else if (response.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please login with GitHub or provide a token.');
      }
      throw new Error('Failed to create Gist');
    }

    const result = await response.json() as { id: string; owner: { login: string }; files: Record<string, { raw_url: string }> };
    event('geojson_generate_gist_success', 'Tool Usage', `owner:${result.owner.login}|auth:${githubToken.trim() ? 'token' : 'anonymous'}`, inputText.length);
    return `${result.owner.login}/${result.id}`;
  };


  const generatePreviewUrl = async () => {
    if (!inputText.trim()) {
      setPreviewUrl('');
      setError('');
      setWarning('');
      return;
    }

    try {
      const geoJSON = validateGeoJSON(inputText);
      const dataSize = new Blob([inputText]).size;
      event('geojson_validate_success', 'Tool Usage', `method:${storageMethod}|size:${dataSize}`, dataSize);
      
      // Check if user chose gist method
      if (storageMethod === 'gist') {
        setIsUploading(true);
        
        try {
          const gistPath = await createGist(geoJSON);
          const currentPath = window.location.pathname;
          const currentOrigin = window.location.origin;
          const url = `${currentOrigin}${currentPath}?result=${encodeURIComponent(`gist:${gistPath}`)}`;
          
          setPreviewUrl(url);
          setError('');
          setWarning('');
          
          // Add to history
          addToHistory(url, gistPath);
          
          event('geojson_url_generate_success', 'Tool Usage', `method:gist|size:${dataSize}`, inputText.length);
        } catch (gistError: unknown) {
          setError(gistError instanceof Error ? gistError.message : t('geojson.gistError'));
          setPreviewUrl('');
          event('geojson_url_generate_failure', 'Tool Usage', `method:gist|size:${dataSize}`, inputText.length);
        } finally {
          setIsUploading(false);
        }
      } else {
        // Use URL method - warn if file is too large but still generate
        const encodedGeoJSON = encodeURIComponent(JSON.stringify(geoJSON));
        const currentPath = window.location.pathname;
        const currentOrigin = window.location.origin;
        const url = `${currentOrigin}${currentPath}?result=${encodedGeoJSON}`;
        
        setPreviewUrl(url);
        
        // Show warning for large files but still generate the URL
        if (dataSize > 8000) {
          setWarning(t('geojson.fileTooLargeForUrl'));
        } else {
          setWarning('');
        }
        setError('');
        
        // Add to history
        addToHistory(url);
        
        event('geojson_url_generate_success', 'Tool Usage', `method:url|size:${dataSize}|large:${dataSize > 8000}`, inputText.length);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('geojson.validationError'));
      setPreviewUrl('');
      setWarning('');
      event('geojson_validate_failure', 'Tool Usage', `method:${storageMethod}|error:${err instanceof Error ? err.message : 'unknown'}`, inputText.length);
      event('geojson_url_generate_failure', 'Tool Usage', `method:${storageMethod}|reason:validation`, inputText.length);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      event('geojson_copy_preview_url_success', 'Tool Usage', `method:${text.includes('gist%3A') || text.includes('gist:') ? 'gist' : 'url'}`, text.length);
    } catch {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        event('geojson_copy_preview_url_fallback', 'Tool Usage', `method:${text.includes('gist%3A') || text.includes('gist:') ? 'gist' : 'url'}`, text.length);
      } catch {
        event('geojson_copy_preview_url_failure', 'Tool Usage', `method:${text.includes('gist%3A') || text.includes('gist:') ? 'gist' : 'url'}`, text.length);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleClear = () => {
    event('geojson_clear', 'Tool Usage', `input_length:${inputText.length}|has_preview:${Boolean(previewUrl)}`, inputText.length);
    setInputText('');
    setPreviewUrl('');
    setError('');
    setWarning('');
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
    event('geojson_example_load', 'Tool Usage', 'example:feature_collection', 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-10">
        <ToolHero
          backHref={language === 'en' ? '/' : '/zh'}
          backLabel={t('geojson.backToTools')}
          title={titleText}
          subtitle={subtitleText}
          infoSections={[
            {
              title: language === 'zh' ? '什么是 GeoJSON？' : 'What is GeoJSON?',
              body: language === 'zh'
                ? 'GeoJSON 是用 JSON 表示点、线、面等地理要素的开放格式，常用于地图预览、空间数据交换和 Web GIS 调试。'
                : 'GeoJSON is an open JSON format for points, lines, polygons, and other geographic features, often used for map previews, spatial exchange, and Web GIS debugging.',
            },
            {
              title: language === 'zh' ? '如何使用这个工具？' : 'How to use this tool',
              body: language === 'zh'
                ? '粘贴 GeoJSON 后生成 geojson.io 预览链接。小数据可直接放进 URL，大数据可通过 GitHub Gist 生成更稳定的分享链接。'
                : 'Paste GeoJSON to generate a geojson.io preview link. Small data can live in the URL; larger data can use GitHub Gist for a more stable share link.',
            },
          ]}
        />

        <ToolContentSection>
          <motion.div
            className="w-full space-y-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
          <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-white/84">
                {t('geojson.inputLabel')}
              </label>
              <div className="flex items-center gap-2">
                <TextButton onClick={handleExampleLoad}>
                  {t('geojson.loadExample')}
                </TextButton>
                <TextButton onClick={handleClear}>
                  {t('geojson.clear')}
                </TextButton>
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
              className="h-72 w-full resize-none rounded-2xl border border-white/[0.08] bg-slate-950/42 px-4 py-3 font-mono text-sm text-white placeholder-white/32 outline-none transition-colors focus:border-cyan-200/35"
            />
          </GlassPanel>

          {/* Share success message */}
          {shareMessage && (
            <motion.div 
              className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.08] p-3 text-center text-sm text-emerald-100"
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
              className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/84">{t('geojson.storageMethod')}:</span>
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
                      onChange={(e) => {
                        setStorageMethod(e.target.value as 'url' | 'gist');
                        event('geojson_storage_method_change', 'Tool Usage', `method:${e.target.value}|size:${new Blob([inputText]).size}`, inputText.length);
                      }}
                      className="text-[#a1c4fd] focus:ring-[#a1c4fd]"
                    />
                    <span className="text-white/72">{t('geojson.urlMethod')}</span>
                    <span className="text-xs text-white/42">({t('geojson.urlMethodDesc')})</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="storageMethod"
                      value="gist"
                      checked={storageMethod === 'gist'}
                      onChange={(e) => {
                        setStorageMethod(e.target.value as 'url' | 'gist');
                        event('geojson_storage_method_change', 'Tool Usage', `method:${e.target.value}|size:${new Blob([inputText]).size}`, inputText.length);
                      }}
                      className="text-[#a1c4fd] focus:ring-[#a1c4fd]"
                    />
                    <span className="text-white/72">{t('geojson.gistMethod')}</span>
                    <span className="text-xs text-white/42">({t('geojson.gistMethodDesc')})</span>
                  </label>
                </div>
                
                {storageMethod === 'gist' && (
                  <div className="mt-3 rounded-2xl border border-cyan-200/15 bg-cyan-300/[0.06] p-3">
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
                            <p className="text-sm text-cyan-100">
                              {t('geojson.loggedInAs')} <strong>{githubUser.login}</strong>
                            </p>
                            <p className="text-xs text-white/42">
                              {t('geojson.gistWillBeCreated')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={logout}
                          className="text-xs text-white/42 transition-colors hover:text-white"
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
                              onChange={(e) => {
                                setAuthMethod(e.target.value as 'token' | 'oauth');
                                event('geojson_github_auth_method_change', 'Tool Usage', `method:${e.target.value}`, inputText.length);
                              }}
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
                              onChange={(e) => {
                                setAuthMethod(e.target.value as 'token' | 'oauth');
                                event('geojson_github_auth_method_change', 'Tool Usage', `method:${e.target.value}`, inputText.length);
                              }}
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
                                    {t('geojson.deviceFlow.pollingInterval')}: {currentInterval} {t('geojson.deviceFlow.seconds')}
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
                                  event('geojson_github_token_clear', 'Tool Usage', 'method:manual', 0);
                                }
                              }}
                              onBlur={() => {
                                if (githubToken.trim()) {
                                  event('geojson_github_token_enter', 'Tool Usage', `method:manual|length:${githubToken.trim().length}`, githubToken.trim().length);
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

          <div className="flex justify-center">
            <button
              onClick={generatePreviewUrl}
              disabled={isUploading || !inputText.trim()}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isUploading ? t('geojson.uploading') : t('geojson.generate')}
            </button>
          </div>

          <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-white/84">
                {t('geojson.outputLabel')}
              </label>
              <div className="flex items-center gap-2">
                {previewUrl && !error && (
                  <>
                    <TextButton onClick={() => handleCopy(previewUrl)}>
                      {t('geojson.copy')}
                    </TextButton>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => event('geojson_open_preview', 'Tool Usage', `method:${previewUrl.includes('gist%3A') || previewUrl.includes('gist:') ? 'gist' : 'url'}`, previewUrl.length)}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-50"
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
            
            {/* Warning message */}
            {warning && (
              <div className="mb-3 rounded-2xl border border-yellow-300/25 bg-yellow-300/[0.08] p-3 text-sm text-yellow-100">
                {warning}
              </div>
            )}
            
            <div className="relative">
              <textarea
                value={error || previewUrl}
                readOnly
                placeholder={t('geojson.resultPlaceholder')}
                className={`h-32 w-full resize-none rounded-2xl border bg-slate-950/42 px-4 py-3 text-sm placeholder-white/32 outline-none ${
                  error 
                    ? 'border-red-300/35 text-red-200'
                    : 'border-white/[0.08] text-white'
                }`}
              />
            </div>
          </GlassPanel>

          {/* History */}
          {history.length > 0 && (
            <motion.div
              className="rounded-[8px] border border-white/[0.08] bg-white/[0.045] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.20)] backdrop-blur md:p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white/84">
                  {t('geojson.history')}
                </h3>
                <TextButton onClick={clearHistory} className="text-sm text-white/44 hover:text-rose-100">
                  {t('geojson.clearHistory')}
                </TextButton>
              </div>
              <div className="max-h-60 space-y-2 overflow-y-auto">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 transition-colors hover:border-white/[0.14]">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-white">{item.name}</span>
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-xs text-white/52">{formatFileSize(item.size)}</span>
                      </div>
                      <div className="text-xs text-white/38">{formatTimeAgo(item.timestamp)}</div>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      {item.gistId && (
                        <a
                          href={`https://gist.github.com/${item.gistId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => event('geojson_history_open_gist', 'Tool Usage', `gist:${item.gistId}|size:${item.size}`, item.size)}
                          className="flex items-center gap-1 text-xs text-cyan-100/70 transition-colors hover:text-cyan-100"
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
                        onClick={() => event('geojson_history_open_preview', 'Tool Usage', `method:${item.gistId ? 'gist' : 'url'}|size:${item.size}`, item.size)}
                        className="flex items-center gap-1 text-xs text-cyan-100/70 transition-colors hover:text-cyan-100"
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
            className="rounded-[8px] border border-white/[0.08] bg-white/[0.045] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.20)] backdrop-blur md:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h3 className="mb-3 text-sm font-semibold text-white/84">
              {t('geojson.usageTitle')}
            </h3>
            <ul className="space-y-2 text-sm leading-6 text-white/58">
              {[t('geojson.usage1'), t('geojson.usage2'), t('geojson.usage3'), t('geojson.usage4'), t('geojson.usage5')].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/38" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
        </ToolContentSection>
      </main>

      <footer>
        <Foot />
      </footer>
    </div>
  );
}

function GeoJSONToolPageFallback() {
  return <ToolLoadingFallback className="bg-gray-900" />;
}

export default function GeoJSONToolPage() {
  return (
    <Suspense fallback={<GeoJSONToolPageFallback />}>
      <GeoJSONToolPageContent />
    </Suspense>
  );
}
