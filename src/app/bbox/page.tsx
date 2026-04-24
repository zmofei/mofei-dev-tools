import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import BBoxPage from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { BBOX_SEO, bboxAlternateLocales, bboxAlternates, bboxUrl } from '@/lib/bbox-i18n';

export const metadata: Metadata = createToolMetadata({
  slug: 'bbox',
  ...BBOX_SEO.en,
  openGraph: {
    title: BBOX_SEO.en.openGraphTitle,
    description: BBOX_SEO.en.openGraphDescription,
    alternateLocale: bboxAlternateLocales('en'),
  },
  twitter: {
    title: BBOX_SEO.en.openGraphTitle,
    description: BBOX_SEO.en.openGraphDescription,
  },
  canonicalUrl: bboxUrl('en'),
  alternates: bboxAlternates(),
});

export default function BBoxRoot() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="bbox" />
      <BBoxPage language="en" />
    </>
  );
}
