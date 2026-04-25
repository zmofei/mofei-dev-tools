"use client"

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  GlassPanel,
  PrimaryPillLink,
  SecondaryButton,
  SectionLabel,
  SelectInput,
  StatusToast,
  TextButton,
} from '@mofei-dev/ui';
import ContributeButton from '@/components/Common/ContributeButton';
import Foot from '@/components/Common/Foot';
import ResizableTextarea from '@/components/Common/ResizableTextarea';
import { event } from '@/components/GoogleAnalytics';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';
import {
  IMAGE_MIME_TYPES,
  type Base64ImageInput,
  type ImageMimeType,
  extensionForImageMimeType,
  formatImageBytes,
  parseBase64ImageInput,
} from '@/lib/base64-image-tool';

type UploadedImage = {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  base64: string;
};

type GeneratedHistoryItem = UploadedImage & {
  id: string;
  timestamp: number;
  favorite: boolean;
};

type ImageInputSource = 'file_picker' | 'drag_drop' | 'clipboard';
type CopySurface = 'generated' | 'preview_input' | 'history';
type CopyFormat = 'data_url' | 'raw_base64';
type DownloadSurface = 'generated' | 'preview_input';
type GAValue = string | number | boolean | null | undefined;

const HISTORY_STORAGE_KEY = 'base64-image-generated-history';
const RECENT_HISTORY_LIMIT = 10;
const HISTORY_MAX_FILE_SIZE = 1024 * 1024;
const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;

function safeLocalStorageGet(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeLocalStorageRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage may be unavailable in private browsing or locked-down contexts.
  }
}

function imageSizeBucket(bytes: number) {
  if (bytes < 10 * 1024) return '0-10kb';
  if (bytes < 100 * 1024) return '10-100kb';
  if (bytes < 1024 * 1024) return '100kb-1mb';
  if (bytes <= 5 * 1024 * 1024) return '1-5mb';
  return 'over-5mb';
}

function payloadLengthBucket(length: number) {
  if (length < 10_000) return '0-10k';
  if (length < 100_000) return '10k-100k';
  if (length < 1_000_000) return '100k-1m';
  return 'over-1m';
}

function historyCountBucket(count: number) {
  if (count === 0) return '0';
  if (count <= 3) return '1-3';
  if (count <= 10) return '4-10';
  return 'over-10';
}

function safeMimeType(mimeType: string) {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mimeType) ? mimeType : mimeType ? 'image_other' : 'unknown';
}

function previewInputType(value: string) {
  return value.trim().toLowerCase().startsWith('data:') ? 'data_url' : 'raw_base64';
}

