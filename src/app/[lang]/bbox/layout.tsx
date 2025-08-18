import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  
  if (lang === 'zh') {
    return {
      title: '免费边界框绘制工具 - 交互式地图边界框生成器 | Mofei 工具',
      description: '在交互式地图上绘制和生成边界框（BBox）。支持多种格式输出、坐标系统转换，完美适用于 GIS 开发、地理数据分析和地图应用开发。',
      keywords: [
        '边界框工具',
        'BBox 绘制',
        '地理边界框',
        '坐标边界',
        'GIS 工具',
        '地图工具',
        '边界框生成器',
        '地理数据工具',
        'BBox 生成',
        '地图边界',
        '坐标范围',
        'GIS 边界框',
        '地理信息工具',
        '免费 GIS 工具',
        '在线地图工具'
      ].join(', '),
      authors: [{ name: 'Mofei Dev Tools' }],
      category: 'GIS 工具',
      classification: '地理信息工具',
      openGraph: {
        title: '免费边界框绘制工具 - 交互式地图边界框生成器',
        description: '在交互式地图上绘制边界框，支持多种格式输出。为 GIS 开发者提供的免费在线工具。',
        type: 'website',
        url: 'https://tools.mofei.life/zh/bbox',
        siteName: 'Mofei Dev Tools',
        locale: 'zh_CN',
        alternateLocale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        site: '@mofei_tools',
        title: '免费边界框绘制工具 - 交互式地图边界框生成器',
        description: '在交互式地图上绘制边界框，支持多种格式输出。为 GIS 开发者提供的免费在线工具。'
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/bbox',
        languages: {
          'en': 'https://tools.mofei.life/en/bbox',
          'zh': 'https://tools.mofei.life/zh/bbox',
          'x-default': 'https://tools.mofei.life/bbox'
        }
      }
    }
  }
  
  // English version (default)
  return {
    title: 'Free BBox Drawing Tool - Interactive Map Bounding Box Generator | Mofei Tools',
    description: 'Draw and generate bounding boxes on interactive maps. Support multiple output formats and coordinate systems for GIS development and geographic data analysis.',
    keywords: [
      'bbox tool',
      'bounding box',
      'GIS tool',
      'map tool',
      'bbox generator',
      'geographic bounds',
      'coordinate bounds',
      'map bounds',
      'GIS bbox',
      'geographic tool',
      'free GIS',
      'online map tool'
    ].join(', '),
    authors: [{ name: 'Mofei Dev Tools' }],
    category: 'GIS Tools',
    classification: 'Geographic Information Tool',
    alternates: {
      canonical: 'https://tools.mofei.life/en/bbox',
      languages: {
        'en': 'https://tools.mofei.life/en/bbox',
        'zh': 'https://tools.mofei.life/zh/bbox',
        'x-default': 'https://tools.mofei.life/bbox'
      }
    }
  }
}

export default function BBoxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}