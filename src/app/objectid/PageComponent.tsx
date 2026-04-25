"use client"
import { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import {
  GlassPanel,
  StatusToast,
} from '@mofei-dev/ui';
import Foot from '@/components/Common/Foot';
import { ToolContentSection, ToolHero, ToolLoadingFallback, ToolPageShell } from '@/components/Common/ToolLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { event } from '@/components/GoogleAnalytics';

function LabelIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.045] text-white/58">
      {children}
    </span>
  );
}

function IdIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 6.75h10M7 12h10M7 17.25h6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.75 4.75h12.5v14.5H5.75z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 7.75v4.5l3 1.75" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.7 8.2A7.25 7.25 0 1112 19.25a7.2 7.2 0 01-5.1-2.1" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.75 4.75v4.5h4.5" />
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

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.75 8.75v8M12 8.75v8M15.25 8.75v8" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.75 6.25h12.5M9 6.25l.75-2h4.5l.75 2M7.25 6.25l.75 13h8l.75-13" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.75 11a7.25 7.25 0 0112.4-5.1L19.25 8" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19.25 4.75V8h-3.25M19.25 13a7.25 7.25 0 01-12.4 5.1L4.75 16" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.75 19.25V16H8" />
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

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const HISTORY_KEY = 'objectid-history';

function isValidObjectId(value: string) {
  return OBJECT_ID_PATTERN.test(value);
}