const COPY = {
  en: {
    title: 'Image to Base64 Converter',
    subtitle: 'Convert PNG, JPG, WebP, SVG, GIF, and AVIF images to Base64 Data URLs, then preview or copy the result directly in your browser.',
    back: 'Back to Tools',
    textTool: 'Need text Base64? Open the text converter',
    uploadTitle: 'Image to Base64',
    uploadLabel: 'Upload image',
    uploadHelp: 'PNG, JPG, WebP, SVG, GIF, and AVIF are supported. Files are converted locally in this browser and are not uploaded to this site server.',
    dropZoneTitle: 'Drop an image here, paste from clipboard, or click to choose.',
    dropZoneActive: 'Release to convert this image.',
    chooseFile: 'Choose image',
    clear: 'Clear',
    clearUpload: 'Clear upload',
    clearPreviewInput: 'Clear preview input',
    output: 'Base64 Data URL',
    outputPlaceholder: 'Upload an image to generate a Base64 data URL...',
    copyDataUrl: 'Copy Data URL',
    copyBase64: 'Copy raw Base64',
    download: 'Download image',
    previewTitle: 'Preview Base64 Image',
    previewInput: 'Base64 image input',
    previewPlaceholder: 'Paste a full data:image/...;base64,... URL or raw Base64 image data...',
    mimeType: 'Fallback type for raw Base64',
    invalidImage: 'Invalid Base64 image data. Paste a data:image URL or valid Base64 payload.',
    copied: 'Copied to clipboard.',
    copyFailed: 'Copy failed. Please select the text and copy it manually.',
    fileError: 'Please choose a supported image file.',
    fileTooLarge: 'Please choose an image smaller than 5 MB.',
    usageTitle: 'Data URL, privacy, and use cases',
    usage1: 'Use the full Data URL when embedding images in HTML img src, CSS background-image, JSON payloads, or quick prototypes.',
    usage2: 'Raw Base64 previews auto-detect PNG, JPG, WebP, GIF, AVIF, and SVG when possible. The fallback type is only used when the format cannot be inferred.',
    usage3: 'Base64 is usually about one third larger than the original file. Large production images are usually better served as normal image files.',
    usage4: 'Conversion and preview run in your browser. Generated history is stored only in localStorage, and images larger than 1 MB are not saved to history.',
    faqTitle: 'Image Base64 FAQ',
    faqItems: [
      {
        question: 'How do I convert an image to Base64?',
        answer: 'Upload, paste, or drop a PNG, JPG, WebP, SVG, GIF, or AVIF image. The tool generates a complete data:image/...;base64,... Data URL and raw Base64 payload.',
      },
      {
        question: 'Can I convert Base64 back to an image?',
        answer: 'Yes. Paste a Data URL or raw Base64 image into the preview panel. After it renders, you can download the normalized image file.',
      },
      {
        question: 'Should I copy Data URL or raw Base64?',
        answer: 'Copy the full Data URL for HTML, CSS, Markdown-like content, and browser previews. Copy raw Base64 only when an API, JSON field, or another system explicitly asks for the payload without the data:image prefix.',
      },
      {
        question: 'Is this Base64 image converter private?',
        answer: 'Yes. Files are processed locally in your browser. The page does not upload your image to this site server, and generated history stays in this browser localStorage.',
      },
      {
        question: 'When should I use the text Base64 converter instead?',
        answer: 'Use the text Base64 converter for plain text, JWT fragments, configuration strings, API tokens, or other non-image content.',
      },
    ],
    noPreview: 'Preview will appear here.',
    generatedFrom: 'Generated from',
    historyTitle: 'Generated image history',
    historyHelp: 'Favorites stay pinned. Recent non-favorites keep the latest 10 items. Images larger than 1 MB are not stored.',
    favoritesTitle: 'Favorites',
    recentTitle: 'Recent',
    clearHistory: 'Clear recent',
    historyStorageFull: 'History storage is full. Favorites were kept, but this item was not saved.',
    deleteHistoryItem: 'Delete',
    restoreHistoryItem: 'Restore this image',
    restoreHistoryItemNamed: 'Restore image',
    favoriteHistoryItem: 'Favorite',
    unfavoriteHistoryItem: 'Unfavorite',
    deleteHistoryItemNamed: 'Delete image',
    infoButtonLabel: 'What is Base64 image data?',
    infoTitle: 'What is a Base64 image?',
    infoIntro: 'Base64 turns binary image bytes into plain text. A Data URL adds the MIME type before that text, so browsers can render it directly.',
    infoSteps: [
      'Upload an image to generate a complete data:image/...;base64,... URL for HTML, CSS, JSON, or quick prototypes.',
      'Copy raw Base64 only when another system already asks for the payload without the data:image prefix.',
      'Paste a Data URL or raw Base64 into the preview panel to verify whether the image renders correctly.',
      'Use favorites for generated images you want to keep. Recent non-favorites rotate after 10 items.',
    ],
  },
  zh: {
    title: '图片转 Base64 转换器',
    subtitle: '将 PNG、JPG、WebP、SVG、GIF、AVIF 图片转换为 Base64 Data URL，并可在浏览器中直接预览、复制或下载结果。',
    back: '返回工具集',
    textTool: '需要文本 Base64？打开文本转换工具',
    uploadTitle: '图片转 Base64',
    uploadLabel: '上传图片',
    uploadHelp: '支持 PNG、JPG、WebP、SVG、GIF 和 AVIF。文件只在当前浏览器中转换，不会上传到本站服务器。',
    dropZoneTitle: '拖入图片、从剪贴板粘贴，或点击选择图片。',
    dropZoneActive: '松开后转换这张图片。',
    chooseFile: '选择图片',
    clear: '清空',
    clearUpload: '清空上传',
    clearPreviewInput: '清空预览输入',
    output: 'Base64 Data URL',
    outputPlaceholder: '上传图片后将在这里生成 Base64 Data URL...',
    copyDataUrl: '复制 Data URL',
    copyBase64: '复制裸 Base64',
    download: '下载图片',
    previewTitle: '预览 Base64 图片',
    previewInput: 'Base64 图片输入',
    previewPlaceholder: '粘贴完整 data:image/...;base64,... URL，或粘贴裸 Base64 图片内容...',
    mimeType: '裸 Base64 备用类型',
    invalidImage: '无效的 Base64 图片数据。请粘贴 data:image URL 或有效的 Base64 内容。',
    copied: '已复制到剪贴板。',
    copyFailed: '复制失败。请选中文本后手动复制。',
    fileError: '请选择支持的图片文件。',
    fileTooLarge: '请选择小于 5 MB 的图片。',
    usageTitle: 'Data URL、隐私和使用场景',
    usage1: '如果要嵌入 HTML img src、CSS background-image、JSON 字段或临时原型，通常使用完整 Data URL。',
    usage2: '裸 Base64 会尽量自动识别 PNG、JPG、WebP、GIF、AVIF 和 SVG。只有无法识别时才会使用备用类型。',
    usage3: 'Base64 通常会比原始文件大约三分之一。生产页面里的大图通常更适合使用普通图片文件，而不是内联 Base64。',
    usage4: '转换和预览都在浏览器本地完成。生成历史只保存在 localStorage，超过 1 MB 的图片不会写入历史记录。',
    faqTitle: '图片 Base64 常见问题',
    faqItems: [
      {
        question: '如何把图片转换为 Base64？',
        answer: '上传、粘贴或拖入 PNG、JPG、WebP、SVG、GIF、AVIF 图片，工具会生成完整的 data:image/...;base64,... Data URL 和裸 Base64 内容。',
      },
      {
        question: '可以把 Base64 还原成图片吗？',
        answer: '可以。把 Data URL 或裸 Base64 图片内容粘贴到预览区域，成功渲染后可以下载规范化后的图片文件。',
      },
      {
        question: '应该复制 Data URL 还是裸 Base64？',
        answer: '用于 HTML、CSS、类似 Markdown 的内容或浏览器预览时，复制完整 Data URL。只有 API、JSON 字段或其他系统明确要求不带 data:image 前缀时，才复制裸 Base64。',
      },
      {
        question: '这个 Base64 图片转换器是私密的吗？',
        answer: '是的。图片只在你的浏览器本地处理，不会上传到本站服务器。生成历史也只保存在当前浏览器的 localStorage。',
      },
      {
        question: '什么时候应该使用文本 Base64 转换器？',
        answer: '如果要处理普通文本、JWT 片段、配置字符串、API Token 或其他非图片内容，请使用文本 Base64 转换器。',
      },
    ],
    noPreview: '预览会显示在这里。',
    generatedFrom: '生成自',
    historyTitle: '生成图片记录',
    historyHelp: '收藏会固定保留；未收藏的最近记录最多保留 10 条。超过 1 MB 的图片不会保存。',
    favoritesTitle: '收藏',
    recentTitle: '最近',
    clearHistory: '清空最近',
    historyStorageFull: '历史存储空间已满。收藏已保留，但这条记录没有保存。',
    deleteHistoryItem: '删除',
    restoreHistoryItem: '恢复这张图片',
    restoreHistoryItemNamed: '恢复图片',
    favoriteHistoryItem: '收藏',
    unfavoriteHistoryItem: '取消收藏',
    deleteHistoryItemNamed: '删除图片',
    infoButtonLabel: '什么是 Base64 图片？',
    infoTitle: '什么是 Base64 图片？',
    infoIntro: 'Base64 会把图片的二进制内容转换成纯文本。Data URL 会在这段文本前加上图片类型，所以浏览器可以直接显示。',
    infoSteps: [
      '上传图片后会生成完整的 data:image/...;base64,... URL，适合放进 HTML、CSS、JSON 或临时原型。',
      '只有当接口或配置明确要求不带 data:image 前缀时，才复制裸 Base64。',
      '把 Data URL 或裸 Base64 粘贴到预览区域，可以检查图片内容是否能正常渲染。',
      '需要长期保留的生成结果可以点收藏；未收藏的最近记录最多保留 10 条。',
    ],
  },
} as const;

