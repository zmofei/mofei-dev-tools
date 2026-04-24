import type { Metadata } from 'next'
import { notFound } from 'next/navigation';
import { createToolMetadata } from '@/lib/metadata';
import { TOOL_SEO } from '@/lib/tool-seo';
import { isSiteLanguage } from '@/lib/site';

export const dynamicParams = false;

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  if (!isSiteLanguage(lang)) {
    notFound();
  }

  return createToolMetadata({ slug: 'geojson', ...TOOL_SEO.geojson[lang] })
}

export default function GeoJSONLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
