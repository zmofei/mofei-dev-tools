import { Fragment } from 'react';
import { HOME_COPY, getHomeTools } from '@/lib/tool-content';
import { SITE_URL, homeUrl, toolUrl, type SiteLanguage, type ToolSlug } from '@/lib/site';
import { BBOX_SEO, bboxText, bboxUrl, normalizeBBoxLanguage, type BBoxLanguage } from '@/lib/bbox-i18n';

type StructuredDataProps =
  | {
      type: 'website';
      language: SiteLanguage;
    }
  | {
      type: 'tool';
      language: SiteLanguage | BBoxLanguage;
      slug: ToolSlug;
    };

type ToolStructuredDataConfig = {
  name: string;
  description: string;
  applicationCategory?: string;
  applicationSubCategory: string;
  featureList: string[];
  screenshot?: string;
};

const BBOX_FEATURE_LIST: Record<BBoxLanguage, string[]> = {
  en: ['Free to use', 'No registration required', 'Interactive map drawing', 'Rectangle area drawing', 'WGS84 coordinate generation', 'GeoJSON export', 'Area calculation', 'Result sharing'],
  zh: ['免费使用', '无需注册', '交互式地图绘制', '矩形区域绘制', 'WGS84 坐标生成', 'GeoJSON 导出', '区域面积计算', '结果分享'],
  de: ['Kostenlos nutzbar', 'Keine Registrierung erforderlich', 'Interaktives Zeichnen auf der Karte', 'Rechteckbereich zeichnen', 'WGS84-Koordinaten erzeugen', 'GeoJSON exportieren', 'Fläche berechnen', 'Ergebnisse teilen'],
  es: ['Uso gratuito', 'Sin registro', 'Dibujo interactivo en mapa', 'Dibujo de áreas rectangulares', 'Generación de coordenadas WGS84', 'Exportación GeoJSON', 'Cálculo de área', 'Compartir resultados'],
  fr: ['Utilisation gratuite', 'Sans inscription', 'Dessin interactif sur carte', 'Dessin de zones rectangulaires', 'Génération de coordonnées WGS84', 'Export GeoJSON', 'Calcul de surface', 'Partage des résultats'],
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
  language: SiteLanguage | BBoxLanguage,
): ToolStructuredDataConfig {
  const isZh = language === 'zh';

  switch (slug) {
    case 'base64':
      return {
        name: isZh ? '免费文本 Base64 转换器' : 'Free Text Base64 Converter',
        description: isZh
          ? '免费在线文本 Base64 转换工具，支持文本编码、解码、历史记录和结果分享。'
          : 'Free online text Base64 converter for encoding, decoding, history tracking, and result sharing.',
        applicationSubCategory: isZh ? '文本处理工具' : 'Text Processing Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '在线处理', '文本编码', '文本解码', '历史记录', '结果分享']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Online processing', 'Text encoding', 'Text decoding', 'History tracking', 'Result sharing'],
        screenshot: `/screenshots/base64-${language}.png`,
      };
    case 'base64-image':
      return {
        name: isZh ? '免费图片转 Base64 转换器' : 'Free Image to Base64 Converter',
        description: isZh
          ? '免费在线图片转 Base64 工具，支持 PNG、JPG、WebP、SVG、GIF、AVIF 转 Data URL 和 Base64 图片预览。'
          : 'Free image to Base64 converter for PNG, JPG, WebP, SVG, GIF, and AVIF Data URLs with instant Base64 image preview.',
        applicationSubCategory: isZh ? '图片编码工具' : 'Image Encoding Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '浏览器本地处理', '图片转 Base64', 'Data URL 生成', '裸 Base64 图片预览', '支持 PNG、JPG、WebP、SVG、GIF 和 AVIF']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Local browser processing', 'Image to Base64', 'Data URL generation', 'Raw Base64 image preview', 'PNG, JPG, WebP, SVG, GIF, and AVIF support'],
      };
    case 'bbox':
      const bboxLanguage = normalizeBBoxLanguage(language);
      const bboxSeo = BBOX_SEO[bboxLanguage];

      return {
        name: bboxText(bboxLanguage, 'toolTitle'),
        description: bboxSeo.description,
        applicationSubCategory: bboxSeo.category,
        featureList: BBOX_FEATURE_LIST[bboxLanguage],
      };
    case 'coordinate-converter':
      return {
        name: isZh ? '免费 GIS 坐标转换器' : 'Free GIS Coordinate Converter',
        description: isZh
          ? '免费在线 GIS 坐标转换工具，支持 WGS84、GCJ-02、BD-09、UTM 和 Web Mercator。'
          : 'Free online coordinate converter for geographic coordinate systems including WGS84, GCJ-02, BD-09, UTM, and Web Mercator.',
        applicationSubCategory: isZh ? 'GIS 工具' : 'GIS Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '在线处理', '多坐标系支持', 'WGS84 转换', 'GCJ-02 转换', 'BD-09 转换', 'UTM 投影转换', 'Web Mercator 转换', '批量转换']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Online processing', 'Multiple coordinate systems support', 'WGS84 conversion', 'GCJ-02 conversion', 'BD-09 conversion', 'UTM projection conversion', 'Web Mercator conversion', 'Batch conversion'],
      };
    case 'geojson':
      return {
        name: isZh ? '免费 GeoJSON 预览工具' : 'Free GeoJSON Preview Tool',
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
        name: isZh ? '免费 JSON Path 提取器' : 'Free JSON Path Extractor',
        description: isZh
          ? '免费在线使用 JSONPath 表达式从 JSON 数据中提取特定值，支持多列提取、数组遍历和导出。'
          : 'Free online JSON Path extractor for specific values from JSON data, with multi-column extraction, array traversal, and export support.',
        applicationSubCategory: isZh ? 'JSON 工具' : 'JSON Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '在线处理', 'JSONPath 语法支持', '多列提取', '数组遍历', 'CSV 导出', '对比模式', '实时预览']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Online processing', 'JSONPath syntax support', 'Multi-column extraction', 'Array traversal', 'CSV export', 'Comparison mode', 'Real-time preview'],
      };
    case 'json-format':
      return {
        name: isZh ? '免费 JSON 格式化与查看工具' : 'Free JSON Formatter & Viewer',
        description: isZh
          ? '免费在线 JSON 格式化工具，支持格式化、压缩、校验和可折叠树形查看。'
          : 'Free online JSON formatter with minify, validation, and collapsible tree inspection.',
        applicationSubCategory: isZh ? 'JSON 工具' : 'JSON Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '支持中英文', '浏览器本地处理', 'JSON 格式化', 'JSON 压缩', 'JSON 校验', '树形查看', '折叠展开', '复制结果']
          : ['Free to use', 'No registration required', 'Bilingual support', 'Local browser processing', 'JSON formatting', 'JSON minifying', 'JSON validation', 'Tree viewer', 'Collapse and expand', 'Copy output'],
      };
    case 'objectid':
      return {
        name: isZh ? '免费 MongoDB ObjectID 生成器' : 'Free MongoDB ObjectID Generator',
        description: isZh
          ? '免费在线 MongoDB ObjectID 生成工具，支持自定义时间戳、时间戳提取和结构分析。'
          : 'Free online tool to generate MongoDB ObjectIDs with custom timestamp support, timestamp extraction, and structure analysis.',
        applicationSubCategory: isZh ? '数据库工具' : 'Database Tool',
        featureList: isZh
          ? ['免费使用', '无需注册', '生成 MongoDB ObjectID', '自定义时间戳支持', 'ObjectID 结构分析', '时间戳提取', '复制和分享功能', '生成历史记录']
          : ['Free to use', 'No registration required', 'Generate MongoDB ObjectID', 'Custom timestamp support', 'ObjectID structure analysis', 'Timestamp extraction', 'Copy and share functionality', 'Generation history tracking'],
      };
    case 'timezone':
      return {
        name: isZh ? '免费世界时间对照工具' : 'World Time Compare & Time Zone Converter',
        description: isZh
          ? '免费在线世界时间对照工具，可对比城市当地时间、日期差异和工作时间重叠，快速换算城市时间并规划跨时区会议。'
          : 'Compare world time across cities, check working-hour overlap, and convert meeting times between time zones with a DST-aware city timezone converter.',
        applicationCategory: 'UtilitiesApplication',
        applicationSubCategory: isZh ? '时区与会议规划工具' : 'Time Zone and Meeting Planner',
        featureList: isZh
          ? ['免费使用', '无需注册', '世界时间对照', '时区对照', '城市时间换算', '跨时区会议规划', '工作时间重叠', '分享链接', '自动处理夏令时']
          : ['World time compare', 'Time zone comparison', 'City timezone converter', 'Working-hour overlap', 'Meeting time converter', 'Date difference display', 'Shareable links', 'Daylight saving time aware'],
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
        ? 'Mofei开发工具集合：文本 Base64 转换、JSON 格式化、JSONPath 提取、GeoJSON预览等实用开发工具。免费在线使用，支持中英文界面。'
        : 'Collection of useful development tools: text Base64 conversion, JSON formatting, JSON Path extraction, GeoJSON preview, and more. Free online tools with a bilingual interface.',
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
    mainEntity: {
      '@type': 'ItemList',
      name: homeCopy.title,
      itemListElement: homeTools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebApplication',
          name: tool.name,
          description: tool.description,
          url: toolUrl(tool.slug, language),
        },
      })),
    },
  };
}

