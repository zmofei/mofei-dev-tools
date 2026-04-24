"use client"
import { useCallback, useMemo, useRef, useState, useEffect, Suspense } from 'react';
import {
  GlassPanel,
  PrimaryPillLink,
  SecondaryButton,
  SelectInput,
  SectionLabel,
  StatusToast,
  TextButton,
} from '@mofei-dev/ui';
import Foot from '@/components/Common/Foot';
import ResizableTextarea from '@/components/Common/ResizableTextarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { event } from '@/components/GoogleAnalytics';
import ContributeButton from '@/components/Common/ContributeButton';

function LabelIcon({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'cyan' | 'emerald';
}) {
  const toneClass = {
    neutral: 'border-white/[0.08] bg-white/[0.045] text-white/58',
    cyan: 'border-cyan-200/15 bg-cyan-300/[0.08] text-cyan-50/80',
    emerald: 'border-emerald-200/15 bg-emerald-300/[0.08] text-emerald-50/80',
  }[tone];

  return (
    <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${toneClass}`}>
      {children}
    </span>
  );
}

function TextInputIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 7h14M5 12h10M5 17h7" />
    </svg>
  );
}

function OutputIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 4.75h7.25L18.75 9v8A2.25 2.25 0 0116.5 19.25h-9A2.25 2.25 0 015.25 17V7A2.25 2.25 0 017 4.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M14.25 5v4.25h4.25M8.75 13h6.5M8.75 16h4" />
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

function Base64ToolPageContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialModeParam = searchParams.get('mode');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>(
    initialModeParam === 'decode' ? 'decode' : 'encode',
  );
  const [error, setError] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [historyLimit, setHistoryLimit] = useState<'20' | '40' | '100' | 'unlimited'>('20');
  const [history, setHistory] = useState<Array<{
    id: string;
    input: string;
    output: string;
    mode: 'encode' | 'decode';
    timestamp: number;
  }>>([]);
  const trackedConversionRef = useRef('');
  const trackedUrlTextRef = useRef('');

  const trackBase64Event = useCallback((action: string, label: string, value?: number) => {
    event(`base64_${action}`, 'Tool Usage', `Base64 ${label}; lang=${language}`, value);
  }, [language]);

  const titleText = t('base64.title');
  const subtitleText = t('base64.subtitle');

  const placeholderTexts = {
    encode: t('base64.placeholderEncode'),
    decode: t('base64.placeholderDecode')
  };

  const modeLabels = {
    encode: t('base64.textToBase64'),
    decode: t('base64.base64ToText'),
  };

  const getHistoryLimitCount = useCallback((limit: typeof historyLimit) => {
    if (limit === 'unlimited') return Infinity;
    return Number(limit);
  }, []);

  const convertBase64 = useCallback((value: string, targetMode: 'encode' | 'decode') => {
    if (!value.trim()) {
      return { result: '', errorMessage: '' };
    }

    try {
      const result = targetMode === 'encode'
        ? btoa(unescape(encodeURIComponent(value)))
        : decodeURIComponent(escape(atob(value)));

      return { result, errorMessage: '' };
    } catch {
      return { result: '', errorMessage: t('base64.decodeError') };
    }
  }, [t]);

  const base64InputHint = useMemo(() => {
    if (mode !== 'encode') return null;

    const candidate = inputText.trim().replace(/\s+/g, '');
    if (candidate.length < 8 || candidate.length % 4 !== 0) return null;
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(candidate)) return null;

    try {
      const decoded = decodeURIComponent(escape(atob(candidate)));
      const visibleRatio = decoded
        ? decoded.replace(/[\s\p{P}\p{S}\p{L}\p{N}]/gu, '').length / decoded.length
        : 1;

      if (!decoded.trim() || visibleRatio > 0.1) return null;
      if (btoa(unescape(encodeURIComponent(decoded))) !== candidate.replace(/=+$/, '') && btoa(unescape(encodeURIComponent(decoded))) !== candidate) return null;

      return decoded;
    } catch {
      return null;
    }
  }, [inputText, mode]);

  const textInputHint = useMemo(() => {
    if (mode !== 'decode') return false;

    const value = inputText.trim();
    if (value.length < 8) return false;

    const compact = value.replace(/\s+/g, '');
    const hasPlainTextSignals = /[\u4e00-\u9fff]/.test(value) || /\s/.test(value) || /[.,，。!?！？]/.test(value);
    const validBase64Shape = compact.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(compact);

    if (hasPlainTextSignals) return true;
    if (!validBase64Shape) return true;

    return !!error;
  }, [error, inputText, mode]);

  const saveHistoryItem = useCallback((
    input: string,
    output: string,
    itemMode: 'encode' | 'decode',
    options: { onlyIfNew?: boolean } = {},
  ) => {
    if (!output || input.trim().length <= 2) return;

    const newHistoryItem = {
      id: Date.now().toString(),
      input: input.trim(),
      output,
      mode: itemMode,
      timestamp: Date.now()
    };

    setHistory(prev => {
      const exists = prev.some(item =>
        item.input === newHistoryItem.input && item.mode === newHistoryItem.mode
      );

      if (options.onlyIfNew && exists) {
        return prev;
      }

      const filtered = prev.filter(item =>
        !(item.input === newHistoryItem.input && item.mode === newHistoryItem.mode)
      );
      const limitCount = getHistoryLimitCount(historyLimit);
      const newHistory = [newHistoryItem, ...filtered].slice(0, limitCount);
      localStorage.setItem('base64-history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [getHistoryLimitCount, historyLimit]);

  useEffect(() => {
    // Load history from localStorage on mount
    const savedHistoryLimit = localStorage.getItem('base64-history-limit');
    if (
      savedHistoryLimit === '20' ||
      savedHistoryLimit === '40' ||
      savedHistoryLimit === '100' ||
      savedHistoryLimit === 'unlimited'
    ) {
      setHistoryLimit(savedHistoryLimit);
    }

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
    if (sharedText) {
      try {
        const decodedText = decodeURIComponent(sharedText);
        setInputText(decodedText);
        const urlTrackKey = sharedText;
        if (trackedUrlTextRef.current !== urlTrackKey) {
          trackedUrlTextRef.current = urlTrackKey;
          trackBase64Event(
            'url_load_success',
            `URL load success; mode=${initialModeParam === 'decode' ? 'decode' : 'encode'}; input_length=${decodedText.length}`,
            decodedText.length,
          );
        }
      } catch {
        trackBase64Event(
          'url_load_error',
          `URL load error; mode=${initialModeParam === 'decode' ? 'decode' : 'encode'}; encoded_length=${sharedText.length}`,
          sharedText.length,
        );
      }
    }
  }, [initialModeParam, searchParams, trackBase64Event]);

  useEffect(() => {
    localStorage.setItem('base64-history-limit', historyLimit);

    setHistory(prev => {
      const limitCount = getHistoryLimitCount(historyLimit);
      const nextHistory = prev.slice(0, limitCount);
      if (nextHistory.length === prev.length) return prev;

      localStorage.setItem('base64-history', JSON.stringify(nextHistory));
      return nextHistory;
    });
  }, [getHistoryLimitCount, historyLimit]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === mode) return;

    params.set('mode', mode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [mode, pathname, router]);

  useEffect(() => {
    const { result, errorMessage } = convertBase64(inputText, mode);
    setOutputText(result);
    setError(errorMessage);
  }, [convertBase64, inputText, mode]);

  useEffect(() => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;

    const trackKey = `${mode}:${trimmedInput}:${outputText}:${error}`;
    if (trackedConversionRef.current === trackKey) return;

    const conversionTimer = window.setTimeout(() => {
      trackedConversionRef.current = trackKey;

      if (error) {
        trackBase64Event(
          'convert_error',
          `Convert error; mode=${mode}; input_length=${trimmedInput.length}`,
          trimmedInput.length,
        );
        return;
      }

      if (outputText) {
        trackBase64Event(
          'convert_success',
          `Convert success; mode=${mode}; input_length=${trimmedInput.length}; output_length=${outputText.length}`,
          outputText.length,
        );
      }
    }, 1200);

    return () => window.clearTimeout(conversionTimer);
  }, [error, inputText, mode, outputText, trackBase64Event]);

  useEffect(() => {
    if (!outputText || error) return;

    const idleTimer = window.setTimeout(() => {
      saveHistoryItem(inputText, outputText, mode, { onlyIfNew: true });
    }, 60000);

    return () => window.clearTimeout(idleTimer);
  }, [error, inputText, mode, outputText, saveHistoryItem]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      saveHistoryItem(inputText, text, mode);
      trackBase64Event('copy_result_success', `Copy result success; mode=${mode}; output_length=${text.length}`, text.length);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      saveHistoryItem(inputText, text, mode);
      trackBase64Event('copy_result_fallback', `Copy result fallback; mode=${mode}; output_length=${text.length}`, text.length);
    }
  };

  const handleCopyHistoryOutput = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      trackBase64Event('copy_history_result_success', `Copy history result success; output_length=${text.length}`, text.length);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      trackBase64Event('copy_history_result_fallback', `Copy history result fallback; output_length=${text.length}`, text.length);
    }
  };

  const handleClear = () => {
    trackBase64Event(
      'clear_input',
      `Clear input; mode=${mode}; input_length=${inputText.length}; output_length=${outputText.length}; had_error=${Boolean(error)}`,
      inputText.length,
    );
    setInputText('');
    setOutputText('');
    setError('');
  };

  const handleModeChange = (nextMode: 'encode' | 'decode') => {
    if (nextMode === mode) return;

    if (outputText && !error) {
      setInputText(outputText);
    }

    trackBase64Event(
      'mode_change',
      `Mode change; from=${mode}; to=${nextMode}; input_length=${inputText.length}; output_length=${outputText.length}`,
      inputText.length,
    );
    setMode(nextMode);
    setShareMessage('');
  };

  const handleSwitchToDecodeInput = () => {
    trackBase64Event('hint_switch_to_decode', `Hint switch; from=encode; to=decode; input_length=${inputText.length}`, inputText.length);
    setMode('decode');
    setShareMessage('');
  };

  const handleSwitchToEncodeInput = () => {
    trackBase64Event('hint_switch_to_encode', `Hint switch; from=decode; to=encode; input_length=${inputText.length}; had_error=${Boolean(error)}`, inputText.length);
    setMode('encode');
    setShareMessage('');
  };

  const handleSaveResult = () => {
    if (outputText && !error) {
      saveHistoryItem(inputText, outputText, mode);
      trackBase64Event('save_result', `Save result; mode=${mode}; output_length=${outputText.length}`, outputText.length);
    }
  };

  const handleHistoryItemClick = (item: typeof history[0]) => {
    trackBase64Event('history_select', `History select; mode=${item.mode}; input_length=${item.input.length}; output_length=${item.output.length}`, item.output.length);
    setInputText(item.input);
    setMode(item.mode);
  };

  const clearHistory = () => {
    trackBase64Event('history_clear', `History clear; count=${history.length}`, history.length);
    setHistory([]);
    localStorage.removeItem('base64-history');
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => {
      const deletedItem = prev.find(item => item.id === id);
      const nextHistory = prev.filter(item => item.id !== id);
      localStorage.setItem('base64-history', JSON.stringify(nextHistory));
      trackBase64Event(
        'history_delete',
        `History delete; mode=${deletedItem?.mode || 'unknown'}; before_count=${prev.length}; after_count=${nextHistory.length}`,
        nextHistory.length,
      );
      return nextHistory;
    });
  };

  const handleShare = async () => {
    if (!inputText.trim()) return;

    try {
      const encodedText = encodeURIComponent(inputText);
      const currentPath = language === 'en' ? '/base64' : '/zh/base64';
      const shareUrl = `${window.location.origin}${currentPath}?mode=${mode}&text=${encodedText}`;

      await navigator.clipboard.writeText(shareUrl);
      saveHistoryItem(inputText, outputText, mode);
      setShareMessage(t('base64.shareCopied'));

      trackBase64Event('share_result_success', `Share result success; mode=${mode}; input_length=${inputText.length}; url_length=${shareUrl.length}`, inputText.length);

      // Clear message after 3 seconds
      setTimeout(() => setShareMessage(''), 3000);
    } catch {
      // Fallback for browsers without clipboard API
      const encodedText = encodeURIComponent(inputText);
      const currentPath = language === 'en' ? '/base64' : '/zh/base64';
      const shareUrl = `${window.location.origin}${currentPath}?mode=${mode}&text=${encodedText}`;

      // Create temporary input element
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      saveHistoryItem(inputText, outputText, mode);
      setShareMessage(t('base64.shareCopied'));

      trackBase64Event('share_result_fallback', `Share result fallback; mode=${mode}; input_length=${inputText.length}; url_length=${shareUrl.length}`, inputText.length);

      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const handleShareHistoryItem = async (item: typeof history[0]) => {
    try {
      const encodedText = encodeURIComponent(item.input);
      const currentPath = language === 'en' ? '/base64' : '/zh/base64';
      const shareUrl = `${window.location.origin}${currentPath}?mode=${item.mode}&text=${encodedText}`;

      await navigator.clipboard.writeText(shareUrl);
      setShareMessage(t('base64.shareCopied'));
      trackBase64Event('share_history_result_success', `Share history result success; mode=${item.mode}; input_length=${item.input.length}; url_length=${shareUrl.length}`, item.input.length);
      setTimeout(() => setShareMessage(''), 3000);
    } catch {
      const encodedText = encodeURIComponent(item.input);
      const currentPath = language === 'en' ? '/base64' : '/zh/base64';
      const shareUrl = `${window.location.origin}${currentPath}?mode=${item.mode}&text=${encodedText}`;
      const tempInput = document.createElement('input');
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setShareMessage(t('base64.shareCopied'));
      trackBase64Event('share_history_result_fallback', `Share history result fallback; mode=${item.mode}; input_length=${item.input.length}; url_length=${shareUrl.length}`, item.input.length);
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
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-[2000px] px-5 pb-8 pt-10 md:px-10 md:pb-10 md:pt-14 lg:px-16 lg:pb-12 lg:pt-20">
          <div className="max-w-5xl">
            <PrimaryPillLink
              href={language === 'en' ? '/' : '/zh'}
              className="min-h-10 transform-none px-4 text-sm hover:translate-x-0 hover:translate-y-0"
            >
              <span aria-hidden="true">←</span>
              {t('base64.backToTools')}
            </PrimaryPillLink>

            <SectionLabel className="mt-8">MOFEI DEV TOOLS</SectionLabel>
            <h1 className="mt-5 max-w-4xl text-[40px] font-semibold leading-[0.98] tracking-[-0.02em] text-white md:text-[58px] lg:text-[68px]">
              {titleText}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/72 md:text-lg md:leading-9">
              {subtitleText}
            </p>

            <div className="mt-8">
              <ContributeButton variant="ghost" size="sm" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[2000px] px-5 pb-10 pt-2 md:px-10 md:pb-14 lg:px-16 lg:pb-20">
          <div className="mx-auto max-w-5xl space-y-5">
            <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
              <div className="mb-5 inline-flex rounded-full border border-white/[0.08] bg-white/[0.035] p-1">
                <button
                  onClick={() => handleModeChange('encode')}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-5 text-sm font-medium transition-all duration-200 ${
                    mode === 'encode'
                      ? 'bg-white text-slate-950'
                      : 'text-white/58 hover:text-white'
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h8M4 12h10M4 17h6M15 8l4 4-4 4" />
                  </svg>
                  {modeLabels.encode}
                </button>
                <button
                  onClick={() => handleModeChange('decode')}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-5 text-sm font-medium transition-all duration-200 ${
                    mode === 'decode'
                      ? 'bg-white text-slate-950'
                      : 'text-white/58 hover:text-white'
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7h-8M20 12H10m10 5h-6M9 8l-4 4 4 4" />
                  </svg>
                  {modeLabels.decode}
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-white/84">
                      <LabelIcon tone={mode === 'encode' ? 'cyan' : 'emerald'}>
                        <TextInputIcon />
                      </LabelIcon>
                      {mode === 'encode' ? t('base64.inputText') : t('base64.inputBase64')}
                    </label>
                    <TextButton onClick={handleClear} className="text-sm">
                      {t('base64.clear')}
                    </TextButton>
                  </div>
                  <ResizableTextarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={placeholderTexts[mode]}
                    resizeTitle={language === 'zh' ? '拖拽调整输入框高度' : 'Drag to resize input height'}
                  />
                  {base64InputHint && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-amber-200/25 bg-amber-300/[0.08] px-4 py-3">
                      <span className="text-sm leading-6 text-amber-50/88">
                        {t('base64.looksLikeBase64')}
                      </span>
                      <SecondaryButton
                        onClick={handleSwitchToDecodeInput}
                        className="min-h-9 px-4 text-sm"
                      >
                        {t('base64.switchToDecode')}
                      </SecondaryButton>
                    </div>
                  )}
                  {textInputHint && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-amber-200/25 bg-amber-300/[0.08] px-4 py-3">
                      <span className="text-sm leading-6 text-amber-50/88">
                        {t('base64.looksLikeText')}
                      </span>
                      <SecondaryButton
                        onClick={handleSwitchToEncodeInput}
                        className="min-h-9 px-4 text-sm"
                      >
                        {t('base64.switchToEncode')}
                      </SecondaryButton>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-white/84">
                      <LabelIcon tone={mode === 'encode' ? 'cyan' : 'emerald'}>
                        <OutputIcon />
                      </LabelIcon>
                      {mode === 'encode' ? t('base64.outputBase64') : t('base64.outputText')}
                    </label>
                  </div>
                  <ResizableTextarea
                    value={error || outputText}
                    readOnly
                    aria-disabled="true"
                    onClick={handleSaveResult}
                    placeholder={t('base64.resultPlaceholder')}
                    containerClassName={`border-white/[0.06] bg-white/[0.035] focus-within:border-white/[0.06] focus-within:ring-0 ${
                      error ? 'border-rose-300/45 bg-rose-950/10 focus-within:border-rose-300/45' : ''
                    }`}
                    textareaClassName={`cursor-default text-white/58 ${error ? 'text-rose-100/80' : ''}`}
                    resizeTitle={language === 'zh' ? '拖拽调整输出框高度' : 'Drag to resize output height'}
                  />
                </div>
              </div>

              {shareMessage && (
                <StatusToast variant="success" title={shareMessage} className="mt-5" />
              )}

              {outputText && !error && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <SecondaryButton
                    onClick={() => handleCopy(outputText)}
                    className="min-h-9 px-4 text-sm"
                  >
                    {t('base64.copyAndSave')}
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={handleShare}
                    className="min-h-9 px-4 text-sm"
                  >
                    {t('base64.shareResult')}
                  </SecondaryButton>
                </div>
              )}
            </GlassPanel>

            {history.length > 0 && (
              <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="inline-flex items-center gap-2 text-base font-semibold text-white">
                    <LabelIcon>
                      <HistoryIcon />
                    </LabelIcon>
                    {t('base64.history')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-white/38" htmlFor="base64-history-limit">
                      {t('base64.historyLimit')}
                    </label>
                    <SelectInput
                      id="base64-history-limit"
                      value={historyLimit}
                      onChange={(event) => {
                        const nextLimit = event.target.value as typeof historyLimit;
                        trackBase64Event('history_limit_change', `History limit change; from=${historyLimit}; to=${nextLimit}; count=${history.length}`, history.length);
                        setHistoryLimit(nextLimit);
                      }}
                      className="min-h-9 w-28 rounded-full px-3 py-1.5 text-xs"
                    >
                      <option value="20">{t('base64.historyLimit20')}</option>
                      <option value="40">{t('base64.historyLimit40')}</option>
                      <option value="100">{t('base64.historyLimit100')}</option>
                      <option value="unlimited">{t('base64.historyLimitUnlimited')}</option>
                    </SelectInput>
                    <TextButton onClick={clearHistory} className="text-sm text-white/44 hover:text-rose-100">
                      {t('base64.clearHistory')}
                    </TextButton>
                  </div>
                </div>
                <div className="grid gap-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleHistoryItemClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleHistoryItemClick(item);
                        }
                      }}
                      className="cursor-pointer rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-4 text-left transition-colors duration-200 hover:border-white/[0.16] hover:bg-white/[0.07]"
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.mode === 'encode'
                            ? 'bg-cyan-300/12 text-cyan-50'
                            : 'bg-emerald-300/12 text-emerald-50'
                        }`}>
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            {item.mode === 'encode' ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h8M4 12h10M4 17h6M15 8l4 4-4 4" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7h-8M20 12H10m10 5h-6M9 8l-4 4 4 4" />
                            )}
                          </svg>
                          {item.mode === 'encode' ? modeLabels.encode : modeLabels.decode}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-white/38">
                            {formatTime(item.timestamp)}
                          </span>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleCopyHistoryOutput(item.output);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/72"
                            title={t('base64.copyResult')}
                            aria-label={t('base64.copyResult')}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h10a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7V5a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h0" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleShareHistoryItem(item);
                            }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/40 transition-colors hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/72"
                            title={t('base64.shareResult')}
                            aria-label={t('base64.shareResult')}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.7 12.7l6.6 3.8M15.3 7.5L8.7 11.3" />
                              <circle cx="6" cy="12" r="2.5" />
                              <circle cx="18" cy="6" r="2.5" />
                              <circle cx="18" cy="18" r="2.5" />
                            </svg>
                          </button>
                          <TextButton
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteHistoryItem(item.id);
                            }}
                            className="text-xs text-white/38 hover:text-rose-100"
                            aria-label={t('base64.deleteHistoryItem')}
                          >
                            {language === 'zh' ? '删除' : 'Delete'}
                          </TextButton>
                        </span>
                      </div>
                      <div className="text-sm text-white/66">
                        <div className="mb-1">
                          <span className="text-xs uppercase tracking-[0.14em] text-white/35">
                            {t('base64.input')}
                          </span>
                          <div className="whitespace-pre-wrap break-words text-white/70">
                            {item.input}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-[0.14em] text-white/35">
                            {t('base64.output')}
                          </span>
                          <div className="whitespace-pre-wrap break-words text-white/70">
                            {item.output}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            )}

            <GlassPanel className="transform-none p-4 hover:translate-y-0 md:p-6">
              <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white/84">
                <LabelIcon>
                  <InfoIcon />
                </LabelIcon>
                {t('base64.usageTitle')}
              </h2>
              <ul className="space-y-2 text-sm leading-6 text-white/58">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/38" aria-hidden="true" />
                  <span>{t('base64.usage1')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/38" aria-hidden="true" />
                  <span>{t('base64.usage2')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/38" aria-hidden="true" />
                  <span>{t('base64.usage3')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/38" aria-hidden="true" />
                  <span>{t('base64.usage4')}</span>
                </li>
              </ul>
            </GlassPanel>
          </div>
        </section>
      </main>

      <footer>
        <Foot />
      </footer>
    </div>
  );
}

function Base64ToolPageFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-20">
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
