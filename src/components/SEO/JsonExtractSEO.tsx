"use client"
import Head from 'next/head';
import { useLanguage } from '@/contexts/LanguageContext';

export default function JsonExtractSEO() {
  const { language } = useLanguage();
  
  const seoData = {
    zh: {
      title: 'JSON路径提取工具 - 免费在线JSON数据提取器',
      description: '强大的JSON路径提取工具，支持JSONPath语法提取JSON数据中的特定值。支持多列提取、数组遍历、CSV导出、对比模式等功能。',
      keywords: 'JSON提取,JSONPath,JSON路径,数据提取,JSON工具,路径查询,数据分析,JSON解析,JSON过滤,CSV导出,免费工具,在线工具,网页工具,JSON对比,数据对比,JSON数组,JSON对象,数据处理,API响应,JSON格式化',
      ogTitle: 'JSON路径提取工具 - 免费在线JSON数据提取器',
      ogDescription: '使用JSONPath语法从JSON数据中提取特定值。支持多列提取、数组遍历、CSV导出、对比模式。',
      ogImage: 'https://tools.mofei.life/og-json-extract-zh.png',
      url: 'https://tools.mofei.life/zh/json-extract',
      alternate: 'https://tools.mofei.life/en/json-extract',
      locale: 'zh_CN'
    },
    en: {
      title: 'JSON Path Extractor - Free Online JSON Data Extraction Tool',
      description: 'Powerful JSON path extraction tool with JSONPath syntax support. Extract specific values from JSON data with multi-column support, array traversal, CSV export, and comparison mode.',
      keywords: 'JSON extractor,JSONPath,JSON path,data extraction,JSON tool,path query,data analysis,JSON parser,JSON filter,CSV export,free tool,online tool,web tool,JSON comparison,data comparison,JSON array,JSON object,data processing,API response,JSON formatting',
      ogTitle: 'JSON Path Extractor - Free Online JSON Data Extraction Tool',
      ogDescription: 'Extract specific values from JSON data using JSONPath syntax. Supports multi-column extraction, array traversal, CSV export, and comparison mode.',
      ogImage: 'https://tools.mofei.life/og-json-extract.png',
      url: 'https://tools.mofei.life/en/json-extract',
      alternate: 'https://tools.mofei.life/zh/json-extract',
      locale: 'en_US'
    }
  };

  const currentSeo = seoData[language];

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{currentSeo.title}</title>
      <meta name="title" content={currentSeo.title} />
      <meta name="description" content={currentSeo.description} />
      <meta name="keywords" content={currentSeo.keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={language} />
      <meta name="author" content="Mofei" />
      <meta name="creator" content="Mofei" />
      <meta name="publisher" content="Mofei" />
      <meta name="copyright" content="© 2025 Mofei" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="web" />
      <meta name="rating" content="general" />
      <meta name="classification" content="Developer Tool" />
      <meta name="category" content="Technology" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="developers, data analysts, programmers" />
      <meta name="audience" content="developers" />
      <meta name="subject" content="JSON data extraction and processing" />
      <meta name="application-name" content="JSON Path Extractor" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentSeo.url} />
      <meta property="og:title" content={currentSeo.ogTitle} />
      <meta property="og:description" content={currentSeo.ogDescription} />
      <meta property="og:image" content={currentSeo.ogImage} />
      <meta property="og:image:alt" content={currentSeo.ogTitle} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Mofei Dev Tools" />
      <meta property="og:locale" content={currentSeo.locale} />
      <meta property="article:author" content="Mofei" />
      <meta property="article:publisher" content="https://www.mofei.life" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentSeo.url} />
      <meta property="twitter:title" content={currentSeo.ogTitle} />
      <meta property="twitter:description" content={currentSeo.ogDescription} />
      <meta property="twitter:image" content={currentSeo.ogImage} />
      <meta property="twitter:image:alt" content={currentSeo.ogTitle} />
      <meta property="twitter:creator" content="@mofei" />
      <meta property="twitter:site" content="@mofei" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentSeo.url} />
      
      {/* Alternate Language */}
      <link rel="alternate" hrefLang={language === 'zh' ? 'en' : 'zh'} href={currentSeo.alternate} />
      <link rel="alternate" hrefLang="x-default" href="https://tools.mofei.life/json-extract" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="JSON Path Extractor" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="theme-color" content="#000000" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Preload Critical Resources */}
      <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//tools.mofei.life" />
      <link rel="dns-prefetch" href="//mofei.life" />
      
      {/* Favicons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Additional SEO */}
      <meta name="google-site-verification" content="your-google-site-verification-code" />
      <meta name="msvalidate.01" content="your-bing-site-verification-code" />
      <meta name="yandex-verification" content="your-yandex-verification-code" />
    </Head>
  );
}