import type { Metadata } from 'next';
import Foot from '@/components/Common/Foot';
import StructuredData from '@/components/StructuredData';
import HomePageContent from '@/components/HomePageContent';
import { homeUrl } from '@/lib/site';

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  
  if (lang === 'zh') {
    return {
      title: 'Mofei开发工具集合 - 免费在线开发工具',
      description: 'Mofei开发工具集合：Base64编解码、GeoJSON预览、JSON格式化等实用开发工具。免费在线使用，无需注册，支持中英文界面。',
      keywords: ['开发工具', 'Base64编码', 'GeoJSON预览', 'JSON格式化', '在线工具', '免费工具', '前端工具', 'Web开发', 'Mofei'],
      openGraph: {
        title: 'Mofei开发工具集合 - 免费在线开发工具',
        description: 'Base64编解码、GeoJSON预览、JSON格式化等实用开发工具。免费在线使用，无需注册。',
        locale: 'zh_CN',
      },
      alternates: {
        canonical: homeUrl('zh'),
        languages: {
          'en-US': homeUrl('en'),
        },
      },
    };
  }
  
  // English version
  return {
    title: 'Mofei Dev Tools - Free Online Development Tools',
    description: 'Collection of useful development tools: Base64 encoder/decoder, GeoJSON preview, JSON formatter and more. Free online tools, no registration required, bilingual interface.',
    keywords: ['development tools', 'Base64 encoder', 'GeoJSON preview', 'JSON formatter', 'online tools', 'free tools', 'web tools', 'frontend tools', 'Mofei'],
    openGraph: {
      title: 'Mofei Dev Tools - Free Online Development Tools',
      description: 'Base64 encoder/decoder, GeoJSON preview, JSON formatter and more. Free online tools, no registration required.',
      locale: 'en_US',
    },
    alternates: {
      canonical: homeUrl('en'),
      languages: {
        'zh-CN': homeUrl('zh'),
      },
    },
  };
}

export default async function LangPage({ params }: Props) {
  const { lang } = await params;
  const language = lang === 'zh' ? 'zh' : 'en';

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData type="website" language={language} />
      <HomePageContent lang={language} />
      <footer>
        <Foot />
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return [
    { lang: 'en' },
    { lang: 'zh' },
  ];
}
