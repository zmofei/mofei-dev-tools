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

  return createToolMetadata({ slug: 'json-extract', ...TOOL_SEO['json-extract'][lang] })
}

export default function JsonExtractLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