function LabelIcon({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'cyan' | 'emerald' }) {
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

function ImageIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6.75 5.25h10.5a2.5 2.5 0 012.5 2.5v8.5a2.5 2.5 0 01-2.5 2.5H6.75a2.5 2.5 0 01-2.5-2.5v-8.5a2.5 2.5 0 012.5-2.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7.5 15.5l2.75-3 2.25 2.25 1.75-1.75 2.75 2.5M8.75 8.75h.01" />
    </svg>
  );
}

function ImageToBase64Icon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6.75 5.25h6.5a2.25 2.25 0 012.25 2.25v1.75" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4.25 16.25l3-3 2 2 1.5-1.5 2.25 2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.25 8.5h.01M16.25 12h3.5M16.25 15h2.25M16.25 18h3.5" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M6.75 18.75h10.5A2.5 2.5 0 0019.75 16.25v-8.5" />
    </svg>
  );
}

function ImagePreviewIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.75 12s3-5.25 8.25-5.25S20.25 12 20.25 12s-3 5.25-8.25 5.25S3.75 12 3.75 12z" />
      <circle cx="12" cy="12" r="2.35" strokeWidth={1.75} />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.5 8.5L5 12l3.5 3.5M15.5 8.5L19 12l-3.5 3.5M13.25 6.75l-2.5 10.5" />
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

function PreviewBox({
  src,
  alt,
  emptyText,
  onImageLoad,
  onImageError,
}: {
  src: string;
  alt: string;
  emptyText: string;
  onImageLoad?: () => void;
  onImageError?: () => void;
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-[18px] border border-white/[0.08] bg-black/20 p-4">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onLoad={onImageLoad}
          onError={onImageError}
          className="max-h-[520px] max-w-full rounded-md object-contain"
        />
      ) : (
        <p className="text-sm text-white/38">{emptyText}</p>
      )}
    </div>
  );
}

