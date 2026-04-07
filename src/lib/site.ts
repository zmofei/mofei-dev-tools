export const SITE_URL = 'https://tools.mofei.life';

export const TOOL_SLUGS = [
  'base64',
  'bbox',
  'geojson',
  'json-extract',
  'coordinate-converter',
  'objectid',
] as const;

export type SiteLanguage = 'en' | 'zh';
export type ToolSlug = (typeof TOOL_SLUGS)[number];

export function absoluteUrl(path: string = '/') {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${normalizedPath}`;
}

export function homePath(language: SiteLanguage = 'en') {
  return language === 'zh' ? '/zh' : '/';
}

export function toolPath(slug: ToolSlug, language: SiteLanguage = 'en') {
  return language === 'zh' ? `/zh/${slug}` : `/${slug}`;
}

export function homeUrl(language: SiteLanguage = 'en') {
  return absoluteUrl(homePath(language));
}

export function toolUrl(slug: ToolSlug, language: SiteLanguage = 'en') {
  return absoluteUrl(toolPath(slug, language));
}

export function toolAlternates(slug: ToolSlug) {
  return {
    canonical: toolUrl(slug),
    languages: {
      en: toolUrl(slug),
      zh: toolUrl(slug, 'zh'),
      'x-default': toolUrl(slug),
    },
  };
}