function ObjectIdToolPageContent() {
  const { language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [generatedId, setGeneratedId] = useState('');
  const [customTimestamp, setCustomTimestamp] = useState('');
  const [useCustomTimestamp, setUseCustomTimestamp] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const messageTimerRef = useRef<number | null>(null);
  const trackedUrlIdRef = useRef('');
  const [history, setHistory] = useState<Array<{
    id: string;
    objectId: string;
    timestamp: number;
    readable: string;
  }>>([]);

  const titleText = language === 'zh' ? "ObjectID 生成器" : "ObjectID Generator";
  const subtitleText = language === 'zh' 
    ? "生成 MongoDB ObjectID，支持自定义时间戳" 
    : "Generate MongoDB ObjectID with optional custom timestamp";

  const trackObjectIdEvent = useCallback((action: string, label: string, value?: number) => {
    event(`objectid_${action}`, 'Tool Usage', `ObjectID ${label}; lang=${language}`, value);
  }, [language]);

  const showMessage = useCallback((message: string) => {
    if (messageTimerRef.current) {
      window.clearTimeout(messageTimerRef.current);
    }

    setShareMessage(message);
    messageTimerRef.current = window.setTimeout(() => {
      setShareMessage('');
      messageTimerRef.current = null;
    }, 3000);
  }, []);

  const updateUrlId = useCallback((objectId: string) => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id') === objectId) return;

    params.set('id', objectId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch {
      // Keep the tool usable when browser storage is unavailable or invalid.
    }
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  const generateObjectId = useCallback((timestamp?: number) => {
    const now = timestamp || Date.now();
    const timestampHex = Math.floor(now / 1000).toString(16).padStart(8, '0');
    
    // Generate 5 random bytes for machine/process identifier
    const randomBytes = Array.from({ length: 5 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
    
    // Generate 3-byte counter (simulate incrementing counter)
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    
    return timestampHex + randomBytes + counter;
  }, []);

  const extractTimestamp = useCallback((objectId: string): number | null => {
    if (!isValidObjectId(objectId)) return null;
    try {
      const timestampHex = objectId.substring(0, 8);
      return parseInt(timestampHex, 16) * 1000;
    } catch {
      return null;
    }
  }, []);

  const saveToHistory = useCallback((objectId: string) => {
    if (!isValidObjectId(objectId)) return;

    const newHistoryItem = {
      id: Date.now().toString(),
      objectId,
      timestamp: Date.now(),
      readable: new Date(extractTimestamp(objectId) || Date.now()).toISOString()
    };

    setHistory(prev => {
      const filtered = prev.filter(item => item.objectId !== objectId);
      const newHistory = [newHistoryItem, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch {
        // Ignore storage failures; the generated ID still remains usable.
      }
      return newHistory;
    });
  }, [extractTimestamp]);

  const handleGenerate = useCallback((options: { saveToHistory?: boolean; track?: boolean } = {}) => {
    const shouldSaveToHistory = options.saveToHistory ?? true;
    const shouldTrack = options.track ?? true;
    let timestamp: number | undefined;
    
    if (useCustomTimestamp && customTimestamp) {
      const customDate = new Date(customTimestamp);
      if (!isNaN(customDate.getTime())) {
        timestamp = customDate.getTime();
      }
    }
    
    const newId = generateObjectId(timestamp);
    setGeneratedId(newId);
    updateUrlId(newId);

    if (shouldSaveToHistory) {
      saveToHistory(newId);
    }

    // Track event
    if (shouldTrack) {
      trackObjectIdEvent(
        'generate_success',
        `Generate success; custom_timestamp_enabled=${useCustomTimestamp}; custom_timestamp_valid=${Boolean(timestamp)}; history_saved=${shouldSaveToHistory}; id_length=${newId.length}`,
        newId.length,
      );
    }
  }, [customTimestamp, generateObjectId, saveToHistory, trackObjectIdEvent, updateUrlId, useCustomTimestamp]);

  useEffect(() => {
    const sharedId = searchParams.get('id');

    if (sharedId && isValidObjectId(sharedId)) {
      setGeneratedId(sharedId);
      if (trackedUrlIdRef.current !== sharedId) {
        trackedUrlIdRef.current = sharedId;
        trackObjectIdEvent('url_load_success', `URL load success; id_length=${sharedId.length}`, sharedId.length);
      }
      return;
    }

    if (sharedId) {
      if (trackedUrlIdRef.current !== sharedId) {
        trackedUrlIdRef.current = sharedId;
        trackObjectIdEvent('url_load_error', `URL load error; invalid_id_length=${sharedId.length}; fallback_id_length=${generatedId.length}`, sharedId.length);
      }
      if (generatedId) {
        updateUrlId(generatedId);
        return;
      }
    }

    if (!generatedId) {
      handleGenerate({ saveToHistory: false, track: false });
    }
  }, [generatedId, handleGenerate, searchParams, trackObjectIdEvent, updateUrlId]);

  const handleCopy = async (text: string, source: 'result_button' | 'result_card' | 'history' = 'result_button') => {
    if (!isValidObjectId(text)) {
      trackObjectIdEvent('copy_result_error', `Copy result error; source=${source}; invalid_length=${text.length}`, text.length);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      saveToHistory(text);
      showMessage(language === 'zh' ? '已复制' : 'Copied');
      trackObjectIdEvent('copy_result_success', `Copy result success; source=${source}; id_length=${text.length}`, text.length);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      saveToHistory(text);
      showMessage(language === 'zh' ? '已复制' : 'Copied');
      trackObjectIdEvent('copy_result_fallback', `Copy result fallback; source=${source}; id_length=${text.length}`, text.length);
    }
  };

  const handleShare = async (objectId: string = generatedId, source: 'result_button' | 'history' = 'result_button') => {
    if (!isValidObjectId(objectId)) {
      trackObjectIdEvent('share_result_error', `Share result error; source=${source}; invalid_length=${objectId.length}`, objectId.length);
      return;
    }
    
    try {
      const currentPath = language === 'en' ? '/objectid' : '/zh/objectid';
      const shareUrl = `${window.location.origin}${currentPath}?id=${objectId}`;
      
      await navigator.clipboard.writeText(shareUrl);
      saveToHistory(objectId);
      showMessage(language === 'zh' ? "分享链接已复制" : "Share link copied");
      
      trackObjectIdEvent('share_result_success', `Share result success; source=${source}; id_length=${objectId.length}; url_length=${shareUrl.length}`, objectId.length);
    } catch {
      const currentPath = language === 'en' ? '/objectid' : '/zh/objectid';
      const shareUrl = `${window.location.origin}${currentPath}?id=${objectId}`;
      
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      saveToHistory(objectId);
      showMessage(language === 'zh' ? "分享链接已复制" : "Share link copied");
      trackObjectIdEvent('share_result_fallback', `Share result fallback; source=${source}; id_length=${objectId.length}; url_length=${shareUrl.length}`, objectId.length);
    }
  };

  const clearHistory = () => {
    trackObjectIdEvent('history_clear', `History clear; count=${history.length}`, history.length);
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore storage failures.
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const deletedItem = prev.find(item => item.id === id);
      const nextHistory = prev.filter(item => item.id !== id);
      try {
        if (nextHistory.length > 0) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
        } else {
          localStorage.removeItem(HISTORY_KEY);
        }
      } catch {
        // Ignore storage failures.
      }
      trackObjectIdEvent(
        'history_delete',
        `History delete; deleted_id_length=${deletedItem?.objectId.length || 0}; before_count=${prev.length}; after_count=${nextHistory.length}`,
        nextHistory.length,
      );
      return nextHistory;
    });
  };

  const selectHistoryItem = useCallback((objectId: string) => {
    trackObjectIdEvent('history_select', `History select; id_length=${objectId.length}`, objectId.length);
    setGeneratedId(objectId);
    updateUrlId(objectId);
  }, [trackObjectIdEvent, updateUrlId]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return language === 'zh' ? "刚刚" : "Just now";
    } else if (diffInMinutes < 60) {
      return language === 'zh' ? `${diffInMinutes} 分钟前` : `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return language === 'zh' ? `${hours} 小时前` : `${hours} hours ago`;
    } else {
      return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US');
    }
  };

  const getObjectIdInfo = (objectId: string) => {
    if (!isValidObjectId(objectId)) return null;
    
    const timestamp = extractTimestamp(objectId);
    if (!timestamp) return null;
    
    return {
      timestamp: new Date(timestamp).toISOString(),
      timestampHex: objectId.substring(0, 8),
      randomValue: objectId.substring(8, 18),
      counter: objectId.substring(18, 24),
      age: formatTime(timestamp)
    };
  };

  return (
    <ToolPageShell>
      <ToolHero
        backHref={language === 'en' ? '/' : '/zh'}
        backLabel={language === 'zh' ? "返回工具" : "Back to Tools"}
        title={titleText}
        subtitle={subtitleText}
        infoSections={[
          {
            title: language === 'zh' ? '什么是 MongoDB ObjectID？' : 'What is a MongoDB ObjectID?',
            body: language === 'zh'
              ? 'ObjectID 是 MongoDB 常用的 12 字节唯一标识符，包含时间戳、随机值和计数信息，可用于生成和解析文档 ID。'
              : 'An ObjectID is MongoDB’s common 12-byte unique identifier. It includes timestamp, random, and counter data for generating and inspecting document IDs.',
          },
          {
            title: language === 'zh' ? '如何使用这个工具？' : 'How to use this tool',
            body: language === 'zh'
              ? '生成新的 ObjectID，或输入已有 ID 查看创建时间。需要复现特定时间的数据时，也可以设置自定义时间戳。'
              : 'Generate a new ObjectID or paste an existing one to inspect its timestamp. Use a custom timestamp when you need IDs for a specific point in time.',
          },
        ]}
      />
        <ToolContentSection>
          <div className="w-full space-y-5">
          {/* Share success message */}
          {shareMessage && (
            <StatusToast variant="success" title={shareMessage} />
          )}

          {/* Generated result */}
          {generatedId && (
            <GlassPanel
              className="transform-none p-4 hover:translate-y-0 md:p-6"
            >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="inline-flex items-center gap-2 text-base font-semibold text-white">
                    <LabelIcon>
                      <IdIcon />
                    </LabelIcon>
                    {language === 'zh' ? "生成的 ObjectID" : "Generated ObjectID"}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
	                      onClick={(event) => {
                        event.stopPropagation();
                        handleCopy(generatedId, 'result_button');
                      }}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white/62 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                    >
                      <CopyIcon />
                      {language === 'zh' ? "复制" : "Copy"}
                    </button>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleShare(generatedId, 'result_button');
                      }}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 text-sm text-white/62 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                    >
                      <ShareIcon />
                      {language === 'zh' ? "分享" : "Share"}
                    </button>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopy(generatedId, 'result_card');
                  }}
                  className="mb-4 block w-full rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-4 text-left transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.055]"
                  title={language === 'zh' ? '点击复制' : 'Click to copy'}
                >
                  <code className="text-[#a1c4fd] text-lg font-mono break-all">{generatedId}</code>
                  <span className="mt-2 block text-xs text-white/38">
                    {language === 'zh' ? '点击复制' : 'Click to copy'}
                  </span>
                </button>
                
                {(() => {
                  const info = getObjectIdInfo(generatedId);
                  return info && (
                    <div className="space-y-3">
                      <h4 className="text-white font-medium">
                        {language === 'zh' ? "ObjectID 结构分析：" : "ObjectID Breakdown:"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/42">
                            {language === 'zh' ? "Timestamp：前 4 字节 / 8 位十六进制" : "Timestamp: first 4 bytes / 8 hex chars"}
                          </span>
                          <div className="text-white font-mono">{info.timestampHex}</div>
                          <div className="text-white/48 text-xs">{info.timestamp}</div>
                        </div>
                        <div>
                          <span className="text-white/42">
                            {language === 'zh' ? "Random value：中间 5 字节 / 10 位十六进制" : "Random value: next 5 bytes / 10 hex chars"}
                          </span>
                          <div className="text-white font-mono">{info.randomValue}</div>
                        </div>
                        <div>
                          <span className="text-white/42">
                            {language === 'zh' ? "Counter：最后 3 字节 / 6 位十六进制" : "Counter: last 3 bytes / 6 hex chars"}
                          </span>
                          <div className="text-white font-mono">{info.counter}</div>
                        </div>
                        <div>
                          <span className="text-white/42">
                            {language === 'zh' ? "内嵌时间：" : "Embedded time:"}
                          </span>
                          <div className="text-white">{info.age}</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                <div className="mt-4 text-center">
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 text-xs text-white/46">
                    <input
                      type="checkbox"
                      checked={useCustomTimestamp}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(e) => {
                        trackObjectIdEvent(
                          'custom_timestamp_toggle',
                          `Custom timestamp toggle; enabled=${e.target.checked}; value_length=${customTimestamp.length}`,
                          e.target.checked ? 1 : 0,
                        );
                        setUseCustomTimestamp(e.target.checked);
                      }}
                      className="h-3.5 w-3.5 rounded border-white/[0.14] bg-white/[0.035] text-white focus:ring-white/20"
                    />
                    <span>{language === 'zh' ? "自定义时间戳" : "Custom timestamp"}</span>
                    <span
                      className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/42"
                      title={language === 'zh'
                        ? '默认使用当前系统时间生成 ObjectID；开启后，下次重新生成会使用你指定的内嵌时间。'
                        : 'By default, ObjectID uses the current system time. Enable this so the next regeneration uses your chosen embedded time.'}
                    >
                      <InfoIcon />
                    </span>
                  </label>
                  {useCustomTimestamp && (
                    <div className="mx-auto mt-2 max-w-sm">
                      <input
                        type="datetime-local"
                        value={customTimestamp}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(e) => {
                          trackObjectIdEvent(
                            'custom_timestamp_change',
                            `Custom timestamp change; value_length=${e.target.value.length}; valid=${!isNaN(new Date(e.target.value).getTime())}`,
                            e.target.value.length,
                          );
                          setCustomTimestamp(e.target.value);
                        }}
                        className="w-full rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-sm text-white/72 focus:border-white/[0.18] focus:outline-none"
                      />
                      <p className="mt-2 text-xs leading-5 text-white/38">
                        {language === 'zh' ? '下次点击“重新生成一个”时使用这个时间。' : 'The next regeneration will use this time.'}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleGenerate();
                  }}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-slate-950 transition-colors duration-200 hover:bg-white/90"
                >
                  <RefreshIcon />
                  {language === 'zh' ? "重新生成一个" : "Regenerate"}
                </button>
            </GlassPanel>
          )}

          {/* History */}
          {history.length > 0 && (
            <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <LabelIcon>
                    <HistoryIcon />
                  </LabelIcon>
                  {language === 'zh' ? "生成历史" : "Generation History"}
                </h3>
                <button
                  onClick={clearHistory}
                  className="inline-flex min-h-9 items-center rounded-full px-3 text-xs text-white/44 transition-colors duration-200 hover:bg-rose-300/[0.08] hover:text-rose-100"
                >
                  {language === 'zh' ? "清除历史" : "Clear History"}
                </button>
              </div>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => selectHistoryItem(item.objectId)}
                    onKeyDown={(keyboardEvent) => {
                      if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
                        keyboardEvent.preventDefault();
                        selectHistoryItem(item.objectId);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-3 transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07]"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <code className="text-[#a1c4fd] font-mono text-sm break-all">{item.objectId}</code>
                      <span className="flex flex-shrink-0 items-center gap-2">
                        <span className="text-xs text-white/38">
                          {formatTime(item.timestamp)}
                        </span>
                        <button
                          type="button"
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            handleCopy(item.objectId, 'history');
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/72"
                          title={language === 'zh' ? '复制' : 'Copy'}
                          aria-label={language === 'zh' ? '复制' : 'Copy'}
                        >
                          <CopyIcon />
                        </button>
                        <button
                          type="button"
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            selectHistoryItem(item.objectId);
                            handleShare(item.objectId, 'history');
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/72"
                          title={language === 'zh' ? '分享' : 'Share'}
                          aria-label={language === 'zh' ? '分享' : 'Share'}
                        >
                          <ShareIcon />
                        </button>
                        <button
                          type="button"
                          onClick={(clickEvent) => {
                            clickEvent.stopPropagation();
                            deleteHistoryItem(item.id);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 transition-colors hover:border-rose-200/[0.2] hover:bg-rose-300/[0.08] hover:text-rose-100"
                          title={language === 'zh' ? '删除' : 'Delete'}
                          aria-label={language === 'zh' ? '删除' : 'Delete'}
                        >
                          <TrashIcon />
                        </button>
                      </span>
                    </div>
                    <div className="text-xs text-white/38">
                      {language === 'zh' ? "内嵌时间：" : "Embedded time: "}{item.readable}
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          )}

          <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
            <header>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/84">
                <LabelIcon>
                  <InfoIcon />
                </LabelIcon>
                {language === 'zh' ? "什么是 MongoDB ObjectID？" : "What is MongoDB ObjectID?"}
              </h2>
            </header>
            
            <p className="text-sm leading-7 text-white/58">
              {language === 'zh'
                ? 'ObjectID 是 MongoDB 常用的 24 位十六进制标识符，由时间戳、随机值和计数器组成。这个工具生成的是语法有效的 ObjectID，但不代表数据库里一定存在对应文档。'
                : 'ObjectID is a 24-character hexadecimal identifier commonly used by MongoDB. It is made from a timestamp, a random value, and a counter. This tool creates syntactically valid ObjectIDs, but that does not mean a matching document exists in a database.'}
            </p>
          </GlassPanel>

          <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
            <h2 className="mb-4 text-sm font-semibold text-white/84">
              {language === 'zh' ? "常见问题" : "Frequently Asked Questions"}
            </h2>
            
            <div className="space-y-4">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white/74">
                  <span>{language === 'zh' ? "ObjectID 是如何保证唯一性的？" : "How does ObjectID ensure uniqueness?"}</span>
                  <ChevronIcon />
                </summary>
                <div className="mt-2 pl-4 text-sm leading-7 text-white/58">
                  {language === 'zh' 
                    ? "ObjectID 组合了秒级时间戳、随机值和计数器。随机值与计数器一起降低同一秒内重复的概率。"
                    : "ObjectID combines a seconds-level timestamp, a random value, and a counter. The random value and counter together reduce collision risk within the same second."
                  }
                </div>
              </details>

              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white/74">
                  <span>{language === 'zh' ? "可以从 ObjectID 中提取哪些信息？" : "What information can be extracted from an ObjectID?"}</span>
                  <ChevronIcon />
                </summary>
                <div className="mt-2 pl-4 text-sm leading-7 text-white/58">
                  {language === 'zh' 
                    ? "最常用的是前 8 位十六进制里的内嵌时间。中间 10 位是随机值，最后 6 位是计数器。"
                    : "Most commonly, you extract the embedded time from the first 8 hex characters. The next 10 are the random value, and the last 6 are the counter."
                  }
                </div>
              </details>

              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-white/74">
                  <span>{language === 'zh' ? "为什么要使用自定义时间戳？" : "Why use custom timestamps?"}</span>
                  <ChevronIcon />
                </summary>
                <div className="mt-2 pl-4 text-sm leading-7 text-white/58">
                  {language === 'zh' 
                    ? "当你需要生成看起来属于某个指定时间点的测试 ID 时，可以使用自定义时间戳。"
                    : "Use a custom timestamp when you need a test ID that appears to belong to a specific point in time."
                  }
                </div>
              </details>
            </div>
          </GlassPanel>

          </div>
        </ToolContentSection>

      <footer>
        <Foot />
      </footer>
    </ToolPageShell>
  );
}

function ObjectIdToolPageFallback() {
  return <ToolLoadingFallback />;
}

export default function ObjectIdToolPage() {
  return (
    <Suspense fallback={<ObjectIdToolPageFallback />}>
      <ObjectIdToolPageContent />
    </Suspense>
  );
}
