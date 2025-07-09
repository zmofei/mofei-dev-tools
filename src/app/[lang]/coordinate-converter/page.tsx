import type { Metadata } from 'next';
import CoordinateConverterPage from '../../coordinate-converter/page';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  
  if (lang === 'zh') {
    return {
      title: 'GIS坐标转换工具 - 免费在线坐标系统转换器 | Mofei开发工具',
      description: '免费在线GIS坐标转换工具，支持WGS84、GCJ-02（火星坐标）、BD-09（百度坐标）、UTM、Web墨卡托等坐标系统转换。支持十进制度、度分秒格式转换，无需注册。',
      keywords: [
        '坐标转换工具',
        'GIS坐标转换',
        'WGS84转换',
        'GCJ-02转换',
        'BD-09转换',
        'UTM坐标转换',
        'Web墨卡托转换',
        'GPS坐标转换',
        '经纬度转换',
        '度分秒转换',
        '十进制度转换',
        '中国坐标系',
        '火星坐标系',
        '百度坐标系',
        '坐标参考系',
        '地图投影转换',
        '地理空间工具',
        'GIS在线工具',
        '坐标系统转换',
        '空间数据转换',
        '制图工具',
        '测量工具',
        '地图工具',
        '地理坐标系',
        '坐标变换工具',
        '免费GIS工具',
        '在线坐标转换',
        '无需注册',
        '浏览器工具'
      ],
      openGraph: {
        title: 'GIS坐标转换工具 - 免费在线坐标系统转换器',
        description: '免费在线GIS坐标转换工具，支持WGS84、GCJ-02（火星坐标）、BD-09（百度坐标）、UTM、Web墨卡托等坐标系统转换。无需注册，浏览器直接使用。',
        url: 'https://tools.mofei.life/zh/coordinate-converter',
        siteName: 'Mofei开发工具',
        images: [
          {
            url: 'https://tools.mofei.life/og-coordinate-converter-zh.png',
            width: 1200,
            height: 630,
            alt: 'GIS坐标转换工具 - 支持WGS84、GCJ-02、BD-09、UTM、Web墨卡托转换'
          }
        ],
        locale: 'zh_CN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'GIS坐标转换工具 - 免费在线工具',
        description: '支持WGS84、GCJ-02、BD-09、UTM、Web墨卡托坐标转换。免费使用，无需注册。',
        images: ['https://tools.mofei.life/og-coordinate-converter-zh.png'],
        creator: '@mofei',
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/coordinate-converter',
        languages: {
          'en-US': 'https://tools.mofei.life/en/coordinate-converter',
        },
      },
    };
  }
  
  return {
    title: 'GIS Coordinate Converter - Free Online Coordinate System Transformation Tool | Mofei Dev Tools',
    description: 'Free online GIS coordinate converter supporting WGS84, GCJ-02 (Mars), BD-09 (Baidu), UTM, Web Mercator transformations. Convert between decimal degrees, DMS format, and various map projections. No registration required.',
    keywords: [
      'coordinate converter',
      'GIS coordinate transformation',
      'WGS84 converter',
      'GCJ-02 converter',
      'BD-09 converter',
      'UTM coordinate converter',
      'Web Mercator converter',
      'EPSG 3857',
      'GPS coordinate converter',
      'latitude longitude converter',
      'degrees minutes seconds converter',
      'decimal degrees converter',
      'China coordinate system',
      'Mars coordinate system',
      'Baidu coordinate system',
      'coordinate reference system',
      'map projection converter',
      'geospatial tools',
      'GIS tools online',
      'coordinate system transformation',
      'spatial data converter',
      'free GIS tools',
      'online coordinate converter',
      'no registration required',
      'browser-based converter'
    ],
    openGraph: {
      title: 'GIS Coordinate Converter - Free Online Coordinate System Transformation Tool',
      description: 'Free online GIS coordinate converter supporting WGS84, GCJ-02 (Mars), BD-09 (Baidu), UTM, Web Mercator transformations. No registration required, browser-based tool.',
      url: 'https://tools.mofei.life/en/coordinate-converter',
      siteName: 'Mofei Dev Tools',
      images: [
        {
          url: 'https://tools.mofei.life/og-coordinate-converter.png',
          width: 1200,
          height: 630,
          alt: 'GIS Coordinate Converter Tool - Convert between WGS84, GCJ-02, BD-09, UTM, Web Mercator'
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'GIS Coordinate Converter - Free Online Tool',
      description: 'Convert coordinates between WGS84, GCJ-02, BD-09, UTM, Web Mercator. Free, no registration required.',
      images: ['https://tools.mofei.life/og-coordinate-converter.png'],
      creator: '@mofei',
    },
    alternates: {
      canonical: 'https://tools.mofei.life/en/coordinate-converter',
      languages: {
        'zh-CN': 'https://tools.mofei.life/zh/coordinate-converter',
      },
    },
  };
}

export default function LangCoordinateConverterPage() {
  return <CoordinateConverterPage />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}