import type { Metadata } from 'next';
import { absoluteUrl, type SiteLanguage, type ToolSlug } from '@/lib/site';
import { BBOX_SEO } from '@/lib/bbox-i18n';

type SeoLocale = 'en_US' | 'zh_CN';

type ToolSeoEntry = {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  classification: string;
  locale: SeoLocale;
  openGraph?: {
    title: string;
    description: string;
    images?: NonNullable<Metadata['openGraph']>['images'];
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'player' | 'app';
    title: string;
    description: string;
    images?: NonNullable<Metadata['twitter']>['images'];
  };
  robots?: Metadata['robots'];
  other?: Metadata['other'];
};

function bboxToolSeo(language: SiteLanguage): ToolSeoEntry {
  const seo = BBOX_SEO[language];

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    category: seo.category,
    classification: seo.classification,
    locale: seo.locale as SeoLocale,
    openGraph: {
      title: seo.openGraphTitle,
      description: seo.openGraphDescription,
    },
    twitter: {
      title: seo.openGraphTitle,
      description: seo.openGraphDescription,
    },
  };
}

export const TOOL_SEO: Record<ToolSlug, Record<SiteLanguage, ToolSeoEntry>> = {
  base64: {
    zh: {
      title: '免费文本 Base64 转换器 - 在线编码解码工具 | Mofei 工具',
      description: '使用免费的在线文本 Base64 转换器，在普通文本和 Base64 字符串之间快速转换。此工具专注文本编码解码，适合开发、调试和数据处理场景。',
      keywords: ['文本 Base64 转换', 'Base64 文本编码', 'Base64 文本解码', 'Base64 转换器', '在线 Base64', 'Base64 编码器', 'Base64 解码器', '文本编码', '数据编码', 'Base64 工具', '免费 Base64', '在线编码工具', 'Base64 转换', '编码解码器', 'Base64 在线工具'],
      category: '开发工具',
      classification: '文本处理工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费文本 Base64 转换器 - 在线编码解码工具',
        description: '在普通文本和 Base64 字符串之间快速转换，支持历史记录和结果分享。',
      },
      twitter: {
        card: 'summary_large_image',
        title: '免费文本 Base64 转换器 - 在线编码解码工具',
        description: '在普通文本和 Base64 字符串之间快速转换，支持历史记录和结果分享。',
      },
    },
    en: {
      title: "Free Text Base64 Converter - Online Encode Decode Tool | Mofei's Tools",
      description: 'Convert plain text to Base64 and decode Base64 strings back to readable text with a free online tool. This text-focused converter includes history and sharing for development and debugging.',
      keywords: ['text Base64 converter', 'Base64 text encoder', 'Base64 text decoder', 'Base64 converter', 'online Base64', 'text encoding', 'data encoding', 'Base64 tool', 'free Base64', 'encoding tool', 'Base64 conversion', 'encode decode', 'Base64 online'],
      category: 'Developer Tools',
      classification: 'Text Processing Tool',
      locale: 'en_US',
    },
  },
  'base64-image': {
    zh: {
      title: '免费图片转 Base64 转换器 - Data URL 生成与在线预览 | Mofei 工具',
      description: '使用免费的在线图片转 Base64 工具，将 PNG、JPG、WebP、SVG、GIF、AVIF 图片转换为 Base64 Data URL，也可以粘贴 Base64 图片字符串在线预览。适合 HTML、CSS、JSON 嵌入和快速调试，所有处理都在浏览器本地完成。',
      keywords: ['图片转 Base64', 'Base64 图片转换器', 'Base64 图片预览', '图片转 Data URL', 'Data URL 生成器', '图片 Base64 编码', 'data:image Base64', '裸 Base64 图片', 'PNG 转 Base64', 'JPG 转 Base64', 'JPEG 转 Base64', 'WebP 转 Base64', 'SVG 转 Base64', 'GIF 转 Base64', 'AVIF 转 Base64', '在线图片编码', '免费 Base64 图片工具'],
      category: '开发工具',
      classification: '图片编码工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费图片转 Base64 转换器 - Data URL 生成与在线预览',
        description: '免费将 PNG、JPG、WebP、SVG、GIF、AVIF 图片转换为 Base64 Data URL，或粘贴 Base64 图片字符串直接预览。',
      },
      twitter: {
        card: 'summary',
        title: '免费图片转 Base64 转换器 - Data URL 生成与在线预览',
        description: '免费将 PNG、JPG、WebP、SVG、GIF、AVIF 图片转换为 Base64 Data URL，或粘贴 Base64 图片字符串直接预览。',
      },
    },
    en: {
      title: "Free Image to Base64 Converter - Data URL Preview Tool | Mofei's Tools",
      description: 'Use a free online image to Base64 converter for PNG, JPG, WebP, SVG, GIF, and AVIF images. Generate Base64 Data URLs, or paste Base64 image data to preview it instantly. Works locally in your browser for HTML, CSS, JSON, and quick debugging.',
      keywords: ['image to Base64', 'Base64 image converter', 'image to Data URL', 'Data URL generator', 'Base64 image preview', 'data:image base64', 'raw Base64 image', 'PNG to Base64', 'JPG to Base64', 'JPEG to Base64', 'WebP to Base64', 'SVG to Base64', 'GIF to Base64', 'AVIF to Base64', 'online image encoder', 'free Base64 image tool'],
      category: 'Developer Tools',
      classification: 'Image Encoding Tool',
      locale: 'en_US',
      openGraph: {
        title: 'Free Image to Base64 Converter - Data URL Preview Tool',
        description: 'Convert PNG, JPG, WebP, SVG, GIF, and AVIF images to Base64 Data URLs for free, or paste Base64 image data and preview it instantly.',
      },
      twitter: {
        card: 'summary',
        title: 'Free Image to Base64 Converter - Data URL Preview Tool',
        description: 'Convert PNG, JPG, WebP, SVG, GIF, and AVIF images to Base64 Data URLs for free, or paste Base64 image data and preview it instantly.',
      },
    },
  },
  bbox: {
    zh: bboxToolSeo('zh'),
    en: bboxToolSeo('en'),
  },
  'coordinate-converter': {
    zh: {
      title: '免费坐标转换器 - GIS 坐标系统转换工具 | Mofei 工具',
      description: '在不同地理坐标系统之间转换坐标。支持 WGS84、Web Mercator、UTM 等多种坐标系统，完美适用于 GIS 开发、测量和地图应用。',
      keywords: ['坐标转换', 'GIS 坐标转换', '地理坐标转换', 'WGS84 转换', 'Web Mercator', 'UTM 坐标', '坐标系统转换', '地理坐标系', '投影坐标系', 'GPS 坐标转换', '经纬度转换', 'GIS 工具', '测量工具', '免费坐标转换', '在线坐标工具'],
      category: 'GIS 工具',
      classification: '坐标转换工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费坐标转换器 - GIS 坐标系统转换工具',
        description: '在不同地理坐标系统间转换坐标，支持多种坐标系统。为 GIS 开发者和测量人员提供的免费工具。',
      },
      twitter: {
        title: '免费坐标转换器 - GIS 坐标系统转换工具',
        description: '在不同地理坐标系统间转换坐标，支持多种坐标系统。为 GIS 开发者和测量人员提供的免费工具。',
      },
    },
    en: {
      title: "Free Coordinate Converter - GIS Coordinate System Transformation | Mofei's Tools",
      description: 'Convert coordinates between different geographic coordinate systems. Support WGS84, Web Mercator, UTM and more for GIS development and surveying.',
      keywords: ['coordinate converter', 'GIS coordinate conversion', 'geographic coordinate transformation', 'WGS84 converter', 'Web Mercator', 'UTM coordinates', 'coordinate system', 'geographic projection', 'GPS coordinate conversion', 'latitude longitude converter', 'GIS tool', 'surveying tool', 'free coordinate converter'],
      category: 'GIS Tools',
      classification: 'Coordinate Conversion Tool',
      locale: 'en_US',
      openGraph: {
        title: 'Free Coordinate Converter - GIS Coordinate System Transformation',
        description: 'Convert WGS84, Web Mercator, UTM, GCJ-02, and BD-09 coordinates online for GIS, mapping, and surveying workflows.',
      },
      twitter: {
        title: 'Free Coordinate Converter - GIS Coordinate System Transformation',
        description: 'Convert WGS84, Web Mercator, UTM, GCJ-02, and BD-09 coordinates online for GIS, mapping, and surveying workflows.',
      },
    },
  },
  geojson: {
    zh: {
      title: '免费 GeoJSON 预览工具 - 生成 geojson.io 预览链接 | Mofei 工具',
      description: '为 GeoJSON 数据生成 geojson.io 预览链接。快速可视化地理数据、验证 GeoJSON 格式，完美适用于 GIS 开发、地理数据分析和地图应用开发。',
      keywords: ['GeoJSON 预览', 'GeoJSON 工具', 'geojson.io', 'GeoJSON 可视化', '地理数据预览', 'GeoJSON 验证', 'GIS 工具', '地理数据工具', 'GeoJSON 编辑器', '地图数据预览', 'GeoJSON 链接生成', '免费 GIS 工具', '在线 GeoJSON', '地理信息工具', 'GeoJSON 查看器'],
      category: 'GIS 工具',
      classification: 'GeoJSON 处理工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费 GeoJSON 预览工具 - 生成 geojson.io 预览链接',
        description: '为 GeoJSON 数据生成预览链接，快速可视化地理数据。为 GIS 开发者提供的免费工具。',
      },
      twitter: {
        title: '免费 GeoJSON 预览工具 - 生成 geojson.io 预览链接',
        description: '为 GeoJSON 数据生成预览链接，快速可视化地理数据。为 GIS 开发者提供的免费工具。',
      },
    },
    en: {
      title: "Free GeoJSON Preview Tool - Generate geojson.io Preview Links | Mofei's Tools",
      description: 'Generate geojson.io preview links for GeoJSON data. Quickly visualize geographic data and validate GeoJSON format for GIS development.',
      keywords: ['GeoJSON preview', 'GeoJSON tool', 'geojson.io', 'GeoJSON visualization', 'geographic data preview', 'GeoJSON validator', 'GIS tool', 'geographic data tool', 'GeoJSON editor', 'map data preview', 'GeoJSON link generator', 'free GIS tool', 'online GeoJSON'],
      category: 'GIS Tools',
      classification: 'GeoJSON Processing Tool',
      locale: 'en_US',
    },
  },
  'json-extract': {
    zh: {
      title: '免费 JSON 路径提取器 - JSONPath 数据提取工具 | Mofei 工具',
      description: '使用 JSONPath 语法从 JSON 数据中提取特定值。支持批量提取、历史记录、实时预览，完美适用于 API 开发、数据分析和测试工作。',
      keywords: ['JSON 路径提取', 'JSONPath 工具', 'JSON 数据提取', 'JSON 解析器', 'JSONPath 查询', 'JSON 筛选', 'API 数据提取', 'JSON 工具', '数据提取工具', 'JSONPath 语法', 'JSON 查询工具', '免费 JSON 工具', '在线 JSON 提取', 'JSON 数据处理', 'JSON Path 提取器'],
      category: '开发工具',
      classification: 'JSON 处理工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费 JSON 路径提取器 - JSONPath 数据提取工具',
        description: '使用 JSONPath 语法提取 JSON 数据，支持批量处理和实时预览。为开发者提供的免费工具。',
      },
      twitter: {
        title: '免费 JSON 路径提取器 - JSONPath 数据提取工具',
        description: '使用 JSONPath 语法提取 JSON 数据，支持批量处理和实时预览。为开发者提供的免费工具。',
      },
    },
    en: {
      title: "Free JSON Path Extractor - JSONPath Data Extraction Tool | Mofei's Tools",
      description: 'Extract specific values from JSON data using JSONPath syntax. Features batch extraction, history, and real-time preview for API development and data analysis.',
      keywords: ['JSON path extractor', 'JSONPath tool', 'JSON data extraction', 'JSON parser', 'JSONPath query', 'JSON filter', 'API data extraction', 'JSON tool', 'data extraction tool', 'JSONPath syntax', 'JSON query tool', 'free JSON tool', 'online JSON extractor'],
      category: 'Developer Tools',
      classification: 'JSON Processing Tool',
      locale: 'en_US',
      openGraph: {
        title: 'Free JSON Path Extractor - JSONPath Data Extraction Tool',
        description: 'Extract fields from JSON with JSONPath, preview results instantly, compare data, and export clean CSV or JSON.',
      },
      twitter: {
        title: 'Free JSON Path Extractor - JSONPath Data Extraction Tool',
        description: 'Extract fields from JSON with JSONPath, preview results instantly, compare data, and export clean CSV or JSON.',
      },
    },
  },
  'json-format': {
    zh: {
      title: '免费 JSON 格式化工具 - 在线 JSON 查看器与校验器 | Mofei 工具',
      description: '使用免费的在线 JSON 格式化工具格式化、压缩、校验和查看 JSON 数据。支持可折叠树形视图、复制结果和本地浏览器处理，适合 API 调试、配置检查和数据分析。',
      keywords: ['JSON 格式化', 'JSON 查看器', 'JSON 校验器', 'JSON 压缩', 'JSON 美化', '在线 JSON 工具', 'JSON 树形查看', 'JSON 格式检查', 'API 调试', 'JSON 格式化工具', '免费 JSON 工具', 'JSON 在线格式化'],
      category: '开发工具',
      classification: 'JSON 处理工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费 JSON 格式化工具 - 在线 JSON 查看器与校验器',
        description: '格式化、压缩、校验 JSON，并使用可折叠树形视图快速查看数据结构。',
      },
      twitter: {
        title: '免费 JSON 格式化工具 - 在线 JSON 查看器与校验器',
        description: '格式化、压缩、校验 JSON，并使用可折叠树形视图快速查看数据结构。',
      },
    },
    en: {
      title: "Free JSON Formatter & Viewer - Online JSON Validator | Mofei's Tools",
      description: 'Format, minify, validate, and inspect JSON with a free online JSON formatter. Includes a collapsible JSON tree viewer, copy-ready output, and local browser processing for API debugging, config review, and data inspection.',
      keywords: ['JSON formatter', 'JSON viewer', 'JSON validator', 'JSON minifier', 'JSON beautifier', 'online JSON tool', 'collapsible JSON tree', 'JSON format checker', 'API debugging', 'free JSON formatter', 'online JSON formatter'],
      category: 'Developer Tools',
      classification: 'JSON Processing Tool',
      locale: 'en_US',
      openGraph: {
        title: 'Free JSON Formatter & Viewer - Online JSON Validator',
        description: 'Format, minify, validate, and inspect JSON with a collapsible tree viewer.',
      },
      twitter: {
        title: 'Free JSON Formatter & Viewer - Online JSON Validator',
        description: 'Format, minify, validate, and inspect JSON with a collapsible tree viewer.',
      },
    },
  },
  objectid: {
    zh: {
      title: '免费 MongoDB ObjectID 生成器 - 在线创建唯一数据库标识符 | Mofei 工具',
      description: '使用我们的免费在线工具即时生成 MongoDB ObjectID。创建唯一的 24 字符十六进制标识符，提取时间戳，分析结构，并使用自定义时间戳。适合 MongoDB 开发者、数据库管理员和后端工程师。',
      keywords: ['MongoDB ObjectID 生成器', 'ObjectID 创建器', 'MongoDB 唯一标识符', 'BSON ObjectID', '数据库 ID 生成器', 'MongoDB 主键', 'ObjectID 时间戳提取器', 'MongoDB 文档 ID', 'NoSQL 数据库工具', 'MongoDB 开发工具', 'ObjectID 解码器', 'MongoDB 实用工具', '数据库标识符工具', 'MongoDB ObjectID 分析器', '免费 MongoDB 工具'],
      category: '开发工具',
      classification: '数据库开发工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费 MongoDB ObjectID 生成器 - 创建唯一数据库标识符',
        description: '即时生成 MongoDB ObjectID，支持时间戳提取和结构分析。为开发者提供的免费在线工具。',
        images: [
          {
            url: absoluteUrl('/api/og?title=MongoDB%20ObjectID%20%E7%94%9F%E6%88%90%E5%99%A8&description=%E7%94%9F%E6%88%90%E5%94%AF%E4%B8%80%E7%9A%84%20MongoDB%20%E6%A0%87%E8%AF%86%E7%AC%A6'),
            width: 1200,
            height: 630,
            alt: 'MongoDB ObjectID 生成器工具',
          },
        ],
      },
      twitter: {
        title: '免费 MongoDB ObjectID 生成器 - 创建唯一数据库标识符',
        description: '即时生成 MongoDB ObjectID，支持时间戳提取和结构分析。为开发者提供的免费在线工具。',
        images: [absoluteUrl('/api/og?title=MongoDB%20ObjectID%20%E7%94%9F%E6%88%90%E5%99%A8&description=%E7%94%9F%E6%88%90%E5%94%AF%E4%B8%80%E7%9A%84%20MongoDB%20%E6%A0%87%E8%AF%86%E7%AC%A6')],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'format-detection': 'telephone=no',
      },
    },
    en: {
      title: "Free MongoDB ObjectID Generator - Create Unique Database IDs Online | Mofei's Tools",
      description: 'Generate MongoDB ObjectIDs instantly with our free online tool. Create unique 24-character hex identifiers, extract timestamps, analyze structure, and use custom timestamps. Perfect for MongoDB developers, database administrators, and backend engineers.',
      keywords: ['MongoDB ObjectID generator', 'ObjectID creator', 'MongoDB unique identifier', 'BSON ObjectID', 'database ID generator', 'MongoDB primary key', 'ObjectID timestamp extractor', 'MongoDB document ID', 'NoSQL database tools', 'MongoDB development tools', 'ObjectID decoder', 'MongoDB utilities', 'database identifier tools', 'MongoDB ObjectID analyzer', 'free MongoDB tools'],
      category: 'Developer Tools',
      classification: 'Database Development Tool',
      locale: 'en_US',
      openGraph: {
        title: 'Free MongoDB ObjectID Generator - Create Unique Database IDs',
        description: 'Generate MongoDB ObjectIDs instantly with timestamp extraction and structure analysis. Free online tool for developers.',
        images: [
          {
            url: absoluteUrl('/api/og?title=MongoDB%20ObjectID%20Generator&description=Generate%20unique%20MongoDB%20identifiers'),
            width: 1200,
            height: 630,
            alt: 'MongoDB ObjectID Generator Tool',
          },
        ],
      },
      twitter: {
        title: 'Free MongoDB ObjectID Generator - Create Unique Database IDs',
        description: 'Generate MongoDB ObjectIDs instantly with timestamp extraction and structure analysis. Free online tool for developers.',
        images: [absoluteUrl('/api/og?title=MongoDB%20ObjectID%20Generator&description=Generate%20unique%20MongoDB%20identifiers')],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'format-detection': 'telephone=no',
      },
    },
  },
  time: {
    zh: {
      title: '免费世界时间对照 - 时区对照、城市时间换算与跨时区会议规划 | Mofei 工具',
      description: '免费在线世界时间对照工具。添加城市或 IANA 时区，查看当地时间、日期差异和工作时间重叠，自动处理夏令时，并分享跨时区会议配置。',
      keywords: ['世界时间对照', '时区对照', '城市时间换算', '跨时区会议', '工作时间重叠', '世界时钟', '时区转换器', '城市时间对比', '会议时间规划', '会议时间换算', '当地时间换算', 'IANA 时区', '夏令时换算', '全球时间换算', '在线世界时钟'],
      category: '效率工具',
      classification: '时区与会议规划工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费世界时间对照 - 时区对照、城市时间换算与跨时区会议规划',
        description: '添加城市或时区，查看当地时间、日期差异和工作时间重叠，快速规划跨时区会议。',
      },
      twitter: {
        title: '免费世界时间对照 - 时区对照、城市时间换算与跨时区会议规划',
        description: '添加城市或时区，查看当地时间、日期差异和工作时间重叠，快速规划跨时区会议。',
      },
    },
    en: {
      title: 'World Time Compare & Time Zone Converter | Mofei Tools',
      description: 'Compare local time across cities and IANA time zones, find working-hour overlap, handle date differences and DST, and share cross-time-zone meeting setups.',
      keywords: ['world time compare', 'time zone comparison', 'time zone converter', 'city timezone converter', 'working hours overlap', 'meeting time converter', 'compare time zones', 'city time converter', 'world clock meeting planner', 'cross timezone meeting planner', 'business hours overlap', 'daylight saving time converter', 'IANA timezone converter', 'local time converter', 'free world time tool'],
      category: 'Productivity Tools',
      classification: 'Time Zone and Meeting Planner',
      locale: 'en_US',
      openGraph: {
        title: 'World Time Compare & Time Zone Converter',
        description: 'Compare city times, find working-hour overlap, and convert meeting times between time zones.',
      },
      twitter: {
        title: 'World Time Compare & Time Zone Converter',
        description: 'Compare city times, find working-hour overlap, and convert meeting times between time zones.',
      },
    },
  },
};

export function getToolSeo(slug: ToolSlug, language: SiteLanguage): ToolSeoEntry {
  return TOOL_SEO[slug][language];
}
