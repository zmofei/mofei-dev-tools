import type { Metadata } from 'next'
import { createToolMetadata } from '@/lib/metadata';
import { TOOL_SEO } from '@/lib/tool-seo';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  return createToolMetadata({ slug: 'objectid', ...TOOL_SEO.objectid[lang === 'zh' ? 'zh' : 'en'] })
}

export default function ObjectIdLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
