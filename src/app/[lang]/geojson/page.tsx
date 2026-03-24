import type { Metadata } from 'next';
import GeoJSONWithRedirect from './GeoJSONWithRedirect';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  
  if (lang === 'zh') {
    return {
      title: 'GeoJSON预览工具 - 免费在线地理数据可视化工具',
      description: '免费的GeoJSON预览工具，一键生成geojson.io预览链接，支持GitHub登录和Gist存储。可视化地理数据，支持大文件，无需下载，在线使用。',
      keywords: ['GeoJSON预览', 'GeoJSON工具', '地理数据可视化', 'geojson.io', 'GitHub Gist', '地图数据', 'GIS工具', '免费工具'],
      openGraph: {
        title: 'GeoJSON预览工具 - 免费在线地理数据可视化工具',
        description: '免费的GeoJSON预览工具，一键生成geojson.io预览链接，支持GitHub登录和Gist存储。',
        locale: 'zh_CN',
      },
      alternates: {
        canonical: 'https://tools.mofei.life/zh/geojson',
        languages: {
          'en-US': 'https://tools.mofei.life/en/geojson',
        },
      },
    };
  }
  
  // English version
  return {
    title: 'GeoJSON Preview Tool - Free Online Geographic Data Visualization',
    description: 'Free GeoJSON preview tool to generate geojson.io preview links instantly. Supports GitHub login and Gist storage for large files. Visualize geographic data online, no download required.',
    keywords: ['GeoJSON preview', 'GeoJSON tool', 'geographic data visualization', 'geojson.io', 'GitHub Gist', 'map data', 'GIS tool', 'free tool'],
    openGraph: {
      title: 'GeoJSON Preview Tool - Free Online Geographic Data Visualization',
      description: 'Free GeoJSON preview tool to generate geojson.io preview links instantly. Supports GitHub login and Gist storage.',
      locale: 'en_US',
    },
    alternates: {
      canonical: 'https://tools.mofei.life/en/geojson',
      languages: {
        'zh-CN': 'https://tools.mofei.life/zh/geojson',
      },
    },
  };
}

export default function LangGeoJSONPage() {
  return <GeoJSONWithRedirect />;
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}