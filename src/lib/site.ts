export const SITE_URL = 'https://tools.mofei.life';

export const TOOL_SLUGS = [
  'base64',
  'base64-image',
  'bbox',
  'geojson',
  'json-format',
  'json-extract',
  'coordinate-converter',
  'objectid',
] as const;

export const SITE_LANGUAGES = ['en', 'zh'] as const;

export type SiteLanguage = (typeof SITE_LANGUAGES)[number];
export type ToolSlug = (typeof TOOL_SLUGS)[number];

export function isSiteLanguage(language: string): language is SiteLanguage {
  return (SITE_LANGUAGES as readonly string[]).includes(language);
}

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

export function privacyPath(language: SiteLanguage = 'en') {
  return language === 'zh' ? '/zh/privacy' : '/privacy';
}

export function toolPath(slug: ToolSlug, language: SiteLanguage = 'en') {
  return language === 'zh' ? `/zh/${slug}` : `/${slug}`;
}

export function homeUrl(language: SiteLanguage = 'en') {
  return absoluteUrl(homePath(language));
}

export function privacyUrl(language: SiteLanguage = 'en') {
  return absoluteUrl(privacyPath(language));
}

export function toolUrl(slug: ToolSlug, language: SiteLanguage = 'en') {
  return absoluteUrl(toolPath(slug, language));
}

export function toolAlternates(slug: ToolSlug, canonicalLanguage: SiteLanguage = 'en') {
  return {
    canonical: toolUrl(slug, canonicalLanguage),
    languages: {
      'en-US': toolUrl(slug),
      'zh-CN': toolUrl(slug, 'zh'),
      'x-default': toolUrl(slug),
    },
  };
}
