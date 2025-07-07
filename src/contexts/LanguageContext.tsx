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
    'nav.tools': '工具箱',
    'nav.github': 'Star & Fork',
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
    'tools.geojson.name': 'GeoJSON预览',
    'tools.geojson.description': 'GeoJSON文件预览链接生成器，快速生成geojson.io预览URL',
    'tools.geojson.category': '开发工具',
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
    'geojson.title': 'GeoJSON 预览工具',
    'geojson.subtitle': '将GeoJSON数据生成geojson.io预览链接',
    'geojson.backToTools': '返回工具集',
    'geojson.inputLabel': '输入 GeoJSON',
    'geojson.outputLabel': '预览链接',
    'geojson.placeholder': '粘贴您的GeoJSON数据...',
    'geojson.loadExample': '加载示例',
    'geojson.generate': '生成预览链接',
    'geojson.clear': '清空',
    'geojson.copy': '复制',
    'geojson.openPreview': '打开预览',
    'geojson.resultPlaceholder': '生成的预览链接将显示在这里...',
    'geojson.validationError': '无效的GeoJSON格式',
    'geojson.shareCopied': '预览链接已复制！',
    'geojson.usageTitle': '使用说明',
    'geojson.usage1': '粘贴有效的GeoJSON数据到输入框中',
    'geojson.usage2': '支持Feature、FeatureCollection等所有GeoJSON类型',
    'geojson.usage3': '生成的链接可直接在geojson.io中查看和编辑',
    'geojson.usage4': '大文件自动使用GitHub Gist存储，永久可访问',
    'geojson.usage5': '适合地理数据可视化和分享',
    'geojson.storageMethod': '存储方式',
    'geojson.largeFile': '大文件',
    'geojson.smallFile': '小文件',
    'geojson.urlMethod': 'URL方式',
    'geojson.urlMethodDesc': '快速，但有大小限制',
    'geojson.gistMethod': 'GitHub Gist',
    'geojson.gistMethodDesc': '支持大文件，永久存储',
    'geojson.largeSizeWarning': '⚠️ 文件较大，建议使用Gist方式以获得更好的体验',
    'geojson.uploading': '上传中...',
    'geojson.gistError': '创建Gist失败，请稍后重试',
    'geojson.githubToken': 'GitHub Token',
    'geojson.optional': '可选',
    'geojson.tokenPlaceholder': '输入你的GitHub Personal Access Token...',
    'geojson.tokenHelp': '提供Token可避免API限制并管理你的Gist',
    'geojson.howToGet': '如何获取？',
    'geojson.tokenStepsTitle': '获取GitHub Personal Access Token步骤：',
    'geojson.tokenStep1': '访问 GitHub.com 并登录你的账户',
    'geojson.tokenStep2': '进入 Settings > Developer settings > Personal access tokens > Tokens (classic)',
    'geojson.tokenStep3': '点击 "Generate new token" > "Generate new token (classic)"',
    'geojson.tokenStep4': '选择 "gist" 权限（其他权限可不选）',
    'geojson.tokenStep5': '点击生成，复制生成的token并粘贴到上面的输入框',
    'geojson.tokenNote': '注意',
    'geojson.tokenNoteDesc': 'Token仅在本次会话中使用，不会被保存。如需管理Gist，建议保存token到密码管理器中。',
    'geojson.loginWithGitHub': 'GitHub登录',
    'geojson.useToken': '使用Token',
    'geojson.signInWithGitHub': '使用GitHub登录',
    'geojson.loggedInAs': '已登录为',
    'geojson.gistWillBeCreated': 'Gist将创建到你的账户',
    'geojson.logout': '登出',
    'geojson.oauthError': 'GitHub登录失败，请重试',
    'geojson.signingIn': '登录中...',
    'geojson.deviceFlow.instruction': '请在新标签页中访问GitHub并输入以下代码：',
    'geojson.deviceFlow.openGitHub': '打开GitHub授权页面',
    'geojson.deviceFlow.copyCode': '复制代码',
    'geojson.deviceFlow.waiting': '授权完成后，此页面将自动更新',
    'geojson.deviceFlow.pollingInterval': '轮询间隔',
    'geojson.deviceFlow.seconds': '秒',
    'geojson.loginSaved': '登录状态已保存，下次访问无需重新登录',
    'geojson.history': '历史记录',
    'geojson.clearHistory': '清空历史',
    'geojson.noHistory': '暂无历史记录',
    'geojson.viewGist': '查看Gist',
    'geojson.openPreviewNew': '打开预览',
    'geojson.timeAgo': '前',
    'footer.descriptionBefore': '我的博客是 ',
    'footer.descriptionAfter': '，这里记录了我开发过程中常用的一些工具，也许你也会觉得有用。'
  },
  en: {
    'nav.tools': 'All Tools',
    'nav.github': 'Star & Fork', 
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
    'tools.geojson.name': 'GeoJSON Preview',
    'tools.geojson.description': 'Generate geojson.io preview links for GeoJSON data visualization',
    'tools.geojson.category': 'Development Tool',
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
    'geojson.title': 'GeoJSON Preview Tool',
    'geojson.subtitle': 'Generate geojson.io preview links for your GeoJSON data',
    'geojson.backToTools': 'Back to Tools',
    'geojson.inputLabel': 'Input GeoJSON',
    'geojson.outputLabel': 'Preview Link',
    'geojson.placeholder': 'Paste your GeoJSON data here...',
    'geojson.loadExample': 'Load Example',
    'geojson.generate': 'Generate Preview Link',
    'geojson.clear': 'Clear',
    'geojson.copy': 'Copy',
    'geojson.openPreview': 'Open Preview',
    'geojson.resultPlaceholder': 'Generated preview link will appear here...',
    'geojson.validationError': 'Invalid GeoJSON format',
    'geojson.shareCopied': 'Preview link copied!',
    'geojson.usageTitle': 'Usage Instructions',
    'geojson.usage1': 'Paste valid GeoJSON data into the input field',
    'geojson.usage2': 'Supports all GeoJSON types: Feature, FeatureCollection, etc.',
    'geojson.usage3': 'Generated links can be viewed and edited directly on geojson.io',
    'geojson.usage4': 'Large files automatically use GitHub Gist for permanent storage',
    'geojson.usage5': 'Perfect for geographic data visualization and sharing',
    'geojson.storageMethod': 'Storage Method',
    'geojson.largeFile': 'Large File',
    'geojson.smallFile': 'Small File',
    'geojson.urlMethod': 'URL Method',
    'geojson.urlMethodDesc': 'Fast, but size limited',
    'geojson.gistMethod': 'GitHub Gist',
    'geojson.gistMethodDesc': 'Supports large files, permanent storage',
    'geojson.largeSizeWarning': '⚠️ Large file detected, recommend using Gist method for better experience',
    'geojson.uploading': 'Uploading...',
    'geojson.gistError': 'Failed to create Gist, please try again later',
    'geojson.githubToken': 'GitHub Token',
    'geojson.optional': 'Optional',
    'geojson.tokenPlaceholder': 'Enter your GitHub Personal Access Token...',
    'geojson.tokenHelp': 'Providing a token avoids API limits and lets you manage your Gists',
    'geojson.howToGet': 'How to get?',
    'geojson.tokenStepsTitle': 'Steps to get GitHub Personal Access Token:',
    'geojson.tokenStep1': 'Visit GitHub.com and sign in to your account',
    'geojson.tokenStep2': 'Go to Settings > Developer settings > Personal access tokens > Tokens (classic)',
    'geojson.tokenStep3': 'Click "Generate new token" > "Generate new token (classic)"',
    'geojson.tokenStep4': 'Select "gist" scope (other scopes are optional)',
    'geojson.tokenStep5': 'Click generate, copy the generated token and paste it into the input field above',
    'geojson.tokenNote': 'Note',
    'geojson.tokenNoteDesc': 'Token is only used for this session and will not be saved. For managing Gists, consider saving the token in your password manager.',
    'geojson.loginWithGitHub': 'GitHub Login',
    'geojson.useToken': 'Use Token',
    'geojson.signInWithGitHub': 'Sign in with GitHub',
    'geojson.loggedInAs': 'Logged in as',
    'geojson.gistWillBeCreated': 'Gist will be created in your account',
    'geojson.logout': 'Logout',
    'geojson.oauthError': 'GitHub login failed, please try again',
    'geojson.signingIn': 'Signing in...',
    'geojson.deviceFlow.instruction': 'Please visit GitHub in a new tab and enter the following code:',
    'geojson.deviceFlow.openGitHub': 'Open GitHub Authorization Page',
    'geojson.deviceFlow.copyCode': 'Copy Code',
    'geojson.deviceFlow.waiting': 'This page will update automatically after authorization',
    'geojson.deviceFlow.pollingInterval': 'Polling interval',
    'geojson.deviceFlow.seconds': 'seconds',
    'geojson.loginSaved': 'Login state saved, no need to login again on your next visit',
    'geojson.history': 'History',
    'geojson.clearHistory': 'Clear History',
    'geojson.noHistory': 'No history records',
    'geojson.viewGist': 'View Gist',
    'geojson.openPreviewNew': 'Open Preview',
    'geojson.timeAgo': 'ago',
    'footer.descriptionBefore': 'My blog is ',
    'footer.descriptionAfter': '. This page collects tools I frequently use in development—hope you find them helpful too.'
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