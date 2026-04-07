import type { Metadata } from 'next';
import { absoluteUrl, type SiteLanguage, type ToolSlug } from '@/lib/site';

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

export const TOOL_SEO: Record<ToolSlug, Record<SiteLanguage, ToolSeoEntry>> = {
  base64: {
    zh: {
      title: '免费 Base64 编码解码器 - 在线文本转换工具 | Mofei 工具',
      description: '使用我们的免费在线 Base64 编码解码工具快速转换文本。支持批量处理、历史记录、分享功能，完美适合开发者、网页设计师和数据分析师使用。',
      keywords: ['Base64 编码', 'Base64 解码', 'Base64 转换器', '在线 Base64', 'Base64 编码器', 'Base64 解码器', '文本编码', '数据编码', 'Base64 工具', 'URL 编码', '免费 Base64', '在线编码工具', 'Base64 转换', '编码解码器', 'Base64 在线工具'],
      category: '开发工具',
      classification: '文本处理工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费 Base64 编码解码器 - 在线文本转换工具',
        description: '快速转换 Base64 编码，支持批量处理和历史记录。为开发者提供的免费在线工具。',
      },
      twitter: {
        card: 'summary_large_image',
        title: '免费 Base64 编码解码器 - 在线文本转换工具',
        description: '快速转换 Base64 编码，支持批量处理和历史记录。为开发者提供的免费在线工具。',
      },
    },
    en: {
      title: "Free Base64 Encoder Decoder - Online Text Conversion Tool | Mofei's Tools",
      description: 'Convert text to Base64 encoding and decode Base64 strings with our free online tool. Features batch processing, history, and sharing capabilities for developers and designers.',
      keywords: ['Base64 encoder', 'Base64 decoder', 'Base64 converter', 'online Base64', 'text encoding', 'data encoding', 'Base64 tool', 'URL encoding', 'free Base64', 'encoding tool', 'Base64 conversion', 'encode decode', 'Base64 online'],
      category: 'Developer Tools',
      classification: 'Text Processing Tool',
      locale: 'en_US',
    },
  },
  bbox: {
    zh: {
      title: '免费边界框绘制工具 - 交互式地图边界框生成器 | Mofei 工具',
      description: '在交互式地图上绘制和生成边界框（BBox）。支持多种格式输出、坐标系统转换，完美适用于 GIS 开发、地理数据分析和地图应用开发。',
      keywords: ['边界框工具', 'BBox 绘制', '地理边界框', '坐标边界', 'GIS 工具', '地图工具', '边界框生成器', '地理数据工具', 'BBox 生成', '地图边界', '坐标范围', 'GIS 边界框', '地理信息工具', '免费 GIS 工具', '在线地图工具'],
      category: 'GIS 工具',
      classification: '地理信息工具',
      locale: 'zh_CN',
      openGraph: {
        title: '免费边界框绘制工具 - 交互式地图边界框生成器',
        description: '在交互式地图上绘制边界框，支持多种格式输出。为 GIS 开发者提供的免费在线工具。',
      },
      twitter: {
        title: '免费边界框绘制工具 - 交互式地图边界框生成器',
        description: '在交互式地图上绘制边界框，支持多种格式输出。为 GIS 开发者提供的免费在线工具。',
      },
    },
    en: {
      title: "Free BBox Drawing Tool - Interactive Map Bounding Box Generator | Mofei's Tools",
      description: 'Draw and generate bounding boxes on interactive maps. Support multiple output formats and coordinate systems for GIS development and geographic data analysis.',
      keywords: ['bbox tool', 'bounding box', 'GIS tool', 'map tool', 'bbox generator', 'geographic bounds', 'coordinate bounds', 'map bounds', 'GIS bbox', 'geographic tool', 'free GIS', 'online map tool'],
      category: 'GIS Tools',
      classification: 'Geographic Information Tool',
      locale: 'en_US',
    },
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
};

export function getToolSeo(slug: ToolSlug, language: SiteLanguage): ToolSeoEntry {
  return TOOL_SEO[slug][language];
}
