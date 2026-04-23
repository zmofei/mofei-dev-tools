import { Fragment } from 'react';
import { HOME_COPY, getHomeTools } from '@/lib/tool-content';
import { SITE_URL, homeUrl, toolUrl, type SiteLanguage, type ToolSlug } from '@/lib/site';

type StructuredDataProps =
  | {
      type: 'website';
      language: SiteLanguage;
    }
  | {
      type: 'tool';
      language: SiteLanguage;
      slug: ToolSlug;
    };

type ToolStructuredDataConfig = {
  name: string;
  description: string;
  applicationSubCategory: string;
  featureList: string[];
  screenshot: string;
};

function scriptTag(key: string, data: Record<string, unknown>) {
  return (
    <script
      key={key}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function getToolStructuredDataConfig(
  slug: ToolSlug,
  language: SiteLanguage,
): ToolStructuredDataConfig {
  const isZh = language === 'zh';

  switch (slug) {
    case 'base64':
      return {
        name: isZh ? 'Base64 编码解码器' : 'Base64 Encoder Decoder',
        description: isZh
          ? '免费在线 Base64 编码解码工具，支持文本转换、智能图片 Base64 提取预览、批量处理和历史记录。'
          : 'Free online Base64 encoder and decoder with smart image Base64 extraction/preview, text conversion, batch processing, and history tracking.',
        applicationSubCategory: isZh ? '文本处理工具' : 'Text Processing Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '在线处理', '文本编码', '文本解码', '图片 Base64 智能提取', '图片实时预览', '历史记录', '结果分享']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Online processing', 'Text encoding', 'Text decoding', 'Smart Base64 image extraction', 'Real-time image preview', 'History tracking', 'Result sharing'],
        screenshot: `/screenshots/base64-${language}.png`,
      };
    case 'bbox':
      return {
        name: isZh ? 'BBox 绘制工具' : 'BBox Drawing Tool',
        description: isZh
          ? '免费在线边界框绘制工具，可在交互式地图上生成精确地理范围并导出 GeoJSON。'
          : 'Free online tool to draw and generate bounding boxes on interactive maps, create precise geographic boundaries, and export GeoJSON.',
        applicationSubCategory: isZh ? 'GIS 工具' : 'GIS Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '在线处理', '交互式地图绘制', '矩形区域绘制', 'WGS84 坐标生成', 'GeoJSON 导出', '区域面积计算', '结果分享']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Online processing', 'Interactive map drawing', 'Rectangle area drawing', 'WGS84 coordinate generation', 'GeoJSON export', 'Area calculation', 'Result sharing'],
        screenshot: `/screenshots/bbox-${language}.png`,
      };
    case 'coordinate-converter':
      return {
        name: isZh ? 'GIS 坐标转换器' : 'GIS Coordinate Converter',
        description: isZh
          ? '在线 GIS 坐标转换工具，支持 WGS84、GCJ-02、BD-09、UTM 和 Web Mercator。'
          : 'Convert coordinates between geographic coordinate systems including WGS84, GCJ-02, BD-09, UTM, and Web Mercator.',
        applicationSubCategory: isZh ? 'GIS 工具' : 'GIS Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '在线处理', '多坐标系支持', 'WGS84 转换', 'GCJ-02 转换', 'BD-09 转换', 'UTM 投影转换', 'Web Mercator 转换', '批量转换']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Online processing', 'Multiple coordinate systems support', 'WGS84 conversion', 'GCJ-02 conversion', 'BD-09 conversion', 'UTM projection conversion', 'Web Mercator conversion', 'Batch conversion'],
        screenshot: `/screenshots/coordinate-converter-${language}.png`,
      };
    case 'geojson':
      return {
        name: isZh ? 'GeoJSON 预览工具' : 'GeoJSON Preview Tool',
        description: isZh
          ? '免费在线 GeoJSON 预览工具，可快速生成 geojson.io 预览链接并检查地理数据。'
          : 'Free GeoJSON preview tool to generate geojson.io preview links and inspect geographic data quickly.',
        applicationSubCategory: isZh ? 'GeoJSON 工具' : 'GeoJSON Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '在线处理', 'GeoJSON 预览链接生成', 'geojson.io 集成', '地理数据检查', '结果分享']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Online processing', 'GeoJSON preview link generation', 'geojson.io integration', 'Geographic data inspection', 'Result sharing'],
        screenshot: `/screenshots/geojson-${language}.png`,
      };
    case 'json-extract':
      return {
        name: isZh ? 'JSON Path 提取器' : 'JSON Path Extractor',
        description: isZh
          ? '使用 JSONPath 表达式从 JSON 数据中提取特定值，支持多列提取、数组遍历和导出。'
          : 'Extract specific values from JSON data using JSONPath expressions with multi-column extraction, array traversal, and export support.',
        applicationSubCategory: isZh ? 'JSON 工具' : 'JSON Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '在线处理', 'JSONPath 语法支持', '多列提取', '数组遍历', 'CSV 导出', '对比模式', '实时预览']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Online processing', 'JSONPath syntax support', 'Multi-column extraction', 'Array traversal', 'CSV export', 'Comparison mode', 'Real-time preview'],
        screenshot: `/screenshots/json-extract-${language}.png`,
      };
    case 'objectid':
      return {
        name: isZh ? 'MongoDB ObjectID 生成器' : 'MongoDB ObjectID Generator',
        description: isZh
          ? '免费在线 MongoDB ObjectID 生成工具，支持自定义时间戳、时间戳提取和结构分析。'
          : 'Free online tool to generate MongoDB ObjectIDs with custom timestamp support, timestamp extraction, and structure analysis.',
        applicationSubCategory: isZh ? '数据库工具' : 'Database Tool',
        featureList: isZh
          ? ['生成 MongoDB ObjectID', '自定义时间戳支持', 'ObjectID 结构分析', '时间戳提取', '复制和分享功能', '生成历史记录']
          : ['Generate MongoDB ObjectID', 'Custom timestamp support', 'ObjectID structure analysis', 'Timestamp extraction', 'Copy and share functionality', 'Generation history tracking'],
        screenshot: `/screenshots/objectid-${language}.png`,
      };
  }
}

