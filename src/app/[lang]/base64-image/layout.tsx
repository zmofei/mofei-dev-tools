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

  return createToolMetadata({ slug: 'base64-image', ...TOOL_SEO['base64-image'][lang] })
}

export default function Base64ImageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