function getToolStructuredData(slug: ToolSlug, language: SiteLanguage | BBoxLanguage) {
  const config = getToolStructuredDataConfig(slug, language);
  const isBBox = slug === 'bbox';
  const bboxLanguage = isBBox ? normalizeBBoxLanguage(language) : 'en';
  const localizedUrl = isBBox ? bboxUrl(bboxLanguage) : toolUrl(slug, language === 'zh' ? 'zh' : 'en');
  const inLanguage = isBBox
    ? ({ en: 'en-US', zh: 'zh-CN', de: 'de-DE', es: 'es-ES', fr: 'fr-FR' } as const)[bboxLanguage]
    : language === 'zh'
      ? 'zh-CN'
      : 'en-US';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.name,
    description: config.description,
    url: localizedUrl,
    inLanguage,
    applicationCategory: config.applicationCategory ?? 'DeveloperApplication',
    applicationSubCategory: config.applicationSubCategory,
    operatingSystem: 'Web Browser',
    softwareRequirements: 'Web Browser',
    permissions: 'No special permissions required',
    isAccessibleForFree: true,
    creator: {
      '@type': 'Person',
      name: 'Mofei',
      url: 'https://www.mofei.life',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mofei',
      url: 'https://www.mofei.life',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: config.featureList,
    potentialAction: {
      '@type': 'ViewAction',
      target: localizedUrl,
    },
    ...(config.screenshot ? { screenshot: `${SITE_URL}${config.screenshot}` } : {}),
  };
}

