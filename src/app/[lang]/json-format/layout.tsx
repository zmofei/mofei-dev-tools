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

  return createToolMetadata({ slug: 'json-format', ...TOOL_SEO['json-format'][lang] })
}

export default function JsonFormatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
