import type { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  
  if (lang === 'zh') {
    return {
      title: '免费坐标转换器 - GIS 坐标系统转换工具 | Mofei 工具',
      description: '在不同地理坐标系统之间转换坐标。支持 WGS84、Web Mercator、UTM 等多种坐标系统，完美适用于 GIS 开发、测量和地图应用。',
      keywords: [
        '坐标转换',
        'GIS 坐标转换',
        '地理坐标转换',
        'WGS84 转换',
        'Web Mercator',
        'UTM 坐标',
        '坐标系统转换',
        '地理坐标系',
        '投影坐标系',
        'GPS 坐标转换',
        '经纬度转换',
        'GIS 工具',
        '测量工具',
        '免费坐标转换',
        '在线坐标工具'
      ].join(', '),
      authors: [{ name: 'Mofei Dev Tools' }],
      category: 'GIS 工具',
      classification: '坐标转换工具',
      openGraph: {
        title: '免费坐标转换器 - GIS 坐标系统转换工具',
        description: '在不同地理坐标系统间转换坐标，支持多种坐标系统。为 GIS 开发者和测量人员提供的免费工具。',
        type: 'website',
        url: 'https://tools.mofei.life/zh/coordinate-converter',
        siteName: 'Mofei Dev Tools',
        locale: 'zh_CN',
        alternateLocale: 'en_US'
      },
      twitter: {
        card: 'summary_large_image',
        site: '@mofei_tools',
        title: '免费坐标转换器 - GIS 坐标系统转换工具',
        description: '在不同地理坐标系统间转换坐标，支持多种坐标系统。为 GIS 开发者和测量人员提供的免费工具。'
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/coordinate-converter',
        languages: {
          'en': 'https://tools.mofei.life/en/coordinate-converter',
          'zh': 'https://tools.mofei.life/zh/coordinate-converter',
          'x-default': 'https://tools.mofei.life/coordinate-converter'
        }
      }
    }
  }
  
  // English version (default)
  return {
    title: 'Free Coordinate Converter - GIS Coordinate System Transformation | Mofei Tools',
    description: 'Convert coordinates between different geographic coordinate systems. Support WGS84, Web Mercator, UTM and more for GIS development and surveying.',
    keywords: [
      'coordinate converter',
      'GIS coordinate conversion',
      'geographic coordinate transformation',
      'WGS84 converter',
      'Web Mercator',
      'UTM coordinates',
      'coordinate system',
      'geographic projection',
      'GPS coordinate conversion',
      'latitude longitude converter',
      'GIS tool',
      'surveying tool',
      'free coordinate converter'
    ].join(', '),
    authors: [{ name: 'Mofei Dev Tools' }],
    category: 'GIS Tools',
    classification: 'Coordinate Conversion Tool',
    alternates: {
      canonical: 'https://tools.mofei.life/en/coordinate-converter',
      languages: {
        'en': 'https://tools.mofei.life/en/coordinate-converter',
        'zh': 'https://tools.mofei.life/zh/coordinate-converter',
        'x-default': 'https://tools.mofei.life/coordinate-converter'
      }
    }
  }
}

export default function CoordinateConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}