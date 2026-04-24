import type { Metadata } from 'next'
import { notFound } from 'next/navigation';
import { createToolMetadata } from '@/lib/metadata';
import { BBOX_SEO, bboxAlternateLocales, bboxAlternates, bboxUrl, isBBoxLanguage } from '@/lib/bbox-i18n';

export const dynamicParams = false;

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  if (!isBBoxLanguage(lang)) {
    notFound();
  }

  const language = lang;
  const seo = BBOX_SEO[language];

  return createToolMetadata({
    slug: 'bbox',
    ...seo,
    openGraph: {
      title: seo.openGraphTitle,
      description: seo.openGraphDescription,
      alternateLocale: bboxAlternateLocales(language),
    },
    twitter: {
      title: seo.openGraphTitle,
      description: seo.openGraphDescription,
    },
    canonicalUrl: bboxUrl(language),
    alternates: {
      ...bboxAlternates(),
      canonical: bboxUrl(language),
    },
  })
}

export default function BBoxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
