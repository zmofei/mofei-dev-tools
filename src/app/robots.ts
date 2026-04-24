import type { MetadataRoute } from 'next';
import { SITE_URL, TOOL_SLUGS } from '@/lib/site';
import { BBOX_LANGUAGES, bboxPath } from '@/lib/bbox-i18n';

export default function robots(): MetadataRoute.Robots {
  const bboxPaths = BBOX_LANGUAGES.map((language) => bboxPath(language));

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/zh', ...TOOL_SLUGS.flatMap((slug) => [`/${slug}`, `/zh/${slug}`]), ...bboxPaths],
      disallow: ['/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
