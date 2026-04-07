import type { Metadata } from 'next'
import { createToolMetadata } from '@/lib/metadata';
import { TOOL_SEO } from '@/lib/tool-seo';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  return createToolMetadata({ slug: 'coordinate-converter', ...TOOL_SEO['coordinate-converter'][lang === 'zh' ? 'zh' : 'en'] })
}

export default function CoordinateConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
