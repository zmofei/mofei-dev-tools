import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import JSONExtractPage from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export const metadata: Metadata = createToolMetadata({
  slug: 'json-extract',
  ...getToolSeo('json-extract', 'en'),
});

export default function JSONExtractRoot() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="json-extract" />
      <JSONExtractPage />
    </>
  );
}
