"use client"
import { useState, useEffect, Suspense } from 'react';
import { motion } from "motion/react"
import Link from 'next/link';
import Foot from '@/components/Common/Foot';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'next/navigation';
import { event } from '@/components/GoogleAnalytics';
import StructuredData from '@/components/StructuredData';

function Base64ToolPageContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [history, setHistory] = useState<Array<{
    id: string;
    input: string;
    output: string;
    mode: 'encode' | 'decode';
    timestamp: number;
  }>>([]);

  const titleText = t('base64.title');
  const subtitleText = t('base64.subtitle');

  const placeholderTexts = {
    encode: t('base64.placeholderEncode'),
    decode: t('base64.placeholderDecode')
  };

  useEffect(() => {
    // Load history from localStorage on mount
    const savedHistory = localStorage.getItem('base64-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // Ignore invalid history data
      }
    }

    // Parse URL parameters for shared content
    const sharedText = searchParams.get('text');
    const sharedMode = searchParams.get('mode');
    
    if (sharedText) {
      try {
        const decodedText = decodeURIComponent(sharedText);
        setInputText(decodedText);
        
        // Auto-execute conversion for shared content
        const executeMode = (sharedMode === 'encode' || sharedMode === 'decode') ? sharedMode : 'encode';
        
        try {
          let result = '';
          if (executeMode === 'encode') {
            result = btoa(unescape(encodeURIComponent(decodedText)));
            setOutputText(result);
            setError('');
          } else {
            result = decodeURIComponent(escape(atob(decodedText)));
            setOutputText(result);
            setError('');
          }

          // Add to history if conversion is successful and input is substantial
          if (result && decodedText.trim().length > 2) {
            const newHistoryItem = {
              id: Date.now().toString(),
              input: decodedText.trim(),
              output: result,
              mode: executeMode as 'encode' | 'decode',
              timestamp: Date.now()
            };

            setHistory(prev => {
              const filtered = prev.filter(item => 
                !(item.input === newHistoryItem.input && item.mode === newHistoryItem.mode)
              );
              const newHistory = [newHistoryItem, ...filtered];
              localStorage.setItem('base64-history', JSON.stringify(newHistory));
              return newHistory;
            });
          }
        } catch {
          setError(t('base64.decodeError'));
          setOutputText('');
        }
      } catch {
        // Ignore invalid encoded text
      }
    }
    
    if (sharedMode === 'encode' || sharedMode === 'decode') {
      setMode(sharedMode);
    }
  }, [searchParams, t]);

  const handleConvert = () => {
    if (!inputText.trim()) {
      setOutputText('');
      setError('');
      return;
    }

    try {
      let result = '';
      if (mode === 'encode') {
        result = btoa(unescape(encodeURIComponent(inputText)));
        setOutputText(result);
        setError('');
        // 追踪编码事件
        event('base64_encode', 'Tool Usage', 'Base64 Encode', inputText.length);
      } else {
        result = decodeURIComponent(escape(atob(inputText)));
        setOutputText(result);
        setError('');
        // 追踪解码事件
        event('base64_decode', 'Tool Usage', 'Base64 Decode', inputText.length);
      }

      // Add to history if conversion is successful and input is substantial
      if (result && inputText.trim().length > 2) {
        const newHistoryItem = {
          id: Date.now().toString(),
          input: inputText.trim(),
          output: result,
          mode: mode as 'encode' | 'decode',
          timestamp: Date.now()
        };

        setHistory(prev => {
          const filtered = prev.filter(item => 
            !(item.input === newHistoryItem.input && item.mode === newHistoryItem.mode)
          );
          const newHistory = [newHistoryItem, ...filtered]; // Keep unlimited history
          localStorage.setItem('base64-history', JSON.stringify(newHistory));
          return newHistory;
        });
      }
    } catch {
      setError(t('base64.decodeError'));
      setOutputText('');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 追踪复制事件
      event('copy_result', 'Tool Usage', 'Copy Base64 Result', text.length);
    } catch {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      // 追踪复制事件（降级方案）
      event('copy_result_fallback', 'Tool Usage', 'Copy Base64 Result Fallback', text.length);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };

  const handleSwap = () => {
    if (outputText && !error) {
      setInputText(outputText);
      setMode(mode === 'encode' ? 'decode' : 'encode');
    }
  };

  const handleHistoryItemClick = (item: typeof history[0]) => {
    setInputText(item.input);
    setMode(item.mode);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('base64-history');
  };

  const handleShare = async () => {
    if (!inputText.trim()) return;
    
    try {
      const encodedText = encodeURIComponent(inputText);
      const currentPath = language === 'en' ? '/en/base64' : '/zh/base64';
      const shareUrl = `${window.location.origin}${currentPath}?mode=${mode}&text=${encodedText}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage(t('base64.shareCopied'));
      
      // 追踪分享事件
      event('share_result', 'Tool Usage', `Share Base64 ${mode}`, inputText.length);
      
      // Clear message after 3 seconds
      setTimeout(() => setShareMessage(''), 3000);
    } catch {
      // Fallback for browsers without clipboard API
      const encodedText = encodeURIComponent(inputText);
      const currentPath = language === 'en' ? '/en/base64' : '/zh/base64';
      const shareUrl = `${window.location.origin}${currentPath}?mode=${mode}&text=${encodedText}`;
      
      // Create temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      
      setShareMessage(t('base64.shareCopied'));
      
      // 追踪分享事件（降级方案）
      event('share_result_fallback', 'Tool Usage', `Share Base64 ${mode} Fallback`, inputText.length);
      
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return t('base64.justNow');
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}${t('base64.minutesAgo')}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}${t('base64.hoursAgo')}`;
    } else {
      return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData 
        type="tool" 
        toolName="Base64 Encoder Decoder" 
        toolDescription="Free online Base64 encoder and decoder tool"
        url="https://tools.mofei.life/base64"
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
              {t('base64.backToTools')}
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
          {/* Mode switch */}
          <div className="mb-6">
            <div className="flex bg-gray-800/50 rounded-lg p-1 w-fit">
              <button
                onClick={() => {
                  setMode('encode');
                  setOutputText('');
                  setError('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === 'encode' 
                    ? 'bg-[#a1c4fd] text-gray-900' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
{t('base64.encode')}
              </button>
              <button
                onClick={() => {
                  setMode('decode');
                  setOutputText('');
                  setError('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  mode === 'decode' 
                    ? 'bg-[#a1c4fd] text-gray-900' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
{t('base64.decode')}
              </button>
            </div>
          </div>

          {/* Input area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">
                {mode === 'encode' ? t('base64.inputText') : t('base64.inputBase64')}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                >
                  {t('base64.clear')}
                </button>
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={placeholderTexts[mode]}
              className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#a1c4fd] resize-none"
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

          {/* Convert button */}
          <div className="flex justify-center mb-6">
            <div className="flex gap-4">
              <button
                onClick={handleConvert}
                className="px-6 py-3 bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] text-gray-900 font-medium rounded-lg hover:from-[#8fb3fc] hover:to-[#b1e1fa] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
{mode === 'encode' ? t('base64.startEncode') : t('base64.startDecode')}
              </button>
              <button
                onClick={handleSwap}
                disabled={!outputText || !!error}
                className="p-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors duration-200"
                title="Swap input/output"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Output area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-white font-medium">
                {mode === 'encode' ? t('base64.outputBase64') : t('base64.outputText')}
              </label>
              <div className="flex gap-2">
                {outputText && !error && (
                  <>
                    <button
                      onClick={() => handleCopy(outputText)}
                      className="text-[#a1c4fd] hover:text-[#c2e9fb] text-sm transition-colors duration-200 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      {t('base64.copy')}
                    </button>
                    <button
                      onClick={handleShare}
                      className="bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] hover:from-[#8fb3fc] hover:to-[#b1e1fa] text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                      </svg>
                      {t('base64.shareResult')}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <textarea
                value={error || outputText}
                readOnly
                placeholder={t('base64.resultPlaceholder')}
                className={`w-full h-32 bg-gray-800/50 border rounded-lg px-4 py-3 placeholder-gray-400 resize-none ${
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
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#a1c4fd]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z"/>
                  </svg>
{t('base64.history')}
                </h3>
                <button
                  onClick={clearHistory}
                  className="text-gray-400 hover:text-red-400 text-xs transition-colors duration-200"
                >
{t('base64.clearHistory')}
                </button>
              </div>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleHistoryItemClick(item)}
                    className="bg-gray-800/30 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-[#a1c4fd]/50 transition-all duration-200 hover:bg-gray-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        item.mode === 'encode' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-green-500/20 text-green-300'
                      }`}>
{item.mode === 'encode' ? t('base64.encode') : t('base64.decode')}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <div className="mb-1">
                        <span className="text-xs text-gray-400 uppercase tracking-wide">
                          {t('base64.input')}
                        </span>
                        <div className="text-gray-300 truncate">
                          {item.input.length > 50 ? `${item.input.substring(0, 50)}...` : item.input}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wide">
                          {t('base64.output')}
                        </span>
                        <div className="text-gray-300 truncate">
                          {item.output.length > 50 ? `${item.output.substring(0, 50)}...` : item.output}
                        </div>
                      </div>
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
{t('base64.usageTitle')}
            </h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• {t('base64.usage1')}</li>
              <li>• {t('base64.usage2')}</li>
              <li>• {t('base64.usage3')}</li>
              <li>• {t('base64.usage4')}</li>
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

function Base64ToolPageFallback() {
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

export default function Base64ToolPage() {
  return (
    <Suspense fallback={<Base64ToolPageFallback />}>
      <Base64ToolPageContent />
    </Suspense>
  );
}