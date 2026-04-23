import { TOOL_SLUGS, toolPath, type SiteLanguage, type ToolSlug } from '@/lib/site';

type ToolCategory = 'dev' | 'gis';

type ToolCopy = {
  name: string;
  description: string;
  categoryLabel: string;
};

type ToolEntry = {
  icon: string;
  category: ToolCategory;
  copy: Record<SiteLanguage, ToolCopy>;
};

export const HOME_COPY = {
  en: {
    title: 'Tools Collection',
    subtitle: 'These are the handy tools Mofei frequently uses during development. Sharing them with you, hoping to make your work a bit easier.',
    moreTools: 'More Tools Coming Soon',
    moreToolsDesc: 'More useful tools are in development, including JSON formatting, color helpers, regex testing, and more.',
    categories: {
      dev: 'Development Tools',
      gis: 'GIS & Mapping Tools',
    },
  },
  zh: {
    title: '工具合集',
    subtitle: '这些是 Mofei 在开发过程中经常使用的便捷工具。分享给大家，希望能让你的工作更轻松一些。',
    moreTools: '更多工具即将推出',
    moreToolsDesc: '更多实用工具正在开发中，包括 JSON 格式化、颜色工具、正则测试等。',
    categories: {
      dev: '开发工具',
      gis: 'GIS 地理工具',
    },
  },
} as const;

export const TOOL_CONTENT: Record<ToolSlug, ToolEntry> = {
  base64: {
    icon: '🔤',
    category: 'dev',
    copy: {
      en: {
        name: 'Base64',
        description: 'Base64 encode/decode tool with smart image Base64 extraction and preview',
        categoryLabel: 'Development Tools',
      },
      zh: {
        name: 'Base64',
        description: 'Base64 编码解码工具，支持智能图片 Base64 提取与预览',
        categoryLabel: '开发工具',
      },
    },
  },
  'json-extract': {
    icon: '📊',
    category: 'dev',
    copy: {
      en: {
        name: 'JSON Path Extractor',
        description: 'Extract specific values from JSON data using JSONPath syntax',
        categoryLabel: 'Development Tools',
      },
      zh: {
        name: 'JSON 路径提取',
        description: '使用 JSONPath 语法从 JSON 数据中提取特定值',
        categoryLabel: '开发工具',
      },
    },
  },
  objectid: {
    icon: '🆔',
    category: 'dev',
    copy: {
      en: {
        name: 'ObjectID Generator',
        description: 'Generate MongoDB ObjectID with optional custom timestamp',
        categoryLabel: 'Development Tools',
      },
      zh: {
        name: 'ObjectID 生成器',
        description: '生成 MongoDB ObjectID，支持自定义时间戳',
        categoryLabel: '开发工具',
      },
    },
  },
  'coordinate-converter': {
    icon: '🌍',
    category: 'gis',
    copy: {
      en: {
        name: 'GIS Coordinate Converter',
        description: 'Convert coordinates between different geographic coordinate systems',
        categoryLabel: 'GIS & Mapping Tools',
      },
      zh: {
        name: 'GIS 坐标转换',
        description: '支持多种地理坐标系统之间的相互转换',
        categoryLabel: 'GIS 地理工具',
      },
    },
  },
  bbox: {
    icon: '📦',
    category: 'gis',
    copy: {
      en: {
        name: 'BBox Drawing Tool',
        description: 'Draw and generate bounding boxes on interactive maps',
        categoryLabel: 'GIS & Mapping Tools',
      },
      zh: {
        name: 'BBox 绘制工具',
        description: '在交互式地图上绘制矩形区域生成边界框坐标',
        categoryLabel: 'GIS 地理工具',
      },
    },
  },
  geojson: {
    icon: '🗺️',
    category: 'gis',
    copy: {
      en: {
        name: 'GeoJSON Preview',
        description: 'Generate geojson.io preview links for GeoJSON data',
        categoryLabel: 'GIS & Mapping Tools',
      },
      zh: {
        name: 'GeoJSON 预览',
        description: 'GeoJSON 文件预览链接生成器，快速生成 geojson.io 预览 URL',
        categoryLabel: 'GIS 地理工具',
      },
    },
  },
};

export function getHomeTools(language: SiteLanguage) {
  return TOOL_SLUGS.map((slug) => {
    const tool = TOOL_CONTENT[slug];

    return {
      slug,
      icon: tool.icon,
      category: tool.category,
      name: tool.copy[language].name,
      description: tool.copy[language].description,
      categoryLabel: tool.copy[language].categoryLabel,
      path: toolPath(slug, language),
    };
  });
}
