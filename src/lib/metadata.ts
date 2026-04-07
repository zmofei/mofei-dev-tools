import type { Metadata } from 'next';
import { toolAlternates, toolUrl, type ToolSlug } from '@/lib/site';

type Locale = 'en_US' | 'zh_CN';

type LocalizedMetadataInput = {
  slug: ToolSlug;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  classification: string;
  locale: Locale;
  openGraph?: {
    title: string;
    description: string;
    images?: NonNullable<Metadata['openGraph']>['images'];
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'player' | 'app';
    site?: string;
    title: string;
    description: string;
    images?: NonNullable<Metadata['twitter']>['images'];
  };
  robots?: Metadata['robots'];
  other?: Metadata['other'];
};

export function createToolMetadata(input: LocalizedMetadataInput): Metadata {
  const language = input.locale === 'zh_CN' ? 'zh' : 'en';

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords.join(', '),
    authors: [{ name: 'Mofei Dev Tools' }],
    category: input.category,
    classification: input.classification,
    openGraph: input.openGraph
      ? {
          title: input.openGraph.title,
          description: input.openGraph.description,
          type: 'website',
          url: toolUrl(input.slug, language),
          siteName: 'Mofei Dev Tools',
          locale: input.locale,
          alternateLocale: input.locale === 'zh_CN' ? 'en_US' : 'zh_CN',
          images: input.openGraph.images,
        }
      : undefined,
    twitter: input.twitter
      ? {
          card: input.twitter.card ?? 'summary_large_image',
          site: input.twitter.site ?? '@mofei_tools',
          title: input.twitter.title,
          description: input.twitter.description,
          images: input.twitter.images,
        }
      : undefined,
    robots: input.robots,
    alternates: toolAlternates(input.slug),
    other: input.other,
  };
}
