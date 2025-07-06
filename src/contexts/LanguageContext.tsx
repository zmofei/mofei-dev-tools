"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译内容
const translations = {
  zh: {
    'nav.tools': '工具',
    'nav.github': 'Github',
    'nav.blog': 'Mofei 的博客',
    'title': '工具合集',
    'subtitle': '这些是Mofei在开发过程中经常使用的便捷工具。分享给大家，希望能让你的工作更轻松一些 😊',
    'categories.text': '文本工具',
    'categories.dev': '开发工具', 
    'categories.design': '设计工具',
    'categories.util': '实用工具',
    'categories.other': '其他',
    'tools.base64.name': 'Base64',
    'tools.base64.description': 'Base64编码解码工具，用于文本转换',
    'tools.base64.category': '文本工具',
    'footer.copyright': '© 2025 Mofei',
    'footer.moreTools': '更多工具即将推出',
    'footer.moreToolsDesc': '更多实用工具正在开发中，包括JSON格式化、颜色工具、正则测试等等。敬请期待！',
    'footer.bigText.desktop': 'MOFEI DEVELOPMENT TOOLS.',
    'footer.bigText.mobile1': 'Mpfei Tools',
    'footer.bigText.mobile2': 'Development Tools!',
    'base64.title': 'Base64 编码解码工具',
    'base64.subtitle': '快速的 Base64 编码和解码转换',
    'base64.backToTools': '返回工具集',
    'base64.encode': '编码',
    'base64.decode': '解码',
    'base64.inputText': '输入文本',
    'base64.inputBase64': '输入 Base64',
    'base64.outputBase64': '输出 Base64',
    'base64.outputText': '输出文本',
    'base64.placeholderEncode': '输入要编码的文本...',
    'base64.placeholderDecode': '输入要解码的 Base64 字符串...',
    'base64.startEncode': '开始编码',
    'base64.startDecode': '开始解码',
    'base64.clear': '清空',
    'base64.copy': '复制',
    'base64.resultPlaceholder': '转换结果将显示在这里...',
    'base64.decodeError': '解码失败：无效的 Base64 字符串',
    'base64.history': '转换历史',
    'base64.clearHistory': '清空历史',
    'base64.input': '输入：',
    'base64.output': '输出：',
    'base64.justNow': '刚刚',
    'base64.minutesAgo': '分钟前',
    'base64.hoursAgo': '小时前',
    'base64.usageTitle': '使用说明',
    'base64.usage1': 'Base64 是一种使用 64 个可打印字符来表示二进制数据的方法',
    'base64.usage2': '支持中文和其他 Unicode 字符的编码/解码',
    'base64.usage3': '所有处理都在您的浏览器本地完成，不会上传数据到服务器',
    'base64.usage4': '点击历史记录项可以快速重复之前的转换',
    'base64.share': '分享',
    'base64.shareResult': '分享结果',
    'base64.shareCopied': '分享链接已复制！',
    'footer.description': '我的博客是 https://www.mofei.life，这里记录了我开发过程中常用的一些工具，也许你也会觉得有用。'
  },
  en: {
    'nav.tools': 'Tools',
    'nav.github': 'Github', 
    'nav.blog': "Mofei's Blog",
    'title': 'Tools Collection',
    'subtitle': 'These are the handy tools Mofei frequently uses during development. Sharing them with you, hoping to make your work a bit easier 😊',
    'categories.text': 'Text Tools',
    'categories.dev': 'Development Tools',
    'categories.design': 'Design Tools', 
    'categories.util': 'Utility Tools',
    'categories.other': 'Others',
    'tools.base64.name': 'Base64',
    'tools.base64.description': 'Base64 encode/decode tool for text conversion',
    'tools.base64.category': 'Text Tool',
    'footer.copyright': '© 2025 Mofei',
    'footer.moreTools': 'More Tools Coming',
    'footer.moreToolsDesc': 'More useful tools are in development, including JSON formatter, color tools, regex tester, and more. Stay tuned!',
    'footer.bigText.desktop': 'MOFEI DEVELOPMENT TOOLS.',
    'footer.bigText.mobile1': 'MOFEI TOOLS!',
    'footer.bigText.mobile2': 'DEVELOPMENT!',
    'base64.title': 'Base64 Encode/Decode Tool',
    'base64.subtitle': 'Quick Base64 encoding and decoding conversion',
    'base64.backToTools': 'Back to Tools',
    'base64.encode': 'Encode',
    'base64.decode': 'Decode',
    'base64.inputText': 'Input Text',
    'base64.inputBase64': 'Input Base64',
    'base64.outputBase64': 'Output Base64',
    'base64.outputText': 'Output Text',
    'base64.placeholderEncode': 'Enter text to encode...',
    'base64.placeholderDecode': 'Enter Base64 string to decode...',
    'base64.startEncode': 'Start Encode',
    'base64.startDecode': 'Start Decode',
    'base64.clear': 'Clear',
    'base64.copy': 'Copy',
    'base64.resultPlaceholder': 'Conversion result will appear here...',
    'base64.decodeError': 'Decode failed: Invalid Base64 string',
    'base64.history': 'Conversion History',
    'base64.clearHistory': 'Clear History',
    'base64.input': 'Input:',
    'base64.output': 'Output:',
    'base64.justNow': 'Just now',
    'base64.minutesAgo': 'm ago',
    'base64.hoursAgo': 'h ago',
    'base64.usageTitle': 'Usage Instructions',
    'base64.usage1': 'Base64 is a method to represent binary data using 64 printable characters',
    'base64.usage2': 'Supports encoding/decoding of Chinese and other Unicode characters',
    'base64.usage3': 'All processing is done locally in your browser, no data is uploaded to servers',
    'base64.usage4': 'Click on history items to quickly repeat previous conversions',
    'base64.share': 'Share',
    'base64.shareResult': 'Share Result',
    'base64.shareCopied': 'Share link copied!',
    'footer.description': 'My blog is https://www.mofei.life. This page collects tools I frequently use in development—hope you find them helpful too.'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // 从URL路径中获取语言参数
    const pathSegments = pathname.split('/');
    const langSegment = pathSegments[1]; // 第一个段应该是语言参数
    
    if (langSegment === 'zh') {
      setLanguage('zh');
    } else if (langSegment === 'en') {
      setLanguage('en');
    } else {
      setLanguage('en');
    }
  }, [pathname]);

  const changeLanguage = (lang: Language) => {
    // 切换到对应的语言路由
    const pathSegments = pathname.split('/');
    const currentLang = pathSegments[1];
    
    if (['zh', 'en'].includes(currentLang)) {
      // 如果当前路径已经包含语言参数
      const restPath = pathSegments.slice(2).join('/');
      if (lang === 'en') {
        // 英文版：如果是首页，跳转到根路径，否则使用 /en/xxx
        const newPath = restPath ? `/en/${restPath}` : '/';
        router.push(newPath);
      } else {
        // 中文版：始终使用 /zh/xxx
        const newPath = restPath ? `/zh/${restPath}` : '/zh';
        router.push(newPath);
      }
    } else {
      // 如果当前路径不包含语言参数（根路径 /）
      if (lang === 'zh') {
        const newPath = pathname === '/' ? '/zh' : `/zh${pathname}`;
        router.push(newPath);
      } else {
        // 英文版，如果是首页就留在根路径
        if (pathname !== '/') {
          const newPath = `/en${pathname}`;
          router.push(newPath);
        }
        // 如果已经是根路径，就不需要跳转
      }
    }
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}