export default function Base64ImagePageComponent() {
  const { language } = useLanguage();
  const pathname = usePathname();
  const copy = COPY[language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileReadTokenRef = useRef(0);
  const fileReaderRef = useRef<FileReader | null>(null);
  const messageTimerRef = useRef<number | null>(null);
  const previewDataUrlRef = useRef('');
  const trackedPreviewRef = useRef('');
  const trackedRenderRef = useRef('');
  const trackedViewRef = useRef(false);
  const historyRef = useRef<GeneratedHistoryItem[]>([]);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [pasteInput, setPasteInput] = useState('');
  const [rawMimeType, setRawMimeType] = useState<ImageMimeType>('image/png');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewLoadError, setPreviewLoadError] = useState(false);
  const [history, setHistory] = useState<GeneratedHistoryItem[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const deferredPasteInput = useDeferredValue(pasteInput);

  const parsedPreview = useMemo((): Base64ImageInput & { error: string } => {
    if (!deferredPasteInput.trim()) {
      return { dataUrl: '', mimeType: '', base64: '', error: '' };
    }

    try {
      return { ...parseBase64ImageInput(deferredPasteInput, rawMimeType), error: '' };
    } catch {
      return { dataUrl: '', mimeType: '', base64: '', error: copy.invalidImage };
    }
  }, [copy.invalidImage, deferredPasteInput, rawMimeType]);

  const trackImageEvent = useCallback((action: string, params: Record<string, GAValue> = {}) => {
    event(`base64_image_${action}`, 'Tool Usage', {
      tool: 'base64_image',
      tool_slug: 'base64-image',
      lang: language,
      route_type: pathname.startsWith('/zh') ? 'localized' : 'root',
      ...params,
    });
  }, [language, pathname]);

  useEffect(() => {
    if (trackedViewRef.current) return;
    trackedViewRef.current = true;
    trackImageEvent('view');
  }, [trackImageEvent]);

  const showMessage = useCallback((nextMessage: string) => {
    if (messageTimerRef.current) {
      window.clearTimeout(messageTimerRef.current);
    }
    setMessage(nextMessage);
    messageTimerRef.current = window.setTimeout(() => {
      setMessage('');
      messageTimerRef.current = null;
    }, 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        window.clearTimeout(messageTimerRef.current);
      }
      fileReadTokenRef.current += 1;
      fileReaderRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    previewDataUrlRef.current = parsedPreview.dataUrl;
    setPreviewLoadError(false);
  }, [parsedPreview.dataUrl]);

  useEffect(() => {
    try {
      const savedHistory = safeLocalStorageGet(HISTORY_STORAGE_KEY);
      if (!savedHistory) return;

      const parsedHistory = JSON.parse(savedHistory);
      if (!Array.isArray(parsedHistory)) return;

      const normalizedHistory = parsedHistory
        .filter((item): item is GeneratedHistoryItem =>
          typeof item?.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.size === 'number' &&
          typeof item.type === 'string' &&
          typeof item.dataUrl === 'string' &&
          typeof item.base64 === 'string' &&
          typeof item.timestamp === 'number',
        )
        .map((item) => ({
          ...item,
          favorite: item.favorite === true,
        }))
        .sort((a, b) => b.timestamp - a.timestamp);

      const nextHistory = [
        ...normalizedHistory.filter((item) => item.favorite),
        ...normalizedHistory.filter((item) => !item.favorite).slice(0, RECENT_HISTORY_LIMIT),
      ];
      historyRef.current = nextHistory;
      setHistory(nextHistory);
    } catch {
      safeLocalStorageRemove(HISTORY_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const persistHistory = useCallback((nextHistory: GeneratedHistoryItem[], fallbackHistory: GeneratedHistoryItem[] = []) => {
    const favorites = nextHistory
      .filter((item) => item.favorite)
      .sort((a, b) => b.timestamp - a.timestamp);
    const recent = nextHistory
      .filter((item) => !item.favorite)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, RECENT_HISTORY_LIMIT);
    let historyToSave = [...favorites, ...recent];

    while (historyToSave.length > 0) {
      if (safeLocalStorageSet(HISTORY_STORAGE_KEY, JSON.stringify(historyToSave))) {
        return historyToSave;
      }

      let recentIndex = -1;
      for (let index = historyToSave.length - 1; index >= 0; index -= 1) {
        if (!historyToSave[index].favorite) {
          recentIndex = index;
          break;
        }
      }
      historyToSave = recentIndex === -1
        ? []
        : historyToSave.filter((_, index) => index !== recentIndex);
    }

    if (!safeLocalStorageSet(HISTORY_STORAGE_KEY, JSON.stringify(fallbackHistory))) {
      safeLocalStorageRemove(HISTORY_STORAGE_KEY);
    }

    showMessage(copy.historyStorageFull);
    trackImageEvent('error', {
      error_code: 'history_storage_full',
      surface: 'history',
      history_count_bucket: historyCountBucket(fallbackHistory.length),
    });
    return fallbackHistory;
  }, [copy.historyStorageFull, showMessage, trackImageEvent]);

  const saveGeneratedHistoryItem = useCallback((image: UploadedImage) => {
    if (image.size > HISTORY_MAX_FILE_SIZE) {
      trackImageEvent('history_save', {
        result: 'skipped_too_large',
        mime_type: safeMimeType(image.type),
        size_bucket: imageSizeBucket(image.size),
      });
      return;
    }

    const prevHistory = historyRef.current;
    const existingItem = prevHistory.find((item) => item.dataUrl === image.dataUrl);
    const newItem: GeneratedHistoryItem = {
      ...image,
      id: `${Date.now()}-${image.name}`,
      timestamp: Date.now(),
      favorite: existingItem?.favorite ?? false,
    };
    const dedupedHistory = prevHistory.filter((item) => item.dataUrl !== image.dataUrl);
    const persistedHistory = persistHistory([newItem, ...dedupedHistory], prevHistory);
    historyRef.current = persistedHistory;
    setHistory(persistedHistory);
    trackImageEvent('history_save', {
      result: persistedHistory === prevHistory ? 'storage_full' : 'success',
      history_item_type: newItem.favorite ? 'favorite' : 'recent',
      history_count_bucket: historyCountBucket(persistedHistory.length),
      mime_type: safeMimeType(image.type),
      size_bucket: imageSizeBucket(image.size),
      payload_length_bucket: payloadLengthBucket(image.base64.length),
    });
  }, [persistHistory, trackImageEvent]);

  const handleCopy = useCallback(async (
    text: string,
    surface: CopySurface,
    outputFormat: CopyFormat,
    mimeType = '',
  ) => {
    if (!text) return;
    const baseParams = {
      surface,
      output_format: outputFormat,
      mime_type: safeMimeType(mimeType),
      payload_length_bucket: payloadLengthBucket(text.length),
    };
    let result = 'success';

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!copied) {
          showMessage(copy.copyFailed);
          trackImageEvent('copy', { ...baseParams, result: 'failure' });
          trackImageEvent('error', { error_code: 'copy_failed', surface });
          return;
        }
        result = 'fallback_success';
      } catch {
        showMessage(copy.copyFailed);
        trackImageEvent('copy', { ...baseParams, result: 'failure' });
        trackImageEvent('error', { error_code: 'copy_failed', surface });
        return;
      }
    }

    showMessage(copy.copied);
    trackImageEvent('copy', { ...baseParams, result });
  }, [copy.copied, copy.copyFailed, showMessage, trackImageEvent]);

  const handleFile = useCallback((file: File | undefined, source: ImageInputSource = 'file_picker') => {
    if (!file) return;

    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      setError(copy.fileTooLarge);
      trackImageEvent('upload', {
        source,
        result: 'rejected_too_large',
        mime_type: safeMimeType(file.type),
        size_bucket: imageSizeBucket(file.size),
      });
      trackImageEvent('error', {
        error_code: 'file_too_large',
        source,
        mime_type: safeMimeType(file.type),
        size_bucket: imageSizeBucket(file.size),
      });
      return;
    }

    const hasImageExtension = /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name);
    if (file.type && !file.type.startsWith('image/') && !hasImageExtension) {
      setError(copy.fileError);
      trackImageEvent('upload', {
        source,
        result: 'rejected_unsupported',
        mime_type: safeMimeType(file.type),
        size_bucket: imageSizeBucket(file.size),
      });
      trackImageEvent('error', {
        error_code: 'unsupported_file',
        source,
        mime_type: safeMimeType(file.type),
        size_bucket: imageSizeBucket(file.size),
      });
      return;
    }

    trackImageEvent('input_started', {
      source,
      mime_type: safeMimeType(file.type),
      size_bucket: imageSizeBucket(file.size),
    });
    fileReaderRef.current?.abort();
    const readToken = fileReadTokenRef.current + 1;
    fileReadTokenRef.current = readToken;
    const reader = new FileReader();
    fileReaderRef.current = reader;
    reader.onload = () => {
      if (fileReadTokenRef.current !== readToken) return;

      const rawDataUrl = String(reader.result || '');
      const rawBase64 = rawDataUrl.includes(',') ? rawDataUrl.slice(rawDataUrl.indexOf(',') + 1) : '';
      let parsedImage: Base64ImageInput;

      try {
        parsedImage = parseBase64ImageInput(rawDataUrl);
      } catch {
        try {
          parsedImage = parseBase64ImageInput(rawBase64);
        } catch {
          setError(copy.fileError);
          trackImageEvent('upload', {
            source,
            result: 'parse_error',
            mime_type: safeMimeType(file.type),
            size_bucket: imageSizeBucket(file.size),
          });
          trackImageEvent('error', {
            error_code: 'file_parse_error',
            source,
            mime_type: safeMimeType(file.type),
            size_bucket: imageSizeBucket(file.size),
          });
          return;
        }
      }

      const nextImage = {
        name: file.name,
        size: file.size,
        type: parsedImage.mimeType,
        dataUrl: parsedImage.dataUrl,
        base64: parsedImage.base64,
      };

      setUploadedImage(nextImage);
      saveGeneratedHistoryItem(nextImage);
      setError('');
      trackImageEvent('upload', {
        source,
        result: 'success',
        mime_type: safeMimeType(parsedImage.mimeType),
        size_bucket: imageSizeBucket(file.size),
        payload_length_bucket: payloadLengthBucket(parsedImage.base64.length),
        saved_to_history: file.size <= HISTORY_MAX_FILE_SIZE,
      });
    };
    reader.onerror = () => {
      if (fileReadTokenRef.current !== readToken) return;
      setError(copy.fileError);
      trackImageEvent('upload', {
        source,
        result: 'read_error',
        mime_type: safeMimeType(file.type),
        size_bucket: imageSizeBucket(file.size),
      });
      trackImageEvent('error', {
        error_code: 'file_read_error',
        source,
        mime_type: safeMimeType(file.type),
        size_bucket: imageSizeBucket(file.size),
      });
    };
    reader.onabort = () => {
      if (fileReadTokenRef.current === readToken) {
        fileReaderRef.current = null;
      }
    };
    reader.readAsDataURL(file);
  }, [copy.fileError, copy.fileTooLarge, saveGeneratedHistoryItem, trackImageEvent]);

  const handleClearUpload = () => {
    const hadContent = Boolean(uploadedImage);
    const hadPendingRead = Boolean(fileReaderRef.current);
    fileReadTokenRef.current += 1;
    fileReaderRef.current?.abort();
    fileReaderRef.current = null;
    setUploadedImage(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (hadContent || hadPendingRead) {
      trackImageEvent('clear_upload', {
        had_content: hadContent,
        had_pending_read: hadPendingRead,
      });
    }
  };

  const handlePasteImage = useCallback((clipboardData: DataTransfer) => {
    const imageFileFromItems = Array.from(clipboardData.items)
      .find((item) => item.kind === 'file' && item.type.startsWith('image/'))
      ?.getAsFile();
    const imageFile = imageFileFromItems ?? Array.from(clipboardData.files).find((file) =>
      file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name)
    );

    if (imageFile) {
      handleFile(imageFile, 'clipboard');
      return true;
    }
    return false;
  }, [handleFile]);

  useEffect(() => {
    const handleWindowPaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;
      const pastedImage = handlePasteImage(event.clipboardData);
      if (pastedImage) {
        event.preventDefault();
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [handlePasteImage]);

  const downloadDataUrl = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trackDownload = (surface: DownloadSurface, mimeType: string, payloadLength: number, size?: number) => {
    trackImageEvent('download', {
      surface,
      mime_type: safeMimeType(mimeType),
      payload_length_bucket: payloadLengthBucket(payloadLength),
      ...(typeof size === 'number' ? { size_bucket: imageSizeBucket(size) } : {}),
    });
  };

  const handleDownload = () => {
    if (!uploadedImage) return;

    downloadDataUrl(uploadedImage.dataUrl, uploadedImage.name || 'base64-image');
    trackDownload('generated', uploadedImage.type, uploadedImage.base64.length, uploadedImage.size);
  };

  const handleHistoryItemClick = (item: GeneratedHistoryItem) => {
    setUploadedImage({
      name: item.name,
      size: item.size,
      type: item.type,
      dataUrl: item.dataUrl,
      base64: item.base64,
    });
    setError('');
    trackImageEvent('history_restore', {
      history_item_type: item.favorite ? 'favorite' : 'recent',
      mime_type: safeMimeType(item.type),
      size_bucket: imageSizeBucket(item.size),
      payload_length_bucket: payloadLengthBucket(item.base64.length),
    });
  };

  const handleClearHistory = () => {
    const prevHistory = historyRef.current;
    const recentCount = prevHistory.filter((item) => !item.favorite).length;
    const nextHistory = prevHistory.filter((item) => item.favorite);
    const persistedHistory = persistHistory(nextHistory, prevHistory);
    historyRef.current = persistedHistory;
    setHistory(persistedHistory);
    trackImageEvent('history_clear_recent', {
      recent_count_bucket: historyCountBucket(recentCount),
      history_count_bucket: historyCountBucket(persistedHistory.length),
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    const prevHistory = historyRef.current;
    const deletedItem = prevHistory.find((item) => item.id === id);
    const nextHistory = prevHistory.filter((item) => item.id !== id);
    const persistedHistory = persistHistory(nextHistory, prevHistory);
    historyRef.current = persistedHistory;
    setHistory(persistedHistory);
    trackImageEvent('history_delete', {
      history_item_type: deletedItem?.favorite ? 'favorite' : 'recent',
      history_count_bucket: historyCountBucket(persistedHistory.length),
      mime_type: safeMimeType(deletedItem?.type || ''),
      size_bucket: deletedItem ? imageSizeBucket(deletedItem.size) : 'unknown',
    });
  };

  const handleToggleFavoriteHistoryItem = (id: string) => {
    const prevHistory = historyRef.current;
    const nextHistory = prevHistory.map((item) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    const updatedItem = nextHistory.find((item) => item.id === id);
    const persistedHistory = persistHistory(nextHistory, prevHistory);
    historyRef.current = persistedHistory;
    setHistory(persistedHistory);
    trackImageEvent('history_favorite_toggle', {
      favorite: Boolean(updatedItem?.favorite),
      history_count_bucket: historyCountBucket(persistedHistory.length),
      mime_type: safeMimeType(updatedItem?.type || ''),
      size_bucket: updatedItem ? imageSizeBucket(updatedItem.size) : 'unknown',
    });
  };

  const formatHistoryTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const favoriteHistory = history.filter((item) => item.favorite);
  const recentHistory = history.filter((item) => !item.favorite);

  const previewDataUrl = parsedPreview.dataUrl && !previewLoadError ? parsedPreview.dataUrl : '';
  const previewError = parsedPreview.error || (previewLoadError ? copy.invalidImage : '');
  const isPreviewPending = deferredPasteInput !== pasteInput;
  const canUsePreviewResult = Boolean(previewDataUrl && !previewError && !isPreviewPending);

  const trackPreviewRender = useCallback((
    surface: CopySurface,
    result: 'success' | 'render_error',
    mimeType: string,
    payloadLength: number,
    size?: number,
  ) => {
    const key = `${surface}:${result}:${mimeType}:${payloadLength}:${size ?? ''}`;
    if (trackedRenderRef.current === key) return;
    trackedRenderRef.current = key;
    trackImageEvent('preview_render', {
      surface,
      result,
      mime_type: safeMimeType(mimeType),
      payload_length_bucket: payloadLengthBucket(payloadLength),
      ...(typeof size === 'number' ? { size_bucket: imageSizeBucket(size) } : {}),
    });
    if (result === 'render_error') {
      trackImageEvent('error', {
        error_code: 'preview_render_error',
        surface,
        mime_type: safeMimeType(mimeType),
      });
    }
  }, [trackImageEvent]);

  useEffect(() => {
    const trimmedInput = deferredPasteInput.trim();
    if (!trimmedInput) {
      trackedPreviewRef.current = '';
      return;
    }

    const result = parsedPreview.error ? 'parse_error' : 'success';
    const key = [
      result,
      previewInputType(trimmedInput),
      parsedPreview.mimeType,
      rawMimeType,
      payloadLengthBucket(trimmedInput.length),
    ].join(':');
    if (trackedPreviewRef.current === key) return;
    trackedPreviewRef.current = key;

    trackImageEvent('preview', {
      surface: 'preview_input',
      result,
      input_type: previewInputType(trimmedInput),
      mime_type: safeMimeType(parsedPreview.mimeType),
      fallback_mime_type: safeMimeType(rawMimeType),
      payload_length_bucket: payloadLengthBucket(trimmedInput.length),
    });
    if (parsedPreview.error) {
      trackImageEvent('error', {
        error_code: 'preview_parse_error',
        surface: 'preview_input',
        input_type: previewInputType(trimmedInput),
        payload_length_bucket: payloadLengthBucket(trimmedInput.length),
      });
    }
  }, [deferredPasteInput, parsedPreview.error, parsedPreview.mimeType, rawMimeType, trackImageEvent]);

  const handleClearPreviewInput = () => {
    const hadContent = Boolean(pasteInput.trim());
    const hadPreview = Boolean(parsedPreview.dataUrl);
    setPasteInput('');
    setPreviewLoadError(false);
    if (hadContent || hadPreview) {
      trackImageEvent('clear_preview_input', {
        had_content: hadContent,
        had_preview: hadPreview,
      });
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
              {copy.back}
            </PrimaryPillLink>

            <SectionLabel className="mt-8">MOFEI DEV TOOLS</SectionLabel>
            <h1 className="mt-5 max-w-4xl text-[40px] font-semibold leading-[0.98] tracking-[-0.02em] text-white md:text-[58px] lg:text-[68px]">
              {copy.title}
            </h1>
            <div className="mt-6 flex max-w-3xl items-start gap-3">
              <p className="text-base leading-8 text-white/72 md:text-lg md:leading-9">
                {copy.subtitle}
              </p>
              <button
                type="button"
                onClick={() => {
                  const nextOpen = !showInfo;
                  setShowInfo(nextOpen);
                  if (nextOpen) {
                    trackImageEvent('help_open', { surface: 'hero_info' });
                  }
                }}
                className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.045] text-sm font-semibold text-white/62 transition-colors hover:border-white/[0.22] hover:bg-white/[0.08] hover:text-white"
                aria-expanded={showInfo}
                aria-label={copy.infoButtonLabel}
                title={copy.infoButtonLabel}
              >
                i
              </button>
            </div>

            {showInfo && (
              <div className="mt-5 max-w-3xl rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-4">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-white/84">
                  <LabelIcon>
                    <InfoIcon />
                  </LabelIcon>
                  {copy.infoTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  {copy.infoIntro}
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/58">
                  {copy.infoSteps.map((step) => (
                    <li key={step} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/38" aria-hidden="true" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <ContributeButton variant="ghost" size="sm" />
              <PrimaryPillLink
                href={language === 'en' ? '/base64' : '/zh/base64'}
                className="min-h-10 transform-none px-4 text-sm hover:translate-x-0 hover:translate-y-0"
              >
                {copy.textTool}
                <span aria-hidden="true">→</span>
              </PrimaryPillLink>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[2000px] px-5 pb-10 pt-2 md:px-10 md:pb-14 lg:px-16 lg:pb-20">
          <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
            <GlassPanel className="min-w-0 transform-none p-4 hover:translate-y-0 md:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="inline-flex items-center gap-2 text-base font-semibold text-white">
                    <LabelIcon tone="cyan">
                      <ImageToBase64Icon />
                    </LabelIcon>
                    {copy.uploadTitle}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">{copy.uploadHelp}</p>
                </div>
                <TextButton onClick={handleClearUpload} className="text-sm" aria-label={copy.clearUpload}>
                  {copy.clearUpload}
                </TextButton>
              </div>

              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDraggingImage(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingImage(true);
                }}
                onDragLeave={(event) => {
                  if (event.currentTarget.contains(event.relatedTarget as Node)) return;
                  setIsDraggingImage(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDraggingImage(false);
                  handleFile(event.dataTransfer.files[0], 'drag_drop');
                }}
                className={`rounded-[18px] border border-dashed p-4 transition-colors ${
                  isDraggingImage
                    ? 'border-cyan-200/45 bg-cyan-300/[0.08]'
                    : 'border-white/[0.16] bg-white/[0.035]'
                }`}
              >
                <label className="mb-3 block text-sm font-medium text-white/84">
                  {copy.uploadLabel}
                </label>
                <p className="mb-3 text-sm leading-6 text-white/50">
                  {isDraggingImage ? copy.dropZoneActive : copy.dropZoneTitle}
                </p>
                <input
                  id="base64-image-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                  onChange={(event) => handleFile(event.target.files?.[0], 'file_picker')}
                  className="block w-full cursor-pointer rounded-full border border-white/[0.08] bg-white/[0.045] px-4 py-2 text-sm text-white/72 file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:border-white/[0.16]"
                  aria-label={copy.chooseFile}
                />
              </div>

              {error && (
                <StatusToast variant="error" title={error} className="mt-5" />
              )}

              {uploadedImage && (
                <div className="mt-5 rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-4 text-sm text-white/62">
                  <span className="text-white/84">{copy.generatedFrom}</span>
                  <span className="ml-2 break-all">{uploadedImage.name}</span>
                  <span className="ml-2 text-white/38">({uploadedImage.type}, {formatImageBytes(uploadedImage.size)})</span>
                </div>
              )}

              <div className="mt-5">
                <PreviewBox
                  src={uploadedImage?.dataUrl || ''}
                  alt={uploadedImage?.name || copy.uploadTitle}
                  emptyText={copy.noPreview}
                  onImageLoad={() => {
                    if (!uploadedImage) return;
                    trackPreviewRender('generated', 'success', uploadedImage.type, uploadedImage.base64.length, uploadedImage.size);
                  }}
                  onImageError={() => {
                    if (!uploadedImage) return;
                    trackPreviewRender('generated', 'render_error', uploadedImage.type, uploadedImage.base64.length, uploadedImage.size);
                  }}
                />
              </div>

              <div className="mt-5 space-y-3">
                <label htmlFor="base64-image-output" className="inline-flex items-center gap-2 text-sm font-medium text-white/84">
                  <LabelIcon tone="cyan">
                    <CodeIcon />
                  </LabelIcon>
                  {copy.output}
                </label>
                <ResizableTextarea
                  id="base64-image-output"
                  value={uploadedImage?.dataUrl || ''}
                  readOnly
                  placeholder={copy.outputPlaceholder}
                  containerClassName="border-white/[0.06] bg-white/[0.035] focus-within:border-white/[0.06] focus-within:ring-0"
                  textareaClassName="cursor-default text-white/58"
                  initialHeight={180}
                  resizeTitle={language === 'zh' ? '拖拽调整输出框高度' : 'Drag to resize output height'}
                />
              </div>

              {uploadedImage && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <SecondaryButton onClick={() => handleCopy(uploadedImage.dataUrl, 'generated', 'data_url', uploadedImage.type)} className="min-h-9 px-4 text-sm">
                    {copy.copyDataUrl}
                  </SecondaryButton>
                  <SecondaryButton onClick={() => handleCopy(uploadedImage.base64, 'generated', 'raw_base64', uploadedImage.type)} className="min-h-9 px-4 text-sm">
                    {copy.copyBase64}
                  </SecondaryButton>
                  <SecondaryButton onClick={handleDownload} className="min-h-9 px-4 text-sm">
                    {copy.download}
                  </SecondaryButton>
                </div>
              )}

              {history.length > 0 && (
                <div className="mt-6 border-t border-white/[0.08] pt-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-white/84">
                        <LabelIcon>
                          <ImageIcon />
                        </LabelIcon>
                        {copy.historyTitle}
                      </h3>
                      <p className="mt-2 text-xs leading-5 text-white/42">{copy.historyHelp}</p>
                    </div>
                    <TextButton onClick={handleClearHistory} className="text-sm text-white/44 hover:text-rose-100" aria-label={copy.clearHistory}>
                      {copy.clearHistory}
                    </TextButton>
                  </div>

                  <div className="space-y-5">
                    {[
                      { title: copy.favoritesTitle, items: favoriteHistory },
                      { title: copy.recentTitle, items: recentHistory },
                    ].map((section) => section.items.length > 0 && (
                      <div key={section.title}>
                        <h4 className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-white/35">
                          {section.title}
                        </h4>
                        <div className="grid gap-3">
                          {section.items.map((item) => (
                            <div
                              key={item.id}
                              className="grid min-w-0 grid-cols-[72px_1fr] gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.035] p-3"
                            >
                              <button
                                type="button"
                                onClick={() => handleHistoryItemClick(item)}
                                className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl border border-white/[0.08] bg-black/20"
                                title={`${copy.restoreHistoryItemNamed}: ${item.name}`}
                                aria-label={`${copy.restoreHistoryItemNamed}: ${item.name}`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.dataUrl} alt={item.name} className="h-full w-full object-contain" />
                              </button>
                              <div className="min-w-0">
                                <div className="flex items-start gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleHistoryItemClick(item)}
                                    className="block min-w-0 flex-1 truncate text-left text-sm font-medium text-white/78 hover:text-white"
                                    title={item.name}
                                  >
                                    {item.name}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFavoriteHistoryItem(item.id)}
                                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                      item.favorite
                                        ? 'border-amber-200/35 bg-amber-300/15 text-amber-100'
                                        : 'border-white/[0.08] bg-white/[0.03] text-white/38 hover:border-white/[0.14] hover:text-white/72'
                                    }`}
                                    title={item.favorite ? copy.unfavoriteHistoryItem : copy.favoriteHistoryItem}
                                    aria-label={item.favorite ? copy.unfavoriteHistoryItem : copy.favoriteHistoryItem}
                                    aria-pressed={item.favorite}
                                  >
                                    ★
                                  </button>
                                </div>
                                <div className="mt-1 text-xs text-white/38">
                                  {item.type} · {formatImageBytes(item.size)} · {formatHistoryTime(item.timestamp)}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <SecondaryButton onClick={() => handleCopy(item.dataUrl, 'history', 'data_url', item.type)} className="min-h-8 px-3 text-xs">
                                    {copy.copyDataUrl}
                                  </SecondaryButton>
                                  <SecondaryButton onClick={() => handleCopy(item.base64, 'history', 'raw_base64', item.type)} className="min-h-8 px-3 text-xs">
                                    {copy.copyBase64}
                                  </SecondaryButton>
                                  <TextButton
                                    onClick={() => handleDeleteHistoryItem(item.id)}
                                    className="text-xs text-white/38 hover:text-rose-100"
                                    aria-label={`${copy.deleteHistoryItemNamed}: ${item.name}`}
                                  >
                                    {copy.deleteHistoryItem}
                                  </TextButton>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassPanel>

            <div className="min-w-0 space-y-5">
              <GlassPanel className="min-w-0 transform-none p-4 hover:translate-y-0 md:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="inline-flex items-center gap-2 text-base font-semibold text-white">
                    <LabelIcon tone="emerald">
                      <ImagePreviewIcon />
                    </LabelIcon>
                    {copy.previewTitle}
                  </h2>
                  <TextButton
                    onClick={handleClearPreviewInput}
                    className="text-sm"
                    aria-label={copy.clearPreviewInput}
                  >
                    {copy.clearPreviewInput}
                  </TextButton>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <label className="text-sm text-white/62" htmlFor="base64-image-mime">
                    {copy.mimeType}
                  </label>
                  <SelectInput
                    id="base64-image-mime"
                    value={rawMimeType}
                    onChange={(event) => {
                      const nextMimeType = event.target.value as ImageMimeType;
                      setRawMimeType(nextMimeType);
                      setPreviewLoadError(false);
                      trackImageEvent('raw_mime_change', {
                        surface: 'preview_input',
                        mime_type: safeMimeType(nextMimeType),
                      });
                    }}
                    className="min-h-9 w-44 rounded-full px-3 py-1.5 text-xs"
                  >
                    {IMAGE_MIME_TYPES.map((mimeType) => (
                      <option key={mimeType} value={mimeType}>{mimeType}</option>
                    ))}
                  </SelectInput>
                </div>

                <div className="space-y-3">
                  <label htmlFor="base64-image-preview-input" className="inline-flex items-center gap-2 text-sm font-medium text-white/84">
                    <LabelIcon tone="emerald">
                      <CodeIcon />
                    </LabelIcon>
                    {copy.previewInput}
                  </label>
                  <ResizableTextarea
                    id="base64-image-preview-input"
                    value={pasteInput}
                    onChange={(event) => {
                      setPasteInput(event.target.value);
                      setPreviewLoadError(false);
                    }}
                    placeholder={copy.previewPlaceholder}
                    initialHeight={220}
                    resizeTitle={language === 'zh' ? '拖拽调整输入框高度' : 'Drag to resize input height'}
                  />
                </div>

                {previewError && (
                  <StatusToast variant="error" title={previewError} className="mt-5" />
                )}

                <div className="mt-5">
                  <div className="hidden">
                    {parsedPreview.dataUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={parsedPreview.dataUrl}
                        alt=""
                        onLoad={(event) => {
                          if (event.currentTarget.src === previewDataUrlRef.current) {
                            setPreviewLoadError(false);
                            trackPreviewRender('preview_input', 'success', parsedPreview.mimeType, parsedPreview.base64.length);
                          }
                        }}
                        onError={(event) => {
                          if (event.currentTarget.src === previewDataUrlRef.current) {
                            setPreviewLoadError(true);
                            trackPreviewRender('preview_input', 'render_error', parsedPreview.mimeType, parsedPreview.base64.length);
                          }
                        }}
                      />
                    )}
                  </div>
                  <PreviewBox
                    src={previewDataUrl}
                    alt={copy.previewTitle}
                    emptyText={copy.noPreview}
                  />
                </div>

                {canUsePreviewResult && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <SecondaryButton onClick={() => handleCopy(parsedPreview.dataUrl, 'preview_input', 'data_url', parsedPreview.mimeType)} className="min-h-9 px-4 text-sm">
                      {copy.copyDataUrl}
                    </SecondaryButton>
                    <SecondaryButton onClick={() => handleCopy(parsedPreview.base64, 'preview_input', 'raw_base64', parsedPreview.mimeType)} className="min-h-9 px-4 text-sm">
                      {copy.copyBase64}
                    </SecondaryButton>
                    <SecondaryButton
                      onClick={() => {
                        downloadDataUrl(
                          parsedPreview.dataUrl,
                          `base64-preview.${extensionForImageMimeType(parsedPreview.mimeType)}`,
                        );
                        trackDownload('preview_input', parsedPreview.mimeType, parsedPreview.base64.length);
                      }}
                      className="min-h-9 px-4 text-sm"
                    >
                      {copy.download}
                    </SecondaryButton>
                  </div>
                )}
              </GlassPanel>

              {message && (
                <div role="status" aria-live="polite">
                  <StatusToast variant="success" title={message} />
                </div>
              )}

              <GlassPanel className="min-w-0 transform-none p-4 hover:translate-y-0 md:p-6">
                <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white/84">
                  <LabelIcon>
                    <InfoIcon />
                  </LabelIcon>
                  {copy.usageTitle}
                </h2>
                <ul className="space-y-2 text-sm leading-6 text-white/58">
                  {[copy.usage1, copy.usage2, copy.usage3, copy.usage4].map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/38" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </GlassPanel>

              <GlassPanel className="min-w-0 transform-none p-4 hover:translate-y-0 md:p-6">
                <h2 className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-white/84">
                  <LabelIcon>
                    <InfoIcon />
                  </LabelIcon>
                  {copy.faqTitle}
                </h2>
                <div className="space-y-4">
                  {copy.faqItems.map((item) => (
                    <div key={item.question} className="rounded-[16px] border border-white/[0.08] bg-white/[0.03] p-4">
                      <h3 className="text-sm font-medium text-white/84">{item.question}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/58">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <Foot />
      </footer>
    </div>
  );
}
