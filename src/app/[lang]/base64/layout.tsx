import type { Metadata } from 'next'
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}): Promise<Metadata> {
  const { lang } = await params
  return createToolMetadata({ slug: 'base64', ...getToolSeo('base64', lang === 'zh' ? 'zh' : 'en') })
}

export default function Base64Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
