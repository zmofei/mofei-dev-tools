import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  
  if (lang === 'zh') {
    return {
      title: '免费 GeoJSON 预览工具 - 生成 geojson.io 预览链接 | Mofei 工具',
      description: '为 GeoJSON 数据生成 geojson.io 预览链接。快速可视化地理数据、验证 GeoJSON 格式，完美适用于 GIS 开发、地理数据分析和地图应用开发。',
      keywords: [
        'GeoJSON 预览',
        'GeoJSON 工具',
        'geojson.io',
        'GeoJSON 可视化',
        '地理数据预览',
        'GeoJSON 验证',
        'GIS 工具',
        '地理数据工具',
        'GeoJSON 编辑器',
        '地图数据预览',
        'GeoJSON 链接生成',
        '免费 GIS 工具',
        '在线 GeoJSON',
        '地理信息工具',
        'GeoJSON 查看器'
      ].join(', '),
      authors: [{ name: 'Mofei Dev Tools' }],
      category: 'GIS 工具',
      classification: 'GeoJSON 处理工具',
      openGraph: {
        title: '免费 GeoJSON 预览工具 - 生成 geojson.io 预览链接',
        description: '为 GeoJSON 数据生成预览链接，快速可视化地理数据。为 GIS 开发者提供的免费工具。',
        type: 'website',
        url: 'https://tools.mofei.life/zh/geojson',
        siteName: 'Mofei Dev Tools',
        locale: 'zh_CN',
        alternateLocale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        site: '@mofei_tools',
        title: '免费 GeoJSON 预览工具 - 生成 geojson.io 预览链接',
        description: '为 GeoJSON 数据生成预览链接，快速可视化地理数据。为 GIS 开发者提供的免费工具。'
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/geojson',
        languages: {
          'en': 'https://tools.mofei.life/en/geojson',
          'zh': 'https://tools.mofei.life/zh/geojson',
          'x-default': 'https://tools.mofei.life/geojson'
        }
      }
    }
  }
  
  // English version (default)
  return {
    title: 'Free GeoJSON Preview Tool - Generate geojson.io Preview Links | Mofei Tools',
    description: 'Generate geojson.io preview links for GeoJSON data. Quickly visualize geographic data and validate GeoJSON format for GIS development.',
    keywords: [
      'GeoJSON preview',
      'GeoJSON tool',
      'geojson.io',
      'GeoJSON visualization',
      'geographic data preview',
      'GeoJSON validator',
      'GIS tool',
      'geographic data tool',
      'GeoJSON editor',
      'map data preview',
      'GeoJSON link generator',
      'free GIS tool',
      'online GeoJSON'
    ].join(', '),
    authors: [{ name: 'Mofei Dev Tools' }],
    category: 'GIS Tools',
    classification: 'GeoJSON Processing Tool',
    alternates: {
      canonical: 'https://tools.mofei.life/en/geojson',
      languages: {
        'en': 'https://tools.mofei.life/en/geojson',
        'zh': 'https://tools.mofei.life/zh/geojson',
        'x-default': 'https://tools.mofei.life/geojson'
      }
    }
  }
}

export default function GeoJSONLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}