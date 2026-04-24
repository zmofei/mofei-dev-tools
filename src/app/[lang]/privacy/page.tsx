import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Foot from '@/components/Common/Foot';
import PrivacyPageContent from '@/components/PrivacyPageContent';
import { isSiteLanguage, privacyUrl, SITE_LANGUAGES } from '@/lib/site';

export const dynamicParams = false;

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isSiteLanguage(lang)) {
    notFound();
  }

  return {
    title: lang === 'zh' ? '隐私说明 | Mofei 工具' : 'Privacy | Mofei Dev Tools',
    description:
      lang === 'zh'
        ? 'Mofei Dev Tools 的隐私说明，包括 Google Analytics、本地浏览器处理、分享链接和 GitHub 相关功能。'
        : 'Privacy information for Mofei Dev Tools, including Google Analytics, local browser processing, share links, and GitHub features.',
    alternates: {
      canonical: privacyUrl(lang),
      languages: {
        'en-US': privacyUrl('en'),
        'zh-CN': privacyUrl('zh'),
        'x-default': privacyUrl('en'),
      },
    },
  };
}

export default async function LangPrivacyPage({ params }: Props) {
  const { lang } = await params;
  if (!isSiteLanguage(lang)) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PrivacyPageContent lang={lang} />
      <footer>
        <Foot />
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return SITE_LANGUAGES.map((lang) => ({ lang }));
}
