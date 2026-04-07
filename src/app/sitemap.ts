import type { MetadataRoute } from 'next';
import { SITE_URL, TOOL_SLUGS } from '@/lib/site';

const TODAY = '2026-04-07';

const TOOL_CONFIG: Record<(typeof TOOL_SLUGS)[number], { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = {
  base64: { changeFrequency: 'monthly', priority: 0.8 },
  bbox: { changeFrequency: 'monthly', priority: 0.8 },
  geojson: { changeFrequency: 'monthly', priority: 0.8 },
  'json-extract': { changeFrequency: 'weekly', priority: 0.9 },
  'coordinate-converter': { changeFrequency: 'weekly', priority: 0.9 },
  objectid: { changeFrequency: 'monthly', priority: 0.8 },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 1,
      alternates: {
        languages: {
          'en-US': `${SITE_URL}/`,
          'zh-CN': `${SITE_URL}/zh`,
          'x-default': `${SITE_URL}/`,
        },
      },
    },
    {
      url: `${SITE_URL}/zh`,
      lastModified: TODAY,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          'en-US': `${SITE_URL}/`,
          'zh-CN': `${SITE_URL}/zh`,
          'x-default': `${SITE_URL}/`,
        },
      },
    },
  ];

  for (const slug of TOOL_SLUGS) {
    const config = TOOL_CONFIG[slug];
    pages.push({
      url: `${SITE_URL}/${slug}`,
      lastModified: TODAY,
      changeFrequency: config.changeFrequency,
      priority: config.priority,
      alternates: {
        languages: {
          'en-US': `${SITE_URL}/${slug}`,
          'zh-CN': `${SITE_URL}/zh/${slug}`,
          'x-default': `${SITE_URL}/${slug}`,
        },
      },
    });
    pages.push({
      url: `${SITE_URL}/zh/${slug}`,
      lastModified: TODAY,
      changeFrequency: config.changeFrequency,
      priority: config.priority,
      alternates: {
        languages: {
          'en-US': `${SITE_URL}/${slug}`,
          'zh-CN': `${SITE_URL}/zh/${slug}`,
          'x-default': `${SITE_URL}/${slug}`,
        },
      },
    });
  }

  return pages;
}