function getObjectIdEnhancedStructuredData(language: SiteLanguage) {
  const isZh = language === 'zh';
  const localizedUrl = toolUrl('objectid', language);

  return {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    name: isZh ? '免费 MongoDB ObjectID 生成器' : 'Free MongoDB ObjectID Generator',
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
      name: isZh ? '免费 ObjectID 生成器' : 'Free ObjectID Generator',
      applicationCategory: isZh ? '数据库工具' : 'Database Tool',
      downloadUrl: localizedUrl,
      featureList: isZh
        ? ['免费使用', '无需注册', '生成 MongoDB ObjectID', '自定义时间戳支持', 'ObjectID 结构分析', '时间戳提取', '复制和分享功能', '生成历史记录']
        : ['Free to use', 'No registration required', 'Generate MongoDB ObjectID', 'Custom timestamp support', 'ObjectID structure analysis', 'Timestamp extraction', 'Copy and share functionality', 'Generation history tracking'],
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

function getTimezoneEnhancedStructuredData(language: SiteLanguage) {
  const config = getToolStructuredDataConfig('timezone', language);
  const localizedUrl = toolUrl('timezone', language);
  const isZh = language === 'zh';

  return {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    '@id': `${localizedUrl}#app`,
    name: config.name,
    description: config.description,
    url: localizedUrl,
    mainEntityOfPage: localizedUrl,
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    applicationCategory: 'UtilitiesApplication',
    applicationSubCategory: config.applicationSubCategory,
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript enabled',
    softwareRequirements: 'Web Browser',
    permissions: 'No special permissions required',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: 'Mofei',
      url: 'https://www.mofei.life',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mofei',
      url: 'https://www.mofei.life',
    },
    featureList: config.featureList,
    potentialAction: {
      '@type': 'UseAction',
      name: isZh ? '对比时区' : 'Compare time zones',
      target: localizedUrl,
    },
    sameAs: [toolUrl('timezone', 'en'), toolUrl('timezone', 'zh')],
  };
}

function getTimezoneFaqStructuredData(language: SiteLanguage) {
  const isZh = language === 'zh';
  const localizedUrl = toolUrl('timezone', language);
  const questions = isZh
    ? [
        { name: '怎么比较不同时区的时间？', answer: '添加要比较的城市或 IANA 时区，时间轴会把每个地点对应的当地小时并排显示，并标出跨日期的 +1 或 -1。' },
        { name: '怎么找跨时区会议时间？', answer: '把参会人的城市都添加进来，然后查看哪些时间行同时落在大家的工作时间色块内，优先选择重叠最多的时间。' },
        { name: '怎么知道同事现在是不是工作时间？', answer: '添加同事所在城市，看当前时间指示线是否落在该城市的工作时间范围内。如果对方团队作息不同，可以手动调整工作时间。' },
        { name: '怎么把某个城市时间换算成本地时间？', answer: '把本地城市放在第一列，再添加目标城市。查看目标城市某个小时所在的同一行，就能看到对应的本地时间。' },
        {
          name: '这个时区换算会处理夏令时吗？',
          answer: '会。工具使用浏览器的 IANA 时区数据进行换算，会根据所选日期和时区自动应用对应的夏令时偏移。',
        },
        { name: '可以把跨时区对照结果发给别人吗？', answer: '可以。点击“分享配置”会复制包含城市和时间状态的链接，对方打开后能看到同一组时区对照。' },
      ]
    : [
        { name: 'How do I compare time across different time zones?', answer: 'Add the cities or IANA time zones you want to compare. The timeline shows each location’s matching local hour side by side, including date changes like +1 or -1 day.' },
        { name: 'How can I find a good meeting time across time zones?', answer: 'Add every participant’s city, then scan for hours where the work-hour bands overlap. Pick a row where all or most locations are inside normal working hours.' },
        { name: 'How do I know if a coworker is currently in working hours?', answer: 'Add your coworker’s city and check the current-time marker against the work-hour band. You can adjust the work range if their team uses different hours.' },
        { name: 'How do I convert a city’s time to my local time?', answer: 'Add your city as the first reference column and add the target city. Select or read the target city’s hour in the timeline to see the matching local hour in your column.' },
        {
          name: 'Does the time zone tool handle daylight saving time?',
          answer: 'Yes. The converter uses browser IANA time zone data, so offsets are applied for the selected date and location, including daylight saving time changes.',
        },
        { name: 'Can I share a timezone comparison with others?', answer: 'Yes. Use Share setup to copy a link with the selected cities and time so others can open the same comparison.' },
      ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: localizedUrl,
    inLanguage: isZh ? 'zh-CN' : 'en-US',
    mainEntity: questions.map((question) => ({
      '@type': 'Question',
      name: question.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: question.answer,
      },
    })),
  };
}

