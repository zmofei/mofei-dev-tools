import type { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import JsonFormatPage from './PageComponent';
import { createToolMetadata } from '@/lib/metadata';
import { getToolSeo } from '@/lib/tool-seo';

export const metadata: Metadata = createToolMetadata({
  slug: 'json-format',
  ...getToolSeo('json-format', 'en'),
});

export default function JsonFormatRoot() {
  return (
    <>
      <StructuredData type="tool" language="en" slug="json-format" />
      <JsonFormatPage />
    </>
  );
}
