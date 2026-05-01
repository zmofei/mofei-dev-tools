import type { MetadataRoute } from 'next';
import { SITE_URL, TOOL_SLUGS, privacyUrl } from '@/lib/site';
import { BBOX_HREFLANG, BBOX_LANGUAGES, bboxUrl } from '@/lib/bbox-i18n';

const TODAY = '2026-04-30';

const TOOL_CONFIG: Record<(typeof TOOL_SLUGS)[number], { changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }> = {
  base64: { changeFrequency: 'monthly', priority: 0.8 },
  'base64-image': { changeFrequency: 'monthly', priority: 0.8 },
  bbox: { changeFrequency: 'monthly', priority: 0.8 },
  geojson: { changeFrequency: 'monthly', priority: 0.8 },
  'json-format': { changeFrequency: 'weekly', priority: 0.9 },
  'json-extract': { changeFrequency: 'weekly', priority: 0.9 },
  'coordinate-converter': { changeFrequency: 'weekly', priority: 0.9 },
  objectid: { changeFrequency: 'monthly', priority: 0.8 },
  time: { changeFrequency: 'weekly', priority: 0.9 },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const bboxLanguageAlternates = {
    [BBOX_HREFLANG.en]: bboxUrl('en'),
    [BBOX_HREFLANG.zh]: bboxUrl('zh'),
    [BBOX_HREFLANG.de]: bboxUrl('de'),
    [BBOX_HREFLANG.es]: bboxUrl('es'),
    [BBOX_HREFLANG.fr]: bboxUrl('fr'),
    'x-default': bboxUrl('en'),
  };

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
    {
      url: privacyUrl('en'),
      lastModified: TODAY,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          'en-US': privacyUrl('en'),
          'zh-CN': privacyUrl('zh'),
          'x-default': privacyUrl('en'),
        },
      },
    },
    {
      url: privacyUrl('zh'),
      lastModified: TODAY,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          'en-US': privacyUrl('en'),
          'zh-CN': privacyUrl('zh'),
          'x-default': privacyUrl('en'),
        },
      },
    },
  ];

  for (const slug of TOOL_SLUGS) {
    const config = TOOL_CONFIG[slug];
    if (slug === 'bbox') {
      for (const language of BBOX_LANGUAGES) {
        pages.push({
          url: bboxUrl(language),
          lastModified: TODAY,
          changeFrequency: config.changeFrequency,
          priority: config.priority,
          alternates: {
            languages: bboxLanguageAlternates,
          },
        });
      }

      continue;
    }

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
