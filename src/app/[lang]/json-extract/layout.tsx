import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  
  if (lang === 'zh') {
    return {
      title: '免费 JSON 路径提取器 - JSONPath 数据提取工具 | Mofei 工具',
      description: '使用 JSONPath 语法从 JSON 数据中提取特定值。支持批量提取、历史记录、实时预览，完美适用于 API 开发、数据分析和测试工作。',
      keywords: [
        'JSON 路径提取',
        'JSONPath 工具',
        'JSON 数据提取',
        'JSON 解析器',
        'JSONPath 查询',
        'JSON 筛选',
        'API 数据提取',
        'JSON 工具',
        '数据提取工具',
        'JSONPath 语法',
        'JSON 查询工具',
        '免费 JSON 工具',
        '在线 JSON 提取',
        'JSON 数据处理',
        'JSON Path 提取器'
      ].join(', '),
      authors: [{ name: 'Mofei Dev Tools' }],
      category: '开发工具',
      classification: 'JSON 处理工具',
      openGraph: {
        title: '免费 JSON 路径提取器 - JSONPath 数据提取工具',
        description: '使用 JSONPath 语法提取 JSON 数据，支持批量处理和实时预览。为开发者提供的免费工具。',
        type: 'website',
        url: 'https://tools.mofei.life/zh/json-extract',
        siteName: 'Mofei Dev Tools',
        locale: 'zh_CN',
        alternateLocale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        site: '@mofei_tools',
        title: '免费 JSON 路径提取器 - JSONPath 数据提取工具',
        description: '使用 JSONPath 语法提取 JSON 数据，支持批量处理和实时预览。为开发者提供的免费工具。'
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/json-extract',
        languages: {
          'en': 'https://tools.mofei.life/en/json-extract',
          'zh': 'https://tools.mofei.life/zh/json-extract',
          'x-default': 'https://tools.mofei.life/json-extract'
        }
      }
    }
  }
  
  // English version (default)
  return {
    title: 'Free JSON Path Extractor - JSONPath Data Extraction Tool | Mofei Tools',
    description: 'Extract specific values from JSON data using JSONPath syntax. Features batch extraction, history, and real-time preview for API development and data analysis.',
    keywords: [
      'JSON path extractor',
      'JSONPath tool',
      'JSON data extraction',
      'JSON parser',
      'JSONPath query',
      'JSON filter',
      'API data extraction',
      'JSON tool',
      'data extraction tool',
      'JSONPath syntax',
      'JSON query tool',
      'free JSON tool',
      'online JSON extractor'
    ].join(', '),
    authors: [{ name: 'Mofei Dev Tools' }],
    category: 'Developer Tools',
    classification: 'JSON Processing Tool',
    alternates: {
      canonical: 'https://tools.mofei.life/en/json-extract',
      languages: {
        'en': 'https://tools.mofei.life/en/json-extract',
        'zh': 'https://tools.mofei.life/zh/json-extract',
        'x-default': 'https://tools.mofei.life/json-extract'
      }
    }
  }
}

export default function JsonExtractLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}