function getToolBreadcrumbStructuredData(slug: ToolSlug, language: SiteLanguage) {
  const isZh = language === 'zh';
  const config = getToolStructuredDataConfig(slug, language);
  const categoryName = slug === 'timezone'
    ? isZh ? '效率工具' : 'Productivity Tools'
    : isZh ? '开发工具' : 'Developer Tools';
  const categoryAnchor = slug === 'timezone' ? 'productivity-tools' : 'dev-tools';

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
        name: categoryName,
        item: `${homeUrl(language)}#${categoryAnchor}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: config.name,
        item: toolUrl(slug, language),
      },
    ],
  };
}

export default function StructuredData(props: StructuredDataProps) {
  if (props.type === 'website') {
    return scriptTag('website-jsonld', getWebsiteStructuredData(props.language));
  }

  if (props.slug === 'objectid') {
    const language = props.language === 'zh' ? 'zh' : 'en';

    return (
      <Fragment>
        {scriptTag('tool-jsonld', getObjectIdEnhancedStructuredData(language))}
        {scriptTag('objectid-breadcrumb-jsonld', getToolBreadcrumbStructuredData('objectid', language))}
      </Fragment>
    );
  }

  if (props.slug === 'timezone') {
    const language = props.language === 'zh' ? 'zh' : 'en';

    return (
      <Fragment>
        {scriptTag('tool-jsonld', getTimezoneEnhancedStructuredData(language))}
        {scriptTag('timezone-faq-jsonld', getTimezoneFaqStructuredData(language))}
        {scriptTag('timezone-breadcrumb-jsonld', getToolBreadcrumbStructuredData('timezone', language))}
      </Fragment>
    );
  }

  return scriptTag('tool-jsonld', getToolStructuredData(props.slug, props.language));
}