function getWebsiteStructuredData(language: SiteLanguage) {
  const homeCopy = HOME_COPY[language];
  const homeTools = getHomeTools(language);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: language === 'zh' ? 'Mofei开发工具集合' : 'Mofei Dev Tools',
    description:
      language === 'zh'
        ? 'Mofei开发工具集合：Base64编解码、GeoJSON预览、JSONPath 提取等实用开发工具。免费在线使用，支持中英文界面。'
        : 'Collection of useful development tools: Base64 encoder/decoder, GeoJSON preview, JSON Path extraction, and more. Free online tools with a bilingual interface.',
    url: homeUrl(language),
    author: {
      '@type': 'Person',
      name: 'Mofei',
      url: 'https://www.mofei.life',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mofei',
      url: 'https://www.mofei.life',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: homeCopy.title,
      itemListElement: homeTools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebApplication',
          name: tool.name,
          url: toolUrl(tool.slug, language),
        },
      })),
    },
  };
}

function getToolStructuredData(slug: ToolSlug, language: SiteLanguage) {
  const config = getToolStructuredDataConfig(slug, language);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.name,
    description: config.description,
    url: toolUrl(slug, language),
    inLanguage: language === 'zh' ? 'zh-CN' : 'en-US',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: config.applicationSubCategory,
    operatingSystem: 'Web Browser',
    softwareRequirements: 'Web Browser',
    permissions: 'No special permissions required',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: config.featureList,
    downloadUrl: toolUrl(slug, language),
    screenshot: `${SITE_URL}${config.screenshot}`,
  };
}

function getObjectIdEnhancedStructuredData(language: SiteLanguage) {
  const isZh = language === 'zh';
  const localizedUrl = toolUrl('objectid', language);

  return {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: isZh ? 'MongoDB ObjectID 生成器' : 'MongoDB ObjectID Generator',
    description: isZh
      ? '免费在线 MongoDB ObjectID 生成工具，支持自定义时间戳。提取时间戳信息，分析结构，为 MongoDB 开发创建唯一数据库标识符。'
      : 'Free online tool to generate MongoDB ObjectIDs with custom timestamp support. Extract timestamps, analyze structure, and create unique database identifiers for MongoDB development.',
    url: localizedUrl,
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    permissions: 'browser',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Mofei Dev Tools',
      url: SITE_URL,
    },
    mainEntity: {
      '@type': 'SoftwareApplication',
      name: isZh ? 'ObjectID 生成器' : 'ObjectID Generator',
      applicationCategory: isZh ? '数据库工具' : 'Database Tool',
      downloadUrl: localizedUrl,
      featureList: isZh
        ? ['生成 MongoDB ObjectID', '自定义时间戳支持', 'ObjectID 结构分析', '时间戳提取', '复制和分享功能', '生成历史记录']
        : ['Generate MongoDB ObjectID', 'Custom timestamp support', 'ObjectID structure analysis', 'Timestamp extraction', 'Copy and share functionality', 'Generation history tracking'],
      browserRequirements: 'Requires JavaScript enabled',
    },
    potentialAction: {
      '@type': 'UseAction',
      target: localizedUrl,
      name: isZh ? '生成 ObjectID' : 'Generate ObjectID',
    },
    sameAs: [toolUrl('objectid', 'en'), toolUrl('objectid', 'zh')],
  };
}

function getObjectIdBreadcrumbStructuredData(language: SiteLanguage) {
  const isZh = language === 'zh';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isZh ? 'Mofei 开发工具' : 'Mofei Dev Tools',
        item: homeUrl(language),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isZh ? '开发工具' : 'Developer Tools',
        item: `${homeUrl(language)}#dev-tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: isZh ? 'ObjectID 生成器' : 'ObjectID Generator',
        item: toolUrl('objectid', language),
      },
    ],
  };
}

export default function StructuredData(props: StructuredDataProps) {
  if (props.type === 'website') {
    return scriptTag('website-jsonld', getWebsiteStructuredData(props.language));
  }

  if (props.slug === 'objectid') {
    return (
      <Fragment>
        {scriptTag('tool-jsonld', getObjectIdEnhancedStructuredData(props.language))}
        {scriptTag('objectid-breadcrumb-jsonld', getObjectIdBreadcrumbStructuredData(props.language))}
      </Fragment>
    );
  }

  return scriptTag('tool-jsonld', getToolStructuredData(props.slug, props.language));
}
