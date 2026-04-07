import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import BBoxPage from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export const metadata: Metadata = createToolMetadata({
  slug: 'bbox',
  ...getToolSeo('bbox', 'en'),
});

export default function BBoxRoot() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="bbox" />
      <BBoxPage />
    </>
  );
}
