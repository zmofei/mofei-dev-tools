import type { MetadataRoute } from 'next';
import { SITE_URL, TOOL_SLUGS } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/zh', ...TOOL_SLUGS.flatMap((slug) => [`/${slug}`, `/zh/${slug}`])],
      disallow: ['/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
