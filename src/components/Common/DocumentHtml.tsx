'use client';

import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { BBOX_HREFLANG, isBBoxLanguage } from '@/lib/bbox-i18n';

// Route params are available during prerendering and update on client navigation.
// Reading request headers here would force every page into dynamic rendering.
export default function DocumentHtml({ children }: { children: ReactNode }) {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang;
  const htmlLang = lang && isBBoxLanguage(lang) ? BBOX_HREFLANG[lang] : 'en-US';

  return <html lang={htmlLang}>{children}</html>;
